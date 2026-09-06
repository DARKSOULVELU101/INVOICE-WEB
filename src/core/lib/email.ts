// Server-side email abstraction.
// Credentials live ONLY in server env vars (never the client).
// The provider interface keeps the app provider-agnostic so we can swap
// Resend / SMTP / SES without touching business logic.

import type { Resend } from "resend";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(input: SendEmailInput): Promise<{ id?: string }>;
}

export class ResendProvider implements EmailProvider {
  readonly name = "resend";
  private client: Resend;
  private from: string;

  constructor(apiKey: string, from: string) {
    const { Resend } = require("resend") as typeof import("resend");
    this.client = new Resend(apiKey);
    this.from = from;
  }

  async send(input: SendEmailInput) {
    const { data, error } = await this.client.emails.send({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
    });
    if (error) throw new Error(error.message);
    return { id: data?.id };
  }
}

let cachedProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "GENVOUCH Invoice Studio <no-reply@genvouch.com>";
  const provider =
    process.env.EMAIL_PROVIDER ?? (apiKey && !apiKey.startsWith("re_placeholder") ? "resend" : "log");

  if (provider === "resend" && apiKey) {
    cachedProvider = new ResendProvider(apiKey, from);
    return cachedProvider;
  }

  // Fallback: log-only provider (useful for local dev without credentials).
  cachedProvider = {
    name: "log",
    async send(input) {
      console.log(
        `[email:log] to=${JSON.stringify(input.to)} subject=${input.subject}`
      );
      return {};
    },
  };
  return cachedProvider;
}

export function emailConfigured() {
  const apiKey = process.env.RESEND_API_KEY;
  return Boolean(apiKey && !apiKey.startsWith("re_placeholder"));
}
