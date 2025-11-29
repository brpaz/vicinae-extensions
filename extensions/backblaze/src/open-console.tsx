import { open } from '@vicinae/api';

export default function Command() {
  open(`https://secure.backblaze.com/b2_buckets.htm`);
}
