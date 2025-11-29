export type Preferences = {
  applicationKeyId: string;
  applicationKey: string;
};

export type BucketType = 'allPublic' | 'allPrivate';

export type Bucket = {
  id: string;
  name: string;
  type: BucketType;
};

export type ApplicationKey = {
  keyName: string;
  applicationKeyId: string;
  capabilities: string[];
  bucketId: string | null;
  namePrefix: string | null;
  expirationTimestamp: number | null;
};
