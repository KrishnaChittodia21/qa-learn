// The instrumenter for the coding visualiser (see trace.ts for the recorder it calls). Kept in its own module so
// acorn is only downloaded when a learner first asks for a trace.
import { parse } from 'acorn';

type Node = { type: string; start: number; end: number; loc?: { start: { line: number } }; [k: string]: unknown };
interface Decl {
  name: string;
  /** visible to statements that start at or after this position */
  from: number;
}

/** every identifier a binding pattern declares (a, {b, c: d}, [e, ...f], g = 1) */
function patternNames(p: Node | null | undefined, out: string[] = []): string[] {
  if (!p) return out;
  if (p.type === 'Identifier') out.push(p.name as string);
  else if (p.type === 'ObjectPattern') for (const prop of p.properties as Node[]) patternNames((prop.type === 'RestElement' ? prop.argument : prop.value) as Node, out);
  else if (p.type === 'ArrayPattern') for (const el of p.elements as (Node | null)[]) patternNames(el, out);
  else if (p.type === 'RestElement') patternNames(p.argument as Node, out);
  else if (p.type === 'AssignmentPattern') patternNames(p.left as Node, out);
  return out;
}

/** names declared directly in a statement list (let/const/var/function/class), each visible after its own statement */
function listDecls(list: Node[]): Decl[] {
  const out: Decl[] = [];
  for (const s of list) {
    if (s.type === 'VariableDeclaration') for (const d of s.declarations as Node[]) for (const n of patternNames(d.id as Node)) out.push({ name: n, from: s.end });
    else if ((s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') && s.id) out.push({ name: (s.id as Node).name as string, from: s.end });
  }
  return out;
}

const FN = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);
const LOOP = new Set(['ForStatement', 'ForInStatement', 'ForOfStatement', 'WhileStatement', 'DoWhileStatement']);

/**
 * The code with recorder calls added. Throws acorn's SyntaxError (with line and column) when it doesn't parse.
 * Line numbers in the recorded steps are the learner's own lines: every insertion stays on the line it belongs to.
 */
export function instrument(code: string): string {
  const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'script', locations: true, allowAwaitOutsideFunction: true }) as unknown as Node;
  const edits: { at: number; text: string; k: number }[] = [];
  let k = 0;
  const add = (at: number, text: string) => edits.push({ at, text, k: k++ });
  const scopes: Decl[][] = [];
  const fnNames: string[] = ['(top)'];
  const fnName = () => JSON.stringify(fnNames[fnNames.length - 1]);

  const visibleAt = (pos: number) => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (let i = scopes.length - 1; i >= 0; i--)
      for (const d of scopes[i])
        if (d.from <= pos && !seen.has(d.name) && !d.name.startsWith('__')) {
          seen.add(d.name);
          names.push(d.name);
        }
    return names.reverse();
  };
  // a getter, so a name still in its temporal dead zone is skipped instead of throwing
  const getter = (pos: number) =>
    `function(){var o={};${visibleAt(pos)
      .map((n) => `try{o[${JSON.stringify(n)}]=${n}}catch(e){}`)
      .join('')}return o}`;
  const rec = (s: Node) => `__s(${s.loc!.start.line},${fnName()},${getter(s.start)});`;

  const statementList = (list: Node[]) => {
    scopes.push(listDecls(list));
    for (const s of list) {
      if (s.type !== 'FunctionDeclaration' && s.type !== 'ClassDeclaration' && s.type !== 'EmptyStatement') add(s.start, rec(s));
      visit(s);
    }
    scopes.pop();
  };
  /** a body that may be a single statement (if/loop without braces): brace it so a recorder call can go in front */
  const body = (b: Node | null | undefined) => {
    if (!b) return;
    if (b.type === 'BlockStatement') return visit(b);
    add(b.start, `{${rec(b)}`);
    visit(b);
    add(b.end, '}');
  };
  const wrapReturn = (line: number, at: Node, value: Node) => {
    add(value.start, `__r(${line},${fnName()},${getter(at.start)},(`);
    visit(value);
    add(value.end, '))');
  };

  function visit(n: Node | null | undefined): void {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'Program' || n.type === 'BlockStatement' || n.type === 'StaticBlock') return statementList(n.body as Node[]);
    if (FN.has(n.type)) {
      const id = n.id as Node | null;
      fnNames.push(id ? (id.name as string) : 'callback');
      const params = (n.params as Node[]).flatMap((p) => patternNames(p)).map((name) => ({ name, from: n.start }));
      scopes.push(id && n.type === 'FunctionExpression' ? [...params, { name: id.name as string, from: n.start }] : params);
      for (const p of n.params as Node[]) visit(p);
      const b = n.body as Node;
      // an expression body (x => x * 2) is recorded as one returning step
      if (b.type === 'BlockStatement') visit(b);
      else wrapReturn(b.loc!.start.line, b, b);
      scopes.pop();
      fnNames.pop();
      return;
    }
    if (n.type === 'ReturnStatement' && n.argument) return wrapReturn(n.loc!.start.line, n, n.argument as Node);
    if (n.type === 'IfStatement') {
      visit(n.test as Node);
      body(n.consequent as Node);
      const alt = n.alternate as Node | null;
      if (alt?.type === 'IfStatement') visit(alt);
      else body(alt);
      return;
    }
    if (LOOP.has(n.type)) {
      // a loop's own let/const (for (let i …)) is visible inside its body
      const head = (n.init ?? n.left) as Node | undefined;
      const own = head?.type === 'VariableDeclaration' ? (head.declarations as Node[]).flatMap((d) => patternNames(d.id as Node)) : [];
      scopes.push(own.map((name) => ({ name, from: n.start })));
      for (const key of ['init', 'test', 'update', 'left', 'right']) visit(n[key] as Node);
      body(n.body as Node);
      scopes.pop();
      return;
    }
    if (n.type === 'SwitchCase') {
      visit(n.test as Node);
      return statementList(n.consequent as Node[]);
    }
    if (n.type === 'CatchClause') {
      scopes.push(patternNames(n.param as Node).map((name) => ({ name, from: n.start })));
      visit(n.body as Node);
      scopes.pop();
      return;
    }
    for (const key of Object.keys(n)) {
      if (key === 'loc' || key === 'type') continue;
      const v = n[key];
      if (Array.isArray(v)) for (const c of v) visit(c as Node);
      else if (v && typeof v === 'object' && typeof (v as Node).type === 'string') visit(v as Node);
    }
  }

  visit(ast);
  // apply from the end; at the same position, earlier edits stay first
  edits.sort((a, b) => b.at - a.at || b.k - a.k);
  let out = code;
  for (const e of edits) out = out.slice(0, e.at) + e.text + out.slice(e.at);
  return out;
}
