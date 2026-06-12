import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email with an optional attachment
 * @param {Object} options 
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {Array} options.attachments - Nodemailer attachment objects
 */
export async function sendEmail({ to, subject, text, html, attachments = [], from, replyTo, auth }) {
  // Use a customized transporter if individual auth provided, otherwise fallback to system transporter
  const activeTransporter = auth?.user && auth?.pass 
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: auth.user, pass: auth.pass }
      })
    : transporter;

  try {
    const senderEmail = auth?.user || process.env.SMTP_USER || "hr@defenseblu.com";
    const info = await activeTransporter.sendMail({
      from: from || `"${process.env.SMTP_FROM_NAME || "DefenseBlu HR"}" <${senderEmail}>`,
      replyTo: replyTo || senderEmail,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log("[MAIL SUCCESS]", info.messageId);
    return info;
  } catch (error) {
    console.error("[MAIL ERROR]", error);
    throw error;
  }
}
