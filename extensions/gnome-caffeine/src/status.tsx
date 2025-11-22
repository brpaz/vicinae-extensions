import React, { useState, useEffect } from 'react';
import { Detail } from '@vicinae/api';
import { isCaffeineEnabled } from './utils/caffeine';

export default function Command() {
  const [caffeineStatus, setCaffeineStatus] = useState<boolean>(false);
  useEffect(() => {
    (async () => {
      const status = await isCaffeineEnabled();
      setCaffeineStatus(status);
    })();
  }, []);

  return (
    <Detail
      markdown={
        caffeineStatus
          ? '## Caffeine is **Enabled**'
          : '## Caffeine is **Disabled**'
      }
    />
  );
}
