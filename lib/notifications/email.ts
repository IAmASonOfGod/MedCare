import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL || "no-reply@yourdomain.com";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendInviteEmail(to: string, inviteUrl: string) {
  if (!resend) throw new Error("RESEND_API_KEY not set");
  await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Your MedCare admin invite",
    html: `
      <p>Hello,</p>
      <p>You have been invited to create an admin account for MedCare. Click the link below to set your password. The link expires in 72 hours.</p>
      <p><a href="${inviteUrl}">${inviteUrl}</a></p>
      <p>If you did not expect this invite, you can ignore this email.</p>
    `,
  });
}

export async function sendAppointmentEmail(args: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) throw new Error("RESEND_API_KEY not set");
  await resend.emails.send({
    from: fromEmail,
    to: args.to,
    subject: args.subject,
    html: args.html,
  });
}

export async function sendPasswordResetEmail(args: { to: string; resetUrl: string }) {
  if (!resend) throw new Error("RESEND_API_KEY not set");
  await resend.emails.send({
    from: fromEmail,
    to: args.to,
    subject: "Reset Your MedCare Password",
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password for your MedCare account. Click the link below to create a new password:</p>
      <p><a href="${args.resetUrl}">${args.resetUrl}</a></p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
    `,
  });
}
