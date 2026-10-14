// Pure simulation of the JavaScript event loop for a few classic snippets.
// Rules modelled (HTML spec / Node, identical for these snippets):
//  1. the script is one task and runs to completion;
//  2. when the call stack empties, ALL microtasks run, including ones queued while draining;
//  3. then ONE task (macrotask) runs, then microtasks drain again, and so on.
// `await v` suspends the async function; its continuation is queued as a microtask once v is
// resolved (one tick for a non-promise or an already-resolved native promise).
import type { BaseFrame } from '../../core';

export type Op =
  | { k: 'log'; line: number; text: string; predict?: string }
  | { k: 'timeout'; line: number; label: string; body: Op[] }
  | { k: 'then'; line: number; label: string; body: Op[]; predict?: string; next?: { line: number; label: string; body: Op[] } }
  | { k: 'call'; line: number; fn: string; body: Op[] }
  | { k: 'await'; line: number; what: string; resumeLine: number; predict?: string };

export interface Snippet {
  id: SnippetId;
  label: string;
  code: string[];
  program: Op[];
  /** predict shown when the script task has finished */
  afterScript: string;
}

export type SnippetId = 'classic' | 'nested' | 'await';

const log = (line: number, text: string, predict?: string): Op => ({ k: 'log', line, text, predict });

export const SNIPPETS: Record<SnippetId, Snippet> = {
  classic: {
    id: 'classic',
    label: 'log + timeout + promise + async',
    code: [
      "console.log('A');",
      "setTimeout(() => console.log('B'), 0);",
      "Promise.resolve().then(() => console.log('C'));",
      'async function run() {',
      "  console.log('D');",
      '  await null;',
      "  console.log('E');",
      '}',
      'run();',
      "console.log('F');",
    ],
    program: [
      log(0, 'A'),
      { k: 'timeout', line: 1, label: "() => log('B')", body: [log(1, 'B')] },
      { k: 'then', line: 2, label: "() => log('C')", body: [log(2, 'C')] },
      {
        k: 'call',
        line: 8,
        fn: 'run()',
        body: [
          log(4, 'D'),
          { k: 'await', line: 5, what: 'null', resumeLine: 6, predict: "run() hits await. Does 'E' print before or after 'F'?" },
          log(6, 'E'),
        ],
      },
      log(9, 'F'),
    ],
    afterScript: 'The script is done: the task queue holds B, the microtask queue holds C and the rest of run(). What prints next?',
  },
  nested: {
    id: 'nested',
    label: 'microtask inside a timeout',
    code: [
      'setTimeout(() => {',
      "  console.log('T1');",
      "  Promise.resolve().then(() => console.log('P3'));",
      '}, 0);',
      "setTimeout(() => console.log('T2'), 0);",
      'Promise.resolve().then(() => {',
      "  console.log('P1');",
      "  Promise.resolve().then(() => console.log('P2'));",
      '});',
      "console.log('sync');",
    ],
    program: [
      {
        k: 'timeout',
        line: 0,
        label: 'timeout #1',
        body: [
          log(1, 'T1'),
          {
            k: 'then',
            line: 2,
            label: "() => log('P3')",
            body: [log(2, 'P3')],
            predict: 'T1 just queued P3 as a microtask, and T2 is waiting in the task queue. Which prints next?',
          },
        ],
      },
      { k: 'timeout', line: 4, label: "() => log('T2')", body: [log(4, 'T2')] },
      {
        k: 'then',
        line: 5,
        label: 'then #1',
        body: [
          log(6, 'P1'),
          {
            k: 'then',
            line: 7,
            label: "() => log('P2')",
            body: [log(7, 'P2')],
            predict: 'P2 was queued WHILE the microtask queue was draining. Does T1 get to run before P2?',
          },
        ],
      },
      log(9, 'sync'),
    ],
    afterScript: 'Two timers wait in the task queue and one microtask is queued. Which prints first: P1 or T1?',
  },
  await: {
    id: 'await',
    label: 'await in the middle',
    code: [
      'async function step() {',
      "  console.log('S1');",
      '  await Promise.resolve();',
      "  console.log('S2');",
      '  await Promise.resolve();',
      "  console.log('S3');",
      '}',
      'step();',
      'Promise.resolve()',
      "  .then(() => console.log('P1'))",
      "  .then(() => console.log('P2'));",
      "console.log('sync');",
    ],
    program: [
      {
        k: 'call',
        line: 7,
        fn: 'step()',
        body: [
          log(1, 'S1'),
          { k: 'await', line: 2, what: 'Promise.resolve()', resumeLine: 3 },
          log(3, 'S2'),
          {
            k: 'await',
            line: 4,
            what: 'Promise.resolve()',
            resumeLine: 5,
            predict: 'The queue is now [P1, step() resume #2]. What prints next: P1 or S3?',
          },
          log(5, 'S3'),
        ],
      },
      {
        k: 'then',
        line: 9,
        label: "() => log('P1')",
        body: [log(9, 'P1')],
        next: { line: 10, label: "() => log('P2')", body: [log(10, 'P2')] },
      },
      log(11, 'sync'),
    ],
    afterScript: 'Script done. The microtask queue holds the rest of step() and P1. Which line prints next?',
  },
};

export interface Tok {
  id: string;
  label: string;
}

export type Phase = 'script' | 'micro' | 'task' | 'idle' | 'done';

