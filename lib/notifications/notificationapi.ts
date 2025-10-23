import notificationapi from 'notificationapi-node-server-sdk';

// Initialize NotificationAPI client (only if credentials are available)
const clientId = process.env.NOTIFICATIONAPI_CLIENT_ID;
const clientSecret = process.env.NOTIFICATIONAPI_CLIENT_SECRET;

if (clientId && clientSecret) {
  notificationapi.init(clientId, clientSecret);
}

// Email service using NotificationAPI
export async function sendInviteEmail(to: string, inviteUrl: string, practiceName?: string) {
  if (!clientId || !clientSecret) {
    console.log("⚠️ NotificationAPI not configured - skipping email to:", to);
    console.log("Invite URL:", inviteUrl);
    return;
  }

  try {
    await notificationapi.send({
      type: 'admin_invite_email',
      to: {
        id: to,
        email: to,
      },
      email: {
        subject: `Admin Invite for ${practiceName || 'MedCare Practice'}`,
        html: `
          <h2>MedCare Admin Invitation</h2>
          <p>Hello,</p>
          <p>You have been invited to create an admin account for <strong>${practiceName || 'MedCare Practice'}</strong>.</p>
          <p>Click the link below to set your password. The link expires in 72 hours.</p>
          <p><a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Create Admin Account</a></p>
          <p>If you did not expect this invite, you can ignore this email.</p>
          <p>Best regards,<br>MedCare Team</p>
        `,
      },
    });
    console.log(`✅ Admin invite email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Failed to send admin invite email:", error);
    throw error;
  }
}

export async function sendAppointmentEmail(args: {
  to: string;
  subject: string;
  html: string;
  patientName?: string;
  appointmentDate?: string;
  practiceName?: string;
}) {
  if (!notificationapi) {
    console.log("⚠️ NotificationAPI not configured - skipping appointment email to:", args.to);
    return;
  }

  try {
    await notificationapi.send({
      notificationId: "appointment_email",
      user: {
        id: args.to,
        email: args.to,
      },
      mergeTags: {
        subject: args.subject,
        html: args.html,
        patientName: args.patientName || "Patient",
        appointmentDate: args.appointmentDate || "TBD",
        practiceName: args.practiceName || "MedCare Practice",
      },
    });
    console.log(`✅ Appointment email sent to: ${args.to}`);
  } catch (error) {
    console.error("❌ Failed to send appointment email:", error);
    throw error;
  }
}

// SMS service using NotificationAPI
export async function sendSms(to: string, body: string, practiceName?: string) {
  if (!clientId || !clientSecret) {
    console.log("⚠️ NotificationAPI not configured - skipping SMS to:", to);
    return;
  }

  try {
    const result = await notificationapi.send({
      type: 'sms', // Use 'sms' template type
      to: {
        id: to,
        number: to, // Phone number should be in format [+][country code][area code][local number]
      },
      sms: {
        message: body,
      },
    });
    console.log(`✅ SMS sent to: ${to}`);
  } catch (error) {
    console.error("❌ Failed to send SMS:", error);
    throw error;
  }
}

// Combined invite function (email + SMS)
export async function sendAdminInvite(args: {
  email: string;
  phone?: string;
  inviteUrl: string;
  practiceName: string;
}) {
  const results = {
    email: false,
    sms: false,
  };

  // Send email
  try {
    await sendInviteEmail(args.email, args.inviteUrl, args.practiceName);
    results.email = true;
  } catch (error) {
    console.error("Email failed:", error);
  }

  // Send SMS if phone provided
  if (args.phone) {
    try {
      // Remove leading 0 if present (since country code is already included)
      let formattedPhone = args.phone;
      if (formattedPhone.startsWith('+270')) {
        formattedPhone = formattedPhone.replace('+270', '+27');
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+27' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      
      const smsBody = `MedCare Admin Invite: ${args.inviteUrl} (Expires in 72 hours)`;
      await sendSms(formattedPhone, smsBody, args.practiceName);
      results.sms = true;
    } catch (error) {
      console.error("SMS failed:", error);
    }
  }

  return results;
}
