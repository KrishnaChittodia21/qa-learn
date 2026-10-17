import { useCallback, useEffect, useRef, useState } from 'react';
import { evaluateAll, newlyEarned, tierRank, type EarnedTier } from '../content/achievements';
import { achievementCtx } from './achievements';
import { earnAchievements, type Progress } from './progress';

// wait for a burst of updates (an exam's answers + result, a reset) to settle before evaluating
const SETTLE_MS = 600;

export interface Unlocked {
  id: string;
  tier: EarnedTier;
}

/**
 * Achievement detection, used once in Layout. After progress changes it evaluates the catalogue,
 * stores newly earned badges / tier-ups (earnAchievements) and queues them for the celebration
 * overlay. Everything found in one evaluation (e.g. the first load of existing progress) lands in
 * the queue together and is shown as ONE celebration; anything already stored is never celebrated
 * again, and stored badges are never revoked.
 */
export function useAchievementDetection(p: Progress) {
  const [queue, setQueue] = useState<Unlocked[]>([]);
  // `${id}:${tier}` already stored in this session (guards StrictMode's double effects and the
  // window before the store's update comes back round)
  const sent = useRef(new Set<string>());

  useEffect(() => {
    const timer = setTimeout(() => {
      const fresh = newlyEarned(evaluateAll(p, achievementCtx), p.achievements).filter((e) => !sent.current.has(`${e.id}:${e.tier}`));
      if (!fresh.length) return;
      for (const e of fresh) sent.current.add(`${e.id}:${e.tier}`);
      earnAchievements(fresh);
      setQueue((q) => {
        const next = [...q];
        for (const e of fresh) {
          const i = next.findIndex((x) => x.id === e.id);
          if (i === -1) next.push({ id: e.id, tier: e.tier });
          else if (tierRank(e.tier) > tierRank(next[i].tier)) next[i] = { id: e.id, tier: e.tier };
        }
        return next;
      });
    }, SETTLE_MS);
    return () => clearTimeout(timer);
  }, [p]);

  // a reset wipes the stored badges, so they may be earned (and celebrated) again
  useEffect(() => {
    if (!Object.keys(p.achievements ?? {}).length) sent.current.clear();
  }, [p.achievements]);

  const dismiss = useCallback(() => setQueue([]), []);
  return { queue, dismiss };
}
