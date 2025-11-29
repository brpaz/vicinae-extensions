import { KeyEntry } from "types";
import { $ } from "execa";

/**
 * Lists GPG keys by parsing the output of `gpg --list-keys`.
 */
export async function listKeys(): Promise<KeyEntry[]> {
  const { stdout } = await $("gpg", [
    "--list-keys",
    "--with-colons",
    "--with-keygrip",
  ]);
  const lines = stdout.split("\n");
  const keys: Record<string, KeyEntry> = {};
  let currentFpr: string | undefined;

  for (const line of lines) {
    const parts = line.split(":");
    const tag = parts[0];
    if (tag === "pub") {
      currentFpr = undefined;
    } else if (tag === "fpr") {
      currentFpr = parts[9];
      if (!keys[currentFpr]) keys[currentFpr] = { uid: "", fpr: currentFpr };
    } else if (tag === "uid" && currentFpr) {
      const uid = parts[9];
      keys[currentFpr].uid = uid;
    } else if (tag === "grp" && currentFpr) {
      const grip = parts[9];
      keys[currentFpr].keygrip = grip;
    }
  }
  return Object.values(keys);
}

/**
 * Exports the public key for the given fingerprint.
 */
export async function exportPublicKey(fpr: string): Promise<string> {
  const { stdout } = await $("gpg", ["--armor", "--export", fpr]);
  return stdout.trim();
}

/**
 * Exports the private key for the given fingerprint.
 */
export async function exportPrivateKey(fpr: string): Promise<string> {
  const { stdout } = await $("gpg", ["--armor", "--export-secret-keys", fpr]);
  return stdout.trim();
}

/**
 * Deletes the key with the given fingerprint.
 */
export async function deleteKey(fpr: string): Promise<void> {
  await $("gpg", ["--batch", "--yes", "--delete-secret-and-public-key", fpr]);
}

export async function importKey(armoredKey: string): Promise<void> {
  await $("gpg", ["--batch", "--import"], { input: armoredKey });
}

/**
 * Generates a new GPG key using batch mode. Supports ED25519 and RSA.
 */
export async function generateKey(v: {
  name: string;
  email: string;
  comment?: string;
  expire?: string; // e.g., 2y, 1m, 0 for never
  keyType: "RSA" | "ED25519";
  keyLength?: number; // for RSA
}): Promise<void> {
  const uid = v.comment ? `${v.name} (${v.comment}) <${v.email}>` : `${v.name} <${v.email}>`;
  if (v.keyType === "ED25519") {
    const batch = `Key-Type: eddsa\nKey-Curve: ed25519\nName-Real: ${v.name}\nName-Email: ${v.email}\n${v.comment ? `Name-Comment: ${v.comment}\n` : ""}Expire-Date: ${v.expire || "0"}\n%commit\n`;
    await $("gpg", ["--batch", "--generate-key"], { input: batch });
  } else {
    const length = v.keyLength || 4096;
    const batch = `Key-Type: RSA\nKey-Length: ${length}\nName-Real: ${v.name}\nName-Email: ${v.email}\n${v.comment ? `Name-Comment: ${v.comment}\n` : ""}Expire-Date: ${v.expire || "0"}\n%commit\n`;
    await $("gpg", ["--batch", "--generate-key"], { input: batch });
  }
}