import { useEffect, useState } from "react";
import { List, ActionPanel, Action, Icon, showHUD, Clipboard, Toast, showToast, closeMainWindow, confirmAlert,  } from "@vicinae/api";
import { listKeys, exportPublicKey, exportPrivateKey, deleteKey } from "./utils/gpg";
import { KeyEntry } from "./types";

async function copyPublic(fpr: string) {
  try {
    const text = await exportPublicKey(fpr);
    await Clipboard.copy(text);
    showToast({ style: Toast.Style.Success, title: "Copied", message: "Public key copied" });
  } catch {
    showToast({ style: Toast.Style.Failure, title: "Copy failed", message: "Could not copy public key" });
  }
}

async function copyPrivate(fpr: string) {
  try {
    const text = await exportPrivateKey(fpr);
    await Clipboard.copy(text);
    showToast({ style: Toast.Style.Success, title: "Copied", message: "Private key copied" });
  } catch {
    showToast({ style: Toast.Style.Failure, title: "Copy failed", message: "Could not copy private key" });
  }
}

export default function Command() {
  const [items, setItems] = useState<KeyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadKeys = async () => {
    try {
      setIsLoading(true);
      const list = await listKeys();
      setItems(list);
    } catch (e) {
      await showToast({ style: Toast.Style.Failure, title: "Error", message: "Could not list GPG keys." });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    (async () => {
     await loadKeys();
    })();
  }, []);

  return (
    <List navigationTitle="PGP Keys" isLoading={isLoading}>
      {items.length === 0 ? (
        <List.EmptyView title="No keys found" description="Use Create to add a new key" />
      ) : (
        items.map((k) => {
          return (
            <List.Item
              key={k.fpr}
              title={k.uid || k.fpr}
              subtitle={k.fpr}
              actions={
                <ActionPanel>
                  <Action title="Copy Public Key" icon={Icon.Clipboard} onAction={() => copyPublic(k.fpr)} />
                  <Action title="Copy Private Key" icon={Icon.Clipboard} onAction={() => copyPrivate(k.fpr)} />
                  <Action
                    title="Delete Key"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    shortcut={{ modifiers: ["ctrl"], key: "d" }}
                    onAction={async () => {
                      const confirmed = await confirmAlert({
                        title: "Delete Key",
                        message: `Are you sure you want to delete the key for "${k.uid}"? This action cannot be undone.`,
                      });

                      if (!confirmed) {
                        return;
                      }

                      try {
                        await deleteKey(k.fpr);
                        await loadKeys();
                        await showToast({ style: Toast.Style.Success, title: "Deleted", message: "Key deleted successfully." });
                      } catch {
                        await showToast({ style: Toast.Style.Failure, title: "Failed", message: "Could not delete key." });
                      }
                    }}
                  />
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}
