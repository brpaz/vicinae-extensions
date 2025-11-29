import React, { useState } from "react";
import { Form, ActionPanel, Action, Toast, showToast } from "@vicinae/api";
import { generateKey } from "./utils/gpg";

type Values = {
  name: string;
  email: string;
  comment?: string;
  expire?: string; // e.g., 2y, 1m, 0 for never
  keyType: "RSA" | "ED25519";
  keyLength?: number; // for RSA
};

export default function Command() {
  const [submitting, setSubmitting] = useState(false);
  return (
    <Form
      navigationTitle="Create PGP Key"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Key"
            onSubmit={async (input: Form.Values) => {
              try {
                setSubmitting(true);
                const values: Values = {
                  name: String(input.name || ""),
                  email: String(input.email || ""),
                  comment: input.comment ? String(input.comment) : undefined,
                  expire: input.expire ? String(input.expire) : undefined,
                  keyType: (input.keyType as Values["keyType"]) || "ED25519",
                  keyLength: input.keyLength
                    ? Number(input.keyLength)
                    : undefined,
                };
                await generateKey(values);
                await showToast({ style: Toast.Style.Success, title: "Created", message: `Created key for ${values.name}` });
              } catch (e) {
                await showToast({ style: Toast.Style.Failure, title: "Creation Failed", message: "Could not create GPG key." });
              } finally {
                setSubmitting(false);
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Name" />
      <Form.TextField id="email" title="Email" />
      <Form.TextField id="comment" title="Comment" />
      <Form.Dropdown id="keyType" title="Key Type" defaultValue="ED25519">
        <Form.Dropdown.Item value="ED25519" title="Ed25519" />
        <Form.Dropdown.Item value="RSA" title="RSA" />
      </Form.Dropdown>
      <Form.TextField id="keyLength" title="RSA Length" />
      <Form.TextField id="expire" title="Expire (0, 2y, 6m, 30d)" />
    </Form>
  );
}
