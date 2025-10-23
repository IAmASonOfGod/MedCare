import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { fromEnv } from "@aws-sdk/credential-providers";

// SES Client Configuration
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: fromEnv(),
});

// Email Configuration
const fromEmail = process.env.SES_FROM_EMAIL || process.env.FROM_EMAIL || "no-reply@yourdomain.com";
const configurationSetName = process.env.SES_CONFIGURATION_SET_NAME;

// Helper function to create email input
function createEmailInput(to: string, subject: string, htmlBody: string, textBody?: string): SendEmailCommandInput {
  const input: SendEmailCommandInput = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: "UTF-8",
        },
        ...(textBody && {
          Text: {
            Data: textBody,
            Charset: "UTF-8",
          },
        }),
      },
    },
    ...(configurationSetName && {
      ConfigurationSetName: configurationSetName,
    }),
  };

  return input;
}

// Send email using SES
export async function sendEmail(to: string, subject: string, htmlBody: string, textBody?: string) {
  try {
    const input = createEmailInput(to, subject, htmlBody, textBody);
    const command = new SendEmailCommand(input);
    
    const result = await sesClient.send(command);
    console.log("Email sent successfully:", result.MessageId);
    return result;
  } catch (error) {
    console.error("Error sending email via SES:", error);
    throw error;
  }
}

// Send invite email
export async function sendInviteEmail(to: string, inviteUrl: string) {
  const subject = "Your MedCare admin invite";
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MedCare Admin Invite</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Welcome to MedCare!</h2>
        <p>Hello,</p>
        <p>You have been invited to create an admin account for MedCare. Click the button below to set your password. The link expires in 72 hours.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Set Password</a>
        </div>
        <p style="font-size: 14px; color: #6c757d;">If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="font-size: 14px; color: #6c757d; word-break: break-all;">${inviteUrl}</p>
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        <p style="font-size: 12px; color: #6c757d;">If you did not expect this invite, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
  `;
  
  const textBody = `Welcome to MedCare! You have been invited to create an admin account. Click the link to set your password: ${inviteUrl}. The link expires in 72 hours. If you did not expect this invite, you can ignore this email.`;

  return sendEmail(to, subject, htmlBody, textBody);
}

// Send appointment email
export async function sendAppointmentEmail(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  return sendEmail(args.to, args.subject, args.html, args.text);
}

// Send password reset email
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = "Reset Your MedCare Password";
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your MedCare account. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #6c757d;">This link will expire in 1 hour for security reasons.</p>
        <p style="font-size: 14px; color: #6c757d;">If you didn't request this password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        <p style="font-size: 12px; color: #6c757d;">If the button doesn't work, copy and paste this link: ${resetUrl}</p>
      </div>
    </body>
    </html>
  `;
  
  const textBody = `Password Reset Request: We received a request to reset your MedCare password. Click this link to reset: ${resetUrl}. This link expires in 1 hour. If you didn't request this, please ignore this email.`;

  return sendEmail(to, subject, htmlBody, textBody);
}

// Send welcome email
export async function sendWelcomeEmail(to: string, name: string) {
  const subject = "Welcome to MedCare!";
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to MedCare</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Welcome to MedCare, ${name}!</h2>
        <p>Thank you for joining MedCare. We're excited to have you on board!</p>
        <p>Your account has been successfully created and you can now:</p>
        <ul style="margin: 20px 0; padding-left: 20px;">
          <li>Schedule appointments</li>
          <li>Manage your health records</li>
          <li>Communicate with healthcare providers</li>
          <li>Access your medical history</li>
        </ul>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        <p style="font-size: 12px; color: #6c757d;">Welcome to better healthcare management!</p>
      </div>
    </body>
    </html>
  `;
  
  const textBody = `Welcome to MedCare, ${name}! Thank you for joining. Your account has been successfully created and you can now schedule appointments, manage health records, and more. Welcome to better healthcare management!`;

  return sendEmail(to, subject, htmlBody, textBody);
}

// Test email function
export async function sendTestEmail(to: string) {
  const subject = "SES Test Email";
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Test Email</title>
    </head>
    <body>
      <h1>Test Email from MedCare</h1>
      <p>This is a test email to verify your SES configuration is working correctly.</p>
      <p>If you received this email, congratulations! Your SES setup is working.</p>
    </body>
    </html>
  `;
  
  const textBody = "Test Email from MedCare - This is a test email to verify your SES configuration is working correctly.";

  return sendEmail(to, subject, htmlBody, textBody);
}
