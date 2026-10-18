// Small achievement helpers shared by the badge components and the Achievements page
// (kept out of the component files so fast refresh stays happy).
import { TIER_LABEL, type AchievementEvaluation, type EarnedTier, type StoredAchievement } from '../../content/achievements';

/** what a tier strip / pill says: the tier name, or "Certified" for a single-step badge */
export const tierName = (tier: EarnedTier) => TIER_LABEL[tier] || 'Certified';

/** earned · in progress (started, not yet earned) · locked (not started) */
export type CardState = 'earned' | 'prog' | 'locked';
export const cardState = (stored: StoredAchievement | undefined, ev: AchievementEvaluation): CardState =>
  stored?.tier ? 'earned' : ev.value > 0 ? 'prog' : 'locked';
