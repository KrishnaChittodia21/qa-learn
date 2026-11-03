import type { ReactNode } from 'react';
import { presetOf, type AvatarPreset } from '../lib/avatar-presets';

// The built-in avatars: original cartoon characters drawn as small inline SVGs on a 64×64 grid, so they stay crisp at
// any size and cost no downloads. They share eyes, blush and smile parts so they read as one family.

const INK = '#1f2937';

function Eyes({ y = 30, dx = 8, r = 3, fill = INK }: { y?: number; dx?: number; r?: number; fill?: string }) {
  return (
    <>
      <circle cx={32 - dx} cy={y} r={r} fill={fill} />
      <circle cx={32 + dx} cy={y} r={r} fill={fill} />
      <circle cx={32 - dx + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
      <circle cx={32 + dx + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
    </>
  );
}
function Blush({ y = 38, dx = 13, fill = '#fb7185' }: { y?: number; dx?: number; fill?: string }) {
  return (
    <>
      <ellipse cx={32 - dx} cy={y} rx="3.4" ry="2.1" fill={fill} opacity="0.5" />
      <ellipse cx={32 + dx} cy={y} rx="3.4" ry="2.1" fill={fill} opacity="0.5" />
    </>
  );
}
function Smile({ y = 40, w = 4, stroke = INK }: { y?: number; w?: number; stroke?: string }) {
  return <path d={`M${32 - w} ${y} Q32 ${y + w * 0.9} ${32 + w} ${y}`} stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" />;
}
const Bg = ({ fill }: { fill: string }) => <circle cx="32" cy="32" r="32" fill={fill} />;

export const AVATARS: Record<AvatarPreset, { label: string; art: ReactNode }> = {
  chimp: {
    label: 'Chimp',
    art: (
      <>
        <Bg fill="#fde68a" />
        <circle cx="12" cy="33" r="7" fill="#8b5a3c" />
        <circle cx="52" cy="33" r="7" fill="#8b5a3c" />
        <circle cx="12" cy="33" r="4" fill="#e8b48a" />
        <circle cx="52" cy="33" r="4" fill="#e8b48a" />
        <circle cx="32" cy="35" r="19" fill="#8b5a3c" />
        <circle cx="25.5" cy="31" r="7.5" fill="#e8b48a" />
        <circle cx="38.5" cy="31" r="7.5" fill="#e8b48a" />
        <ellipse cx="32" cy="41" rx="13" ry="9.5" fill="#e8b48a" />
        <Eyes y={31} dx={6.5} r={2.6} />
        <circle cx="30" cy="38.5" r="1.1" fill="#5b3a26" />
        <circle cx="34" cy="38.5" r="1.1" fill="#5b3a26" />
        <Smile y={43} w={5} stroke="#5b3a26" />
      </>
    ),
  },
  robot: {
    label: 'Robot',
    art: (
      <>
        <Bg fill="#bae6fd" />
        <line x1="32" y1="9" x2="32" y2="16" stroke="#64748b" strokeWidth="2.4" />
        <circle cx="32" cy="8" r="3.4" fill="#f43f5e" />
        <rect x="9" y="27" width="6" height="11" rx="2" fill="#94a3b8" />
        <rect x="49" y="27" width="6" height="11" rx="2" fill="#94a3b8" />
        <rect x="14" y="16" width="36" height="33" rx="9" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        <rect x="19" y="22" width="26" height="14" rx="7" fill="#0f172a" />
        <circle cx="26" cy="29" r="3.2" fill="#22d3ee" />
        <circle cx="38" cy="29" r="3.2" fill="#22d3ee" />
        <circle cx="27" cy="28" r="1" fill="#fff" />
        <circle cx="39" cy="28" r="1" fill="#fff" />
        <rect x="24" y="40" width="16" height="4.5" rx="2.2" fill="#94a3b8" />
        <line x1="28" y1="40" x2="28" y2="44.5" stroke="#e2e8f0" strokeWidth="1.2" />
        <line x1="32" y1="40" x2="32" y2="44.5" stroke="#e2e8f0" strokeWidth="1.2" />
        <line x1="36" y1="40" x2="36" y2="44.5" stroke="#e2e8f0" strokeWidth="1.2" />
        <Blush y={39} dx={14} fill="#f472b6" />
      </>
    ),
  },
  panda: {
    label: 'Panda',
    art: (
      <>
        <Bg fill="#d9f99d" />
        <circle cx="16" cy="18" r="7.5" fill={INK} />
        <circle cx="48" cy="18" r="7.5" fill={INK} />
        <circle cx="32" cy="35" r="20" fill="#fff" />
        <ellipse cx="24" cy="33" rx="5.5" ry="7" fill={INK} transform="rotate(-25 24 33)" />
        <ellipse cx="40" cy="33" rx="5.5" ry="7" fill={INK} transform="rotate(25 40 33)" />
        <circle cx="24.5" cy="32" r="2.3" fill="#fff" />
        <circle cx="39.5" cy="32" r="2.3" fill="#fff" />
        <circle cx="25" cy="32.3" r="1.2" fill={INK} />
        <circle cx="39" cy="32.3" r="1.2" fill={INK} />
        <ellipse cx="32" cy="40" rx="3.2" ry="2.2" fill={INK} />
        <Smile y={43} w={3} />
        <Blush y={40} dx={14} />
      </>
    ),
  },
  fox: {
    label: 'Fox',
    art: (
      <>
        <Bg fill="#ccfbf1" />
        <path d="M12 26 L17 6 L29 18 Z" fill="#f97316" />
        <path d="M52 26 L47 6 L35 18 Z" fill="#f97316" />
        <path d="M16 21 L18.5 11 L25 18 Z" fill="#7c2d12" />
        <path d="M48 21 L45.5 11 L39 18 Z" fill="#7c2d12" />
        <path d="M9 27 Q32 8 55 27 Q52 46 32 55 Q12 46 9 27 Z" fill="#f97316" />
        <path d="M11 31 Q24 37 32 55 Q16 49 11 31 Z" fill="#fff7ed" />
        <path d="M53 31 Q40 37 32 55 Q48 49 53 31 Z" fill="#fff7ed" />
        <Eyes y={31} dx={9} r={2.8} />
        <circle cx="32" cy="45" r="2.8" fill={INK} />
        <Blush y={38} dx={14} />
      </>
    ),
  },
  cat: {
    label: 'Cat',
    art: (
      <>
        <Bg fill="#e9d5ff" />
        <path d="M13 28 L15 9 L28 19 Z" fill="#9ca3af" />
        <path d="M51 28 L49 9 L36 19 Z" fill="#9ca3af" />
        <path d="M17 22 L18 14 L24 19 Z" fill="#f9a8d4" />
        <path d="M47 22 L46 14 L40 19 Z" fill="#f9a8d4" />
        <circle cx="32" cy="36" r="19" fill="#9ca3af" />
        <path d="M28 19 v5 M32 18 v6 M36 19 v5" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
        <Eyes y={33} dx={7.5} r={3} fill="#3f6212" />
        <path d="M30 39 L34 39 L32 41.5 Z" fill="#f472b6" />
        <path d="M28 43 Q30 45 32 43 Q34 45 36 43" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M9 38 h9 M9 42 l9 -2 M55 38 h-9 M55 42 l-9 -2" stroke="#4b5563" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
  },
  owl: {
    label: 'Owl',
    art: (
      <>
        <Bg fill="#fef3c7" />
        <path d="M14 18 L18 8 L24 16 Z M50 18 L46 8 L40 16 Z" fill="#92400e" />
        <circle cx="32" cy="36" r="21" fill="#a16207" />
        <ellipse cx="32" cy="46" rx="11" ry="9" fill="#fde68a" />
        <path d="M27 45 q2.5 2 5 0 q2.5 2 5 0 M27 49 q2.5 2 5 0 q2.5 2 5 0" stroke="#d97706" strokeWidth="1.3" fill="none" />
        <circle cx="23" cy="31" r="8.5" fill="#fff" />
        <circle cx="41" cy="31" r="8.5" fill="#fff" />
        <Eyes y={31} dx={9} r={4.2} />
        <path d="M29 37 L35 37 L32 42 Z" fill="#f59e0b" />
      </>
    ),
  },
  penguin: {
    label: 'Penguin',
    art: (
      <>
        <Bg fill="#bfdbfe" />
        <circle cx="32" cy="35" r="21" fill={INK} />
        <circle cx="25.5" cy="34" r="9" fill="#fff" />
        <circle cx="38.5" cy="34" r="9" fill="#fff" />
        <ellipse cx="32" cy="43" rx="12" ry="9" fill="#fff" />
        <Eyes y={33} dx={6.5} r={2.5} />
        <path d="M28 38.5 L36 38.5 L32 43.5 Z" fill="#f59e0b" />
        <Blush y={40} dx={12} />
      </>
    ),
  },
  frog: {
    label: 'Frog',
    art: (
      <>
        <Bg fill="#fbcfe8" />
        <circle cx="20" cy="22" r="9" fill="#4ade80" />
        <circle cx="44" cy="22" r="9" fill="#4ade80" />
        <ellipse cx="32" cy="39" rx="23" ry="17" fill="#4ade80" />
        <circle cx="20" cy="22" r="6" fill="#fff" />
        <circle cx="44" cy="22" r="6" fill="#fff" />
        <Eyes y={22} dx={12} r={3.2} />
        <path d="M17 40 Q32 54 47 40" stroke="#166534" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <Blush y={41} dx={18} fill="#f472b6" />
      </>
    ),
  },
  bunny: {
    label: 'Bunny',
    art: (
      <>
        <Bg fill="#ccfbf1" />
        <ellipse cx="24" cy="15" rx="5.5" ry="14" fill="#fafaf9" transform="rotate(-8 24 15)" />
        <ellipse cx="40" cy="15" rx="5.5" ry="14" fill="#fafaf9" transform="rotate(8 40 15)" />
        <ellipse cx="24" cy="16" rx="2.6" ry="9" fill="#fda4af" transform="rotate(-8 24 16)" />
        <ellipse cx="40" cy="16" rx="2.6" ry="9" fill="#fda4af" transform="rotate(8 40 16)" />
        <circle cx="32" cy="39" r="18" fill="#fafaf9" />
        <Eyes y={37} dx={7} r={2.6} />
        <ellipse cx="32" cy="43" rx="2.2" ry="1.6" fill="#f472b6" />
        <path d="M29 46 Q32 48.5 35 46" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <Blush y={44} dx={11} />
      </>
    ),
  },
  bear: {
    label: 'Bear',
    art: (
      <>
        <Bg fill="#fecdd3" />
        <circle cx="16" cy="20" r="7.5" fill="#92400e" />
        <circle cx="48" cy="20" r="7.5" fill="#92400e" />
        <circle cx="16" cy="20" r="4" fill="#fbbf77" />
        <circle cx="48" cy="20" r="4" fill="#fbbf77" />
        <circle cx="32" cy="36" r="20" fill="#b45309" />
        <ellipse cx="32" cy="42" rx="9.5" ry="7.5" fill="#fde68a" />
        <ellipse cx="32" cy="39" rx="3.3" ry="2.5" fill="#3f2a1d" />
        <Eyes y={31} dx={8} r={2.6} />
        <Smile y={43.5} w={3} stroke="#3f2a1d" />
        <Blush y={39} dx={15} />
      </>
    ),
  },
  koala: {
    label: 'Koala',
    art: (
      <>
        <Bg fill="#dbeafe" />
        <circle cx="13" cy="26" r="10" fill="#9ca3af" />
        <circle cx="51" cy="26" r="10" fill="#9ca3af" />
        <circle cx="13" cy="26" r="6" fill="#f3f4f6" />
        <circle cx="51" cy="26" r="6" fill="#f3f4f6" />
        <circle cx="32" cy="37" r="18" fill="#9ca3af" />
        <Eyes y={32} dx={8.5} r={2.4} />
        <ellipse cx="32" cy="39" rx="5" ry="6.5" fill="#374151" />
        <ellipse cx="30.5" cy="37" rx="1.4" ry="2" fill="#6b7280" />
        <Smile y={47} w={3} />
        <Blush y={41} dx={13} />
      </>
    ),
  },
  lion: {
    label: 'Lion',
    art: (
      <>
        <Bg fill="#ccfbf1" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={32 + Math.cos(a) * 18} cy={35 + Math.sin(a) * 18} r="8" fill={i % 2 ? '#c2410c' : '#ea580c'} />;
        })}
        <circle cx="32" cy="35" r="18" fill="#ea580c" />
        <circle cx="21" cy="22" r="4.5" fill="#fbbf24" />
        <circle cx="43" cy="22" r="4.5" fill="#fbbf24" />
        <circle cx="32" cy="36" r="15" fill="#fbbf24" />
        <ellipse cx="32" cy="42" rx="8" ry="6" fill="#fef3c7" />
        <path d="M29.5 38.5 L34.5 38.5 L32 41.5 Z" fill="#7c2d12" />
        <Eyes y={32} dx={6.5} r={2.4} />
        <Smile y={44} w={3} stroke="#7c2d12" />
      </>
    ),
  },
  tiger: {
    label: 'Tiger',
    art: (
      <>
        <Bg fill="#dcfce7" />
        <circle cx="16" cy="20" r="7" fill="#fb923c" />
        <circle cx="48" cy="20" r="7" fill="#fb923c" />
        <circle cx="16" cy="20" r="3.5" fill="#fff7ed" />
        <circle cx="48" cy="20" r="3.5" fill="#fff7ed" />
        <circle cx="32" cy="36" r="20" fill="#fb923c" />
        <path d="M32 16 v6 M26 17 l1.5 5 M38 17 l-1.5 5 M12 34 h6 M12 39 l6 -1.5 M52 34 h-6 M52 39 l-6 -1.5" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="32" cy="43" rx="10" ry="7.5" fill="#fff7ed" />
        <Eyes y={31} dx={8} r={2.7} fill="#365314" />
        <path d="M29.5 39 L34.5 39 L32 42 Z" fill="#f472b6" />
        <Smile y={44} w={3} />
      </>
    ),
  },
  dragon: {
    label: 'Baby dragon',
    art: (
      <>
        <Bg fill="#e0f2fe" />
        <path d="M18 18 L14 6 L24 14 Z M46 18 L50 6 L40 14 Z" fill="#fde68a" />
        <path d="M26 16 L29 9 L32 16 L35 9 L38 16 Z" fill="#15803d" />
        <ellipse cx="32" cy="35" rx="20" ry="18" fill="#22c55e" />
        <ellipse cx="32" cy="45" rx="12" ry="7.5" fill="#86efac" />
        <circle cx="28.5" cy="43.5" r="1.2" fill="#15803d" />
        <circle cx="35.5" cy="43.5" r="1.2" fill="#15803d" />
        <Eyes y={31} dx={8} r={3.2} />
        <path d="M27 48 Q32 51 37 48" stroke="#15803d" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <Blush y={38} dx={15} />
      </>
    ),
  },
  ghost: {
    label: 'Ghost',
    art: (
      <>
        <Bg fill="#c7d2fe" />
        <path d="M15 56 V30 Q15 11 32 11 Q49 11 49 30 V56 l-5.7 -5 -5.6 5 -5.7 -5 -5.7 5 -5.6 -5 Z" fill="#fff" />
        <ellipse cx="26" cy="30" rx="2.8" ry="3.6" fill={INK} />
        <ellipse cx="38" cy="30" rx="2.8" ry="3.6" fill={INK} />
        <circle cx="27" cy="29" r="0.9" fill="#fff" />
        <circle cx="39" cy="29" r="0.9" fill="#fff" />
        <ellipse cx="32" cy="38" rx="2.6" ry="3" fill={INK} />
        <Blush y={35} dx={12} fill="#a78bfa" />
      </>
    ),
  },
  alien: {
    label: 'Alien',
    art: (
      <>
        <Bg fill="#ede9fe" />
        <path d="M24 16 L19 6 M40 16 L45 6" stroke="#65a30d" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="19" cy="6" r="3.2" fill="#a3e635" />
        <circle cx="45" cy="6" r="3.2" fill="#a3e635" />
        <path d="M12 30 Q12 12 32 12 Q52 12 52 30 Q52 50 32 55 Q12 50 12 30 Z" fill="#a3e635" />
        <ellipse cx="23.5" cy="32" rx="6" ry="8.5" fill={INK} transform="rotate(-25 23.5 32)" />
        <ellipse cx="40.5" cy="32" rx="6" ry="8.5" fill={INK} transform="rotate(25 40.5 32)" />
        <circle cx="25" cy="29" r="1.8" fill="#fff" />
        <circle cx="42" cy="29" r="1.8" fill="#fff" />
        <Smile y={45} w={3} stroke="#365314" />
      </>
    ),
  },
  astronaut: {
    label: 'Astronaut',
    art: (
      <>
        <Bg fill="#1e293b" />
        <circle cx="10" cy="14" r="1.2" fill="#fde68a" />
        <circle cx="54" cy="10" r="1" fill="#fff" />
        <circle cx="56" cy="44" r="1.3" fill="#fde68a" />
        <circle cx="8" cy="46" r="1" fill="#fff" />
        <circle cx="32" cy="34" r="21" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="16" y="23" width="32" height="22" rx="11" fill="#0ea5e9" />
        <rect x="16" y="23" width="32" height="22" rx="11" fill="url(#visor)" />
        <path d="M21 30 Q24 26 29 26" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
        <Eyes y={35} dx={6} r={2.3} fill="#082f49" />
        <Smile y={39} w={2.5} stroke="#082f49" />
        <circle cx="32" cy="11" r="2.4" fill="#f43f5e" />
        <defs>
          <linearGradient id="visor" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.6" />
            <stop offset="1" stopColor="#0369a1" stopOpacity="0" />
          </linearGradient>
        </defs>
      </>
    ),
  },
  ninja: {
    label: 'Ninja',
    art: (
      <>
        <Bg fill="#fecaca" />
        <circle cx="32" cy="34" r="20" fill={INK} />
        <rect x="12" y="19" width="40" height="5.5" rx="2" fill="#ef4444" />
        <path d="M50 22 L60 17 M50 23 L59 27" stroke="#ef4444" strokeWidth="3.2" strokeLinecap="round" />
        <rect x="14" y="28" width="36" height="11" rx="5.5" fill="#fde2c4" />
        <Eyes y={33.5} dx={7} r={2.4} />
        <path d="M21 29.5 l6 1.6 M43 29.5 l-6 1.6" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  },
  octopus: {
    label: 'Octopus',
    art: (
      <>
        <Bg fill="#a5f3fc" />
        {[13, 22, 32, 42, 51].map((x, i) => (
          <ellipse key={x} cx={x} cy={i % 2 ? 50 : 48} rx="5" ry="8" fill="#ec4899" />
        ))}
        <ellipse cx="32" cy="29" rx="18" ry="17" fill="#f472b6" />
        <circle cx="24" cy="18" r="2.4" fill="#fbcfe8" />
        <circle cx="41" cy="21" r="1.8" fill="#fbcfe8" />
        <Eyes y={30} dx={7} r={2.8} />
        <Smile y={37} w={3.5} />
        <Blush y={35} dx={12} fill="#be185d" />
      </>
    ),
  },
  sloth: {
    label: 'Sloth',
    art: (
      <>
        <Bg fill="#d9f99d" />
        <circle cx="32" cy="34" r="20" fill="#a8a29e" />
        <ellipse cx="32" cy="36" rx="15" ry="12" fill="#e7e5e4" />
        <ellipse cx="24" cy="34" rx="6" ry="4" fill="#57534e" transform="rotate(18 24 34)" />
        <ellipse cx="40" cy="34" rx="6" ry="4" fill="#57534e" transform="rotate(-18 40 34)" />
        <path d="M22 34 Q24 36 26 34 M38 34 Q40 36 42 34" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <ellipse cx="32" cy="38.5" rx="3" ry="2.2" fill="#44403c" />
        <Smile y={42} w={3.5} stroke="#44403c" />
      </>
    ),
  },
  unicorn: {
    label: 'Unicorn',
    art: (
      <>
        <Bg fill="#fae8ff" />
        <circle cx="16" cy="26" r="7" fill="#f472b6" />
        <circle cx="14" cy="36" r="6" fill="#a78bfa" />
        <circle cx="17" cy="45" r="5.5" fill="#60a5fa" />
        <path d="M22 22 L20 11 L29 18 Z M42 22 L44 11 L35 18 Z" fill="#fff" />
        <circle cx="32" cy="37" r="17" fill="#fff" />
        <path d="M32 4 L27 22 L37 22 Z" fill="#facc15" />
        <path d="M29 16 L35 14 M28 19.5 L36 17.5" stroke="#eab308" strokeWidth="1.3" />
        <path d="M25 35 Q27.5 32 30 35 M34 35 Q36.5 32 39 35" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        <Smile y={42} w={3.5} />
        <Blush y={40} dx={11} />
      </>
    ),
  },
  dino: {
    label: 'Baby dino',
    art: (
      <>
        <Bg fill="#fef9c3" />
        <path d="M20 19 L24 10 L28 17 L32 8 L36 17 L40 10 L44 19 Z" fill="#2563eb" />
        <ellipse cx="32" cy="36" rx="21" ry="18" fill="#60a5fa" />
        <Eyes y={30} dx={8} r={3} />
        <path d="M18 41 Q32 53 46 41 Z" fill="#1e3a8a" />
        <path d="M22 42 l2.5 3 2.5 -3 M37 42 l2.5 3 2.5 -3" fill="#fff" />
        <circle cx="29" cy="36.5" r="1.1" fill="#1e3a8a" />
        <circle cx="35" cy="36.5" r="1.1" fill="#1e3a8a" />
      </>
    ),
  },
  mushroom: {
    label: 'Mushroom sprite',
    art: (
      <>
        <Bg fill="#dcfce7" />
        <rect x="18" y="29" width="28" height="26" rx="11" fill="#fef3c7" />
        <path d="M7 34 Q7 9 32 9 Q57 9 57 34 Q32 38 7 34 Z" fill="#ef4444" />
        <circle cx="20" cy="22" r="4" fill="#fff" />
        <circle cx="35" cy="16" r="3.2" fill="#fff" />
        <circle cx="46" cy="25" r="3.6" fill="#fff" />
        <Eyes y={42} dx={6} r={2.4} />
        <Smile y={47} w={3} />
        <Blush y={46} dx={10} />
      </>
    ),
  },
  shark: {
    label: 'Shark',
    art: (
      <>
        <Bg fill="#bae6fd" />
        <path d="M32 6 L22 24 L42 24 Z" fill="#475569" />
        <ellipse cx="32" cy="38" rx="22" ry="17" fill="#64748b" />
        <ellipse cx="32" cy="46" rx="15" ry="8.5" fill="#f1f5f9" />
        <Eyes y={33} dx={9} r={2.7} />
        <path d="M23 45 Q32 51 41 45" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M26 45.5 l1.5 2.2 1.5 -2 M35 46 l1.5 2 1.5 -2.2" fill="#fff" stroke="#fff" strokeWidth="0.6" />
        <Blush y={39} dx={15} />
      </>
    ),
  },
};

/** "Krishna Chittodia" → KC, "krishna@x.com" → K */
export const initials = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, name.includes('@') ? 1 : 2)
    .map((w) => w[0].toUpperCase())
    .join('');

/** One built-in avatar, filling its circle. */
export function AvatarArt({ id }: { id: AvatarPreset }) {
  return (
    <svg className="avatar-preset" viewBox="0 0 64 64" aria-hidden focusable="false">
      {AVATARS[id].art}
    </svg>
  );
}

/** What sits inside an avatar circle: a built-in avatar, an uploaded picture, or the initials. */
export function AvatarFace({ image, name }: { image?: string | null; name: string }) {
  const preset = presetOf(image);
  if (preset) return <AvatarArt id={preset} />;
  // an uploaded picture; anything else (e.g. a retired built-in avatar) falls back to the initials
  if (image?.startsWith('https://')) return <img src={image} alt="" />;
  return <>{initials(name)}</>;
}
