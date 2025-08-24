import twilio from "twilio";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID as string;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN as string;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER as string;

const client =
  TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN
    ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    : null;

export async function sendSms(to: string, body: string) {
  if (!client) throw new Error("Twilio is not configured");
  await client.messages.create({ to, from: TWILIO_FROM_NUMBER, body });
}
