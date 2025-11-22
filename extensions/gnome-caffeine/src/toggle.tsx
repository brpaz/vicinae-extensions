import { showToast, Toast } from '@vicinae/api';
import { toggleCaffeine, isCaffeineEnabled } from './utils/caffeine';

export default async function Command() {
  try {
    await toggleCaffeine();
    const status = await isCaffeineEnabled();
    await showToast({
      style: Toast.Style.Success,
      title: `Caffeine ${status ? 'Enabled' : 'Disabled'}`,
    });
  } catch (error) {
    console.error('Error toggling Caffeine mode:', error);
    await showToast({
      style: Toast.Style.Failure,
      title: 'Failed to Toggle Caffeine Mode',
      message: String(error),
    });
  }
}
