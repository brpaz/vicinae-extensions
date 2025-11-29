import React, { useEffect, useState } from 'react';
import {
  ActionPanel,
  Action,
  List,
  getPreferenceValues,
  Toast,
  Icon,
  showToast,
} from '@vicinae/api';
import B2 from 'backblaze-b2';
import { Preferences, Bucket } from './types';
import BucketDetail from './components/bucketDetail';

function mapBuckets(resp: Awaited<ReturnType<B2['listBuckets']>>): Bucket[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (resp.data.buckets || []).map((b: any) => ({
    id: b.bucketId,
    name: b.bucketName,
    type: b.bucketType,
  }));
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const b2 = new B2({
    applicationKeyId: preferences.applicationKeyId,
    applicationKey: preferences.applicationKey,
  });

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        await b2.authorize();

        const resp = await b2.listBuckets();

        setBuckets(mapBuckets(resp));
      } catch (e) {
        console.error(e);
        await showToast({
          style: Toast.Style.Failure,
          title: `Error fetching buckets`,
          message: `Error: ${e instanceof Error ? e.message : String(e)}`,
        });
        setBuckets([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  return (
    <List
      navigationTitle="Buckets"
      isLoading={isLoading}
      isShowingDetail={true}
    >
      {buckets.length === 0 ? (
        !isLoading ? (
          <List.EmptyView title="No buckets found" />
        ) : null
      ) : (
        <List.Section title={`Buckets (${buckets.length})`}>
          {buckets.map((b) => (
            <List.Item
              key={b.id}
              title={b.name}
              detail={<BucketDetail bucket={b} />}
              actions={
                <ActionPanel>
                  <ActionPanel.Section title="Bucket Actions">
                    <Action.OpenInBrowser
                      title="Open in Browser"
                      icon={Icon.Link}
                      url={`https://secure.backblaze.com/b2_browse_files2.htm?bucketId=${b.id}`}
                    />
                    <Action.CopyToClipboard
                      title="Copy Bucket ID"
                      content={b.id}
                    />
                    <Action.CopyToClipboard
                      title="Copy Name"
                      content={b.name}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section title="General Actions">
                    <Action.OpenInBrowser
                      title="Open Backblaze B2"
                      icon={Icon.Globe}
                      url="https://secure.backblaze.com/b2_buckets.htm"
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
