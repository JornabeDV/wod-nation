export function passwordResetEmailTemplate(resetUrl: string, name?: string | null) {
  const displayName = name || "Atleta";

  return {
    subject: "Restablecé tu contraseña — WODNation",
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Restablecer contraseña</title>
  <style>
    body { margin: 0; padding: 0; background-color: #050505; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 480px; margin: 0 auto; padding: 40px 24px; }
    .card { background: #111111; border-radius: 16px; padding: 40px 32px; border: 1px solid rgba(255,255,255,0.06); }
    .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #ff4d00, #ff6b35); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
    .logo span { color: #fff; font-size: 24px; font-weight: 700; }
    h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 12px; }
    p { color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    .button { display: inline-block; background: linear-gradient(135deg, #ff4d00, #ff6b35); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; }
    .link { color: #71717a; font-size: 13px; word-break: break-all; margin-top: 24px; }
    .footer { color: #52525b; font-size: 13px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo"><span>W</span></div>
      <h1>Hola ${escapeHtml(displayName)},</h1>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color:#fff;">WODNation</strong>. Si fuiste vos, hacé click en el botón de abajo. El link expira en 1 hora.</p>
      <a href="${resetUrl}" class="button">Restablecer contraseña</a>
      <p class="link">Si el botón no funciona, copiá y pegá este link en tu navegador:<br>${resetUrl}</p>
      <p class="footer">Si no solicitaste este cambio, ignorá este email. Tu contraseña sigue segura.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `Hola ${displayName},\n\nRecibimos una solicitud para restablecer tu contraseña en WODNation.\n\nLink (válido por 1 hora):\n${resetUrl}\n\nSi no solicitaste este cambio, ignorá este email.`,
  };
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
