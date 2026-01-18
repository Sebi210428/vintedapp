import nodemailer from "nodemailer";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult =
  | { sent: true }
  | { sent: false; reason: "smtp_not_configured" | "send_failed" };

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailArgs): Promise<SendEmailResult> {
  const transport = getTransport();
  if (!transport) return { sent: false, reason: "smtp_not_configured" };

  try {
    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER!;
    await transport.sendMail({ from, to, subject, html, text });
    return { sent: true };
  } catch {
    return { sent: false, reason: "send_failed" };
  }
}
