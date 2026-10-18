import {
  Award,
  BadgeCheck,
  BookOpen,
  Bot,
  Braces,
  Briefcase,
  Bug,
  Building2,
  CalendarCheck,
  CircleCheck,
  ClipboardCheck,
  ClipboardList,
  Code2,
  Coffee,
  Compass,
  Crosshair,
  Database,
  Dumbbell,
  Flame,
  Footprints,
  Gauge,
  GitBranch,
  History,
  Lock,
  MessageSquare,
  Moon,
  Rocket,
  ShieldCheck,
  Target,
  Terminal,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { TIER_LABEL, tierRank, type EarnedTier } from '../../content/achievements';

/** glyph keys used by src/content/achievements.ts → lucide icons */
const ART: Record<string, LucideIcon> = {
  footprints: Footprints,
  'clipboard-check': ClipboardCheck,
  check: CircleCheck,
  terminal: Terminal,
  book: BookOpen,
  clipboard: ClipboardList,
  compass: Compass,
  database: Database,
  braces: Braces,
  crosshair: Crosshair,
  branch: GitBranch,
  bot: Bot,
  briefcase: Briefcase,
  rocket: Rocket,
  bug: Bug,
  code: Code2,
  gauge: Gauge,
  dumbbell: Dumbbell,
  message: MessageSquare,
  'badge-check': BadgeCheck,
  shield: ShieldCheck,
  history: History,
  target: Target,
  flame: Flame,
  calendar: CalendarCheck,
  moon: Moon,
  wrench: Wrench,
  coffee: Coffee,
  building: Building2,
};

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** tier pips on the strip: ◆ bronze … ◆◆◆◆ diamond */
const PIPS: Record<EarnedTier, string> = { standard: '', bronze: '◆', silver: '◆◆', gold: '◆◆◆', diamond: '◆◆◆◆' };

interface BadgeProps {
  art: string;
  tier?: EarnedTier;
  locked?: boolean;
  size?: BadgeSize;
  /** exposes the badge as an image with this name; otherwise it is decorative */
  label?: string;
  /** kept for callers of the old API; the gold/diamond foil already moves (and stops for reduced motion) */
  shine?: boolean;
  className?: string;
}

/**
 * Achievement medallion (base.css `.medal`): a hex "certification chip" whose metal escalates with the
 * tier — bronze matte copper → silver steel + sheen → gold + sweeping holo band → diamond rotating foil;
 * locked = dashed etch, no metal. md and larger carry a tier strip, sm a ×2…×4 multiplier.
 */
export default function Badge({ art, tier = 'standard', locked = false, size = 'md', label, className = '' }: BadgeProps) {
  const Glyph = ART[art] ?? Award;
  const t = locked ? 'locked' : tier;
  const big = size === 'md' || size === 'lg' || size === 'xl';
  const tiered = !locked && tier !== 'standard';
  const mult = size === 'sm' && tiered && tierRank(tier) > 0 ? `×${tierRank(tier) + 1}` : '';
  return (
    <span className={`medal ${t} ${size} ${className}`} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      <span className="md-rim" />
      <span className="md-face">
        <Glyph strokeWidth={1.7} aria-hidden="true" />
      </span>
      <svg className="md-etch" viewBox="0 0 100 115.47" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <polygon className="o" points="50.00,1.44 98.75,29.59 98.75,85.88 50.00,114.03 1.25,85.88 1.25,29.59" />
        <polygon className="i" points="50.00,10.39 91.00,34.06 91.00,81.41 50.00,105.08 9.00,81.41 9.00,34.06" />
        <path
          className="s"
          d="M50.00,10.39 L50.00,1.44M91.00,34.06 L98.75,29.59M91.00,81.41 L98.75,85.88M50.00,105.08 L50.00,114.03M9.00,81.41 L1.25,85.88M9.00,34.06 L1.25,29.59"
        />
      </svg>
      <span className="md-pins" />
      {big && tiered && (
        <span className="md-tier">
          <i>{PIPS[tier]}</i>
          {TIER_LABEL[tier].toUpperCase()}
        </span>
      )}
      {mult && <span className="md-x">{mult}</span>}
      {locked && size !== 'xs' && (
        <span className="md-lock">
          <Lock strokeWidth={2} aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
