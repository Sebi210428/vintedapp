import nodemailer from "nodemailer";

const [, , toArg] = process.argv;
const to = (toArg ?? "").trim();

if (!to || !to.includes("@")) {
  console.error("Usage: node scripts/test-smtp.mjs <toEmail>");
  process.exit(1);
}

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM ?? user;

if (!host || !port || !user || !pass || !from) {
  console.error("Missing SMTP config. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (and optionally SMTP_FROM).");
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

try {
  await transport.verify();
  const info = await transport.sendMail({
    from,
    to,
    subject: "BlueCut SMTP test",
    text: "SMTP is working. This is a test email from BlueCut.",
    html: "<p><b>SMTP is working.</b> This is a test email from BlueCut.</p>",
  });
  console.log("SMTP OK. Message sent:", info.messageId);
} catch (error) {
  console.error("SMTP FAILED:", error?.message ?? String(error));
  process.exitCode = 1;
}

