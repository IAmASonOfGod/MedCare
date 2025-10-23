import { sendInviteEmail as resendInviteEmail, sendAppointmentEmail as resendAppointmentEmail, sendPasswordResetEmail as resendPasswordResetEmail } from './email';
import { 
  sendInviteEmail as sesInviteEmail, 
  sendAppointmentEmail as sesAppointmentEmail,
  sendPasswordResetEmail as sesPasswordResetEmail,
  sendWelcomeEmail as sesWelcomeEmail,
  sendTestEmail as sesTestEmail
} from './ses';

// Email service configuration
const emailService = process.env.EMAIL_SERVICE || 'ses'; // 'ses' or 'resend'

// Interface for email service
interface EmailService {
  sendInviteEmail(to: string, inviteUrl: string): Promise<any>;
  sendAppointmentEmail(args: { to: string; subject: string; html: string; text?: string }): Promise<any>;
  sendPasswordResetEmail(args: { to: string; resetUrl: string }): Promise<any>;
  sendWelcomeEmail?(to: string, name: string): Promise<any>;
  sendTestEmail?(to: string): Promise<any>;
}

// Resend email service implementation
class ResendEmailService implements EmailService {
  async sendInviteEmail(to: string, inviteUrl: string) {
    return resendInviteEmail(to, inviteUrl);
  }

  async sendAppointmentEmail(args: { to: string; subject: string; html: string; text?: string }) {
    return resendAppointmentEmail(args);
  }

  async sendPasswordResetEmail(args: { to: string; resetUrl: string }) {
    return resendPasswordResetEmail(args);
  }
}

// SES email service implementation
class SESEmailService implements EmailService {
  async sendInviteEmail(to: string, inviteUrl: string) {
    return sesInviteEmail(to, inviteUrl);
  }

  async sendAppointmentEmail(args: { to: string; subject: string; html: string; text?: string }) {
    return sesAppointmentEmail(args);
  }

  async sendPasswordResetEmail(args: { to: string; resetUrl: string }) {
    return sesPasswordResetEmail(args.to, args.resetUrl);
  }

  async sendWelcomeEmail(to: string, name: string) {
    return sesWelcomeEmail(to, name);
  }

  async sendTestEmail(to: string) {
    return sesTestEmail(to);
  }
}

// Factory function to get the appropriate email service
function getEmailService(): EmailService {
  switch (emailService.toLowerCase()) {
    case 'resend':
      return new ResendEmailService();
    case 'ses':
    default:
      return new SESEmailService();
  }
}

// Export the email service instance
export const emailServiceInstance = getEmailService();

// Export convenience functions
export const sendInviteEmail = (to: string, inviteUrl: string) => 
  emailServiceInstance.sendInviteEmail(to, inviteUrl);

export const sendAppointmentEmail = (args: { to: string; subject: string; html: string; text?: string }) => 
  emailServiceInstance.sendAppointmentEmail(args);

export const sendPasswordResetEmail = (args: { to: string; resetUrl: string }) => {
  if (emailServiceInstance.sendPasswordResetEmail) {
    return emailServiceInstance.sendPasswordResetEmail(args);
  }
  throw new Error('Password reset email not supported by current email service');
};

export const sendWelcomeEmail = (to: string, name: string) => {
  if (emailServiceInstance.sendWelcomeEmail) {
    return emailServiceInstance.sendWelcomeEmail(to, name);
  }
  throw new Error('Welcome email not supported by current email service');
};

export const sendTestEmail = (to: string) => {
  if (emailServiceInstance.sendTestEmail) {
    return emailServiceInstance.sendTestEmail(to);
  }
  throw new Error('Test email not supported by current email service');
};

// Export the service type for debugging
export const getCurrentEmailService = () => emailService;
