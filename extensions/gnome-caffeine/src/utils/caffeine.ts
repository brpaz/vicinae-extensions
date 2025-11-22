import { $ } from 'execa';

/**
 * Checks if Caffeine mode is enabled.
 * @returns A promise that resolves to true if Caffeine is enabled, false otherwise.
 */
export async function isCaffeineEnabled(): Promise<boolean> {
  const { stdout } = await $('dconf', [
    'read',
    '/org/gnome/shell/extensions/caffeine/cli-toggle',
  ]);
  return stdout.trim() === 'true';
}

/**
 * Toggles the Caffeine mode.
 * @returns A promise that resolves when the operation is complete.
 */
export async function toggleCaffeine(): Promise<void> {
  const currentlyEnabled = await isCaffeineEnabled();
  const newValue = currentlyEnabled ? 'false' : 'true';

  await $('dconf', [
    'write',
    '/org/gnome/shell/extensions/caffeine/cli-toggle',
    newValue,
  ]);
}
