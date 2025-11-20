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
    console.warn(
      "SMTP is not configured; skipping sending password reset email."
    );
    console.warn(`Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const from = EMAIL_FROM || "Soundscape <no-reply@soundscape.local>";

  await transporter.sendMail({
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
};


