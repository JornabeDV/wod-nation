import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export const preferenceClient = new Preference(client);

export async function createPaymentPreference({
  title,
  price,
  registrationId,
  competitionSlug,
}: {
  title: string;
  price: number;
  registrationId: string;
  competitionSlug: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id: registrationId,
          title,
          unit_price: price,
          quantity: 1,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${baseUrl}/competitions/${competitionSlug}/register/success`,
        failure: `${baseUrl}/competitions/${competitionSlug}/register`,
        pending: `${baseUrl}/competitions/${competitionSlug}/register/success`,
      },
      auto_return: "approved",
      external_reference: registrationId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
    },
  });

  return preference;
}
