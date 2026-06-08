import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

// Resend client — initialized only when API key is present
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function isEmailConfigured(): boolean {
  return !!resend && !!process.env.EMAIL_FROM;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const from = process.env.EMAIL_FROM;

  if (!resend || !from) {
    console.warn("[Email] Resend not configured. Set RESEND_API_KEY and EMAIL_FROM in .env");
    console.log(`[Email] Would have sent to: ${to}\n  Subject: ${subject}`);
    return { id: null, sent: false };
  }

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    console.log(`[Email] Sent to ${to} — ID: ${result.data?.id}`);
    return { id: result.data?.id ?? null, sent: true };
  } catch (error: any) {
    console.error("[Email] Failed to send:", error.message);
    throw new Error("No se pudo enviar el email. Intentá más tarde.");
  }
}
