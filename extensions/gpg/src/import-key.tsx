import { useState } from "react";
import { Form, ActionPanel, Action, Toast, showToast } from "@vicinae/api";
import { readFileSync } from "node:fs";
import { importKey } from "./utils/gpg";

export default function Command() {
  const [submitting, setSubmitting] = useState(false);
  return (
    <Form
      isLoading={submitting}
      navigationTitle="Import GPG Key"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Import Key"
            onSubmit={async (input: Form.Values) => {
              try {
                setSubmitting(true);
                const armored = input.armoredKey ? String(input.armoredKey).trim() : "";
                const filePath = input.filePath ? String(input.filePath).trim() : "";
                let keyData = armored;
                if (!keyData && filePath) {
                  try {
                    keyData = readFileSync(filePath, "utf8");
                  } catch (e) {
                    await showToast({ style: Toast.Style.Failure, title: "Read Failed", message: "Cannot read file" });
                    return;
                  }
                }
                if (!keyData) {
                  await showToast({ style: Toast.Style.Failure, title: "Missing Key", message: "Provide armored key or file path" });
                  return;
                }
                await importKey(keyData);
                await showToast({ style: Toast.Style.Success, title: "Imported", message: "Key imported" });
              } catch (e) {
                await showToast({ style: Toast.Style.Failure, title: `Import Failed: ${e}`, message: "Could not import key" });
              } finally {
                setSubmitting(false);
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description title="Instructions" text="Paste an armored GPG key OR provide a file path. If both are provided, the pasted key takes precedence." />
      <Form.TextArea id="armoredKey" title="Armored Key" />
      <Form.FilePicker id="filePath" title="File Path" />
    </Form>
  );
}
