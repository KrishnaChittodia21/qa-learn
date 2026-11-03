// The built-in avatars a learner can pick instead of uploading a picture. Stored on the account as `preset:<id>`.
// Shared by the app (which draws them, components/Avatar.tsx) and the service (which accepts only these).
// Copied from system-design-learn's src/lib/avatar-presets.ts.
export const AVATAR_PRESETS = [
  'chimp', 'robot', 'panda', 'fox', 'cat', 'owl', 'penguin', 'frog', 'bunny', 'bear', 'koala', 'lion',
  'tiger', 'dragon', 'ghost', 'alien', 'astronaut', 'ninja', 'octopus', 'sloth', 'unicorn', 'dino', 'mushroom', 'shark',
] as const;
export type AvatarPreset = (typeof AVATAR_PRESETS)[number];

export const PRESET_PREFIX = 'preset:';
export const presetOf = (image: string | null | undefined): AvatarPreset | null => {
  const id = image?.startsWith(PRESET_PREFIX) ? image.slice(PRESET_PREFIX.length) : null;
  return (AVATAR_PRESETS as readonly string[]).includes(id ?? '') ? (id as AvatarPreset) : null;
};
