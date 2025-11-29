import React from 'react';
import { List } from '@vicinae/api';
import { Bucket } from '../types';

export default function BucketDetail({ bucket }: { bucket: Bucket }) {
  return (
    <List.Item.Detail
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Name" text={bucket.name} />
          <List.Item.Detail.Metadata.Label title="ID" text={bucket.id} />
          <List.Item.Detail.Metadata.Label title="Type" text={bucket.type} />
        </List.Item.Detail.Metadata>
      }
    />
  );
}