export interface LoopFrame extends BaseFrame {
  line: number;
  stack: Tok[];
  web: Tok[];
  micro: Tok[];
  macro: Tok[];
  out: string[];
  phase: Phase;
  /** console line printed in this frame */
  fresh?: string;
}

interface Exec {
  tok: Tok;
  ops: Op[];
  pc: number;
  /** queued when this callback finishes (promise.then chain) */
  next?: { line: number; label: string; body: Op[] };
  line: number;
}

interface Job {
  tok: Tok;
  ops: Op[];
  line: number;
  next?: Exec['next'];
}

export interface Params {
  snippet: SnippetId;
}

export function simulate({ snippet }: Params): LoopFrame[] {
  const sn = SNIPPETS[snippet];
  const frames: LoopFrame[] = [];
  const stack: Exec[] = [];
  const web: Job[] = [];
  const micro: Job[] = [];
  const macro: Job[] = [];
  const out: string[] = [];
  let phase: Phase = 'script';
  let n = 0;
  const id = (p: string) => `${p}${n++}`;
  const names = (q: Job[]) => q.map((j) => j.tok);

  const push = (line: number, caption: string, predict?: string, fresh?: string) =>
    frames.push({
      line,
      stack: stack.map((e) => e.tok),
      web: names(web),
      micro: names(micro),
      macro: names(macro),
      out: [...out],
      phase,
      caption,
      predict,
      fresh,
    });

  const queueMicro = (label: string, ops: Op[], line: number, nx?: Exec['next']) =>
    micro.push({ tok: { id: id('m'), label }, ops, line, next: nx });

  // run the stack until it is empty, one frame per op
  const runStack = () => {
    while (stack.length) {
      const top = stack[stack.length - 1];
      if (top.pc >= top.ops.length) {
        stack.pop();
        let extra = '';
        if (top.next) {
          queueMicro(top.next.label, top.next.body, top.next.line);
          extra = ` Its .then() promise resolves, so the next callback in the chain (${top.next.label}) joins the microtask queue.`;
        }
        push(-1, `${top.tok.label} returns and is popped off the call stack.${extra}`);
        continue;
      }
      const op = top.ops[top.pc++];
      switch (op.k) {
        case 'log':
          out.push(op.text);
          push(op.line, `console.log prints '${op.text}' synchronously.`, op.predict, op.text);
          break;
        case 'timeout':
          web.push({ tok: { id: id('t'), label: op.label }, ops: op.body, line: op.line });
          push(op.line, `setTimeout hands ${op.label} to the timer Web API (0 ms). The callback does NOT run now; it can only run as a later task.`);
          break;
        case 'then':
          queueMicro(op.label, op.body, op.line, op.next);
          push(op.line, `The promise is already resolved, so .then(${op.label}) queues its callback as a MICROTASK right away.`, op.predict);
          break;
        case 'call':
          stack.push({ tok: { id: id('f'), label: op.fn }, ops: op.body, pc: 0, line: op.line });
          push(op.line, `${op.fn} is called: a new frame is pushed onto the call stack and its body starts running synchronously.`);
          break;
        case 'await': {
          stack.pop();
          const rest = top.ops.slice(top.pc);
          queueMicro(`${top.tok.label.replace(/ resume.*$/, '')} resume`, rest, op.resumeLine);
          push(
            op.line,
            `await ${op.what}: the value is already settled, so the rest of ${top.tok.label.replace(/ resume.*$/, '')} is queued as a microtask and the function is popped, returning a pending promise to its caller.`,
            op.predict,
          );
          break;
        }
      }
    }
  };

  stack.push({ tok: { id: id('s'), label: 'main script' }, ops: sn.program, pc: 0, line: 0 });
  push(-1, 'The whole script is one task: it is pushed onto the call stack and runs top to bottom without interruption.');
  runStack();

  const expire = () => {
    if (!web.length) return;
    macro.push(...web.splice(0));
    push(-1, 'The 0 ms timers have elapsed, so their callbacks move from the Web API into the task queue. They still wait: a task only starts when the stack is empty and every microtask has run.');
  };

  const runJob = (j: Job, kind: 'micro' | 'task', predict?: string) => {
    stack.push({ tok: j.tok, ops: j.ops, pc: 0, line: j.line, next: j.next });
    push(
      j.line,
      kind === 'micro'
        ? `Stack empty, so the event loop takes the oldest microtask: ${j.tok.label} is pushed onto the stack.`
        : `Microtask queue is empty, so the loop takes ONE task from the task queue: ${j.tok.label}.`,
      predict,
    );
    runStack();
  };

  let firstIdle = true;
  for (let guard = 0; guard < 50; guard++) {
    expire();
    if (micro.length) {
      phase = 'micro';
      if (firstIdle) {
        frames[frames.length - 1].predict ??= sn.afterScript;
        firstIdle = false;
      }
      while (micro.length) runJob(micro.shift()!, 'micro');
      phase = 'idle';
      push(-1, macro.length ? 'Microtask queue drained (including microtasks queued while draining). Only now may the next task run.' : 'Microtask queue drained.');
      continue;
    }
    if (macro.length) {
      phase = 'task';
      const j = macro.shift()!;
      runJob(j, 'task');
      phase = 'idle';
      continue;
    }
    break;
  }
  phase = 'done';
  push(-1, `All queues empty; the loop idles. Final console order: ${out.join(' → ')}.`);
  return frames;
}

/** the console order the simulation predicts (used by tests) */
export function finalOrder(s: SnippetId): string[] {
  const f = simulate({ snippet: s });
  return f[f.length - 1].out;
}
