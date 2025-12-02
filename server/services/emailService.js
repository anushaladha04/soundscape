import nodemailer from "nodemailer";
import { config } from "../config.js";

// Configure a reusable SMTP transporter using environment variables.
// In server/.env, set:
// EMAIL_FROM=Your Name <you@example.com>
// SMTP_HOST=smtp.yourprovider.com
// SMTP_PORT=587
// SMTP_USER=your_smtp_username
// SMTP_PASS=your_smtp_password

const {
  EMAIL_FROM,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
} = process.env;

let transporter = null;

if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export const sendPasswordResetEmail = async (to, resetUrl) => {
  if (!transporter) {
    console.error("❌ SMTP is not configured!");
    console.error("Missing environment variables:");
    if (!SMTP_HOST) console.error("  - SMTP_HOST");
    if (!SMTP_PORT) console.error("  - SMTP_PORT");
    if (!SMTP_USER) console.error("  - SMTP_USER");
    if (!SMTP_PASS) console.error("  - SMTP_PASS");
    console.warn(`\n⚠️  Password reset link for ${to}: ${resetUrl}`);
    console.warn("⚠️  Email was NOT sent. Configure SMTP in server/.env to enable email sending.\n");
    throw new Error("SMTP not configured");
  }

  const from = EMAIL_FROM || "Soundscape <no-reply@soundscape.local>";

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "Reset your Soundscape password",
      text: `You requested a password reset for your Soundscape account.\n\nClick the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `
        <p>You requested a password reset for your Soundscape account.</p>
        <p>
          <a href="${resetUrl}" target="_blank" rel="noreferrer">
            Click here to reset your password
          </a>
        </p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
    console.log(`✅ Password reset email sent to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${to}:`, error.message);
    throw error;
  }
};


