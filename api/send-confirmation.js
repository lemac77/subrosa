// =====================================================================
// Vercel Serverless Function - Sub Rosa Pop-Up
// Invia email di conferma via Resend dopo la registrazione
// Path nel repo: /api/send-confirmation.js
// =====================================================================

// >>> SOSTITUISCI con il tuo mittente del dominio verificato su Resend <<<
const FROM = "Sub Rosa <subrosa@studiobrillo.com>";

// Dati evento (modificabili)
const EVENT = {
  data: "10 Luglio 2026",
  orario: "21:00 → 02:00",
  luogo: "Cappella della Rotonda - Via della Rotonda 34, Vicenza",
  paypalUser: "pioggiasour",
  ibanHolder: "Marco Pioggiarella",
  iban: "LT22 3250 0853 1407 3762",
  causale: "EVENTO SUBROSA",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { nome, email, position, price, release } = req.body || {};
    if (!email || !nome || !price) {
      return res.status(400).json({ error: "Dati mancanti" });
    }

    const releaseLabel =
      release === "early" ? "Early Bird" : release === "second" ? "Second Release" : "Late Ticket";
    const paypalUrl = `https://paypal.me/${EVENT.paypalUser}/${price}EUR`;
    const posStr = String(position).padStart(3, "0");

    const html = buildEmail({ nome, position: posStr, price, releaseLabel, paypalUrl });

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: email,
        subject: `Sei dentro - Sub Rosa Pop-Up · posizione #${posStr}`,
        html,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error("Resend error:", txt);
      return res.status(500).json({ error: "Invio fallito", detail: txt });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}

function buildEmail({ nome, position, price, releaseLabel, paypalUrl }) {
  const pink = "#C9748A";
  return `
  <!DOCTYPE html>
  <html lang="it">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#000;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:32px 0;">
      <tr><td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0a0a0a;border:1px solid #222;border-radius:6px;overflow:hidden;">

          <!-- header -->
          <tr><td style="padding:36px 32px 24px;text-align:center;border-bottom:1px solid #1e1e1e;">
            <div style="color:${pink};font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;">Deto &amp; Sin Fatiqque · Presents</div>
            <div style="color:#fff;font-size:30px;font-weight:bold;letter-spacing:1px;line-height:1.1;">SUB ROSA</div>
            <div style="color:${pink};font-size:30px;font-weight:bold;letter-spacing:1px;line-height:1.1;">POP-UP</div>
          </td></tr>

          <!-- conferma -->
          <tr><td style="padding:32px;">
            <div style="color:#fff;font-size:22px;font-weight:bold;margin-bottom:8px;">Sei dentro, ${nome}.</div>
            <div style="color:#a8a8a8;font-size:14px;margin-bottom:28px;">La tua posizione è confermata.</div>

            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${pink};border-radius:4px;margin-bottom:24px;">
              <tr>
                <td style="padding:18px 20px;">
                  <div style="color:#a8a8a8;font-size:10px;letter-spacing:2px;text-transform:uppercase;">Posizione</div>
                  <div style="color:#fff;font-size:18px;font-weight:bold;margin-top:4px;">#${position} / 120</div>
                </td>
                <td style="padding:18px 20px;text-align:right;border-left:1px solid #1e1e1e;">
                  <div style="color:#a8a8a8;font-size:10px;letter-spacing:2px;text-transform:uppercase;">${releaseLabel}</div>
                  <div style="color:${pink};font-size:26px;font-weight:bold;margin-top:4px;">${price} EUR</div>
                </td>
              </tr>
            </table>

            <div style="color:${pink};font-size:13px;margin-bottom:28px;">&#10003; Consumazione inclusa nel prezzo</div>

            <!-- pagamento -->
            <div style="color:#a8a8a8;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Come pagare</div>
            <a href="${paypalUrl}" style="display:block;background:${pink};color:#000;text-decoration:none;text-align:center;padding:16px;border-radius:4px;font-weight:bold;font-size:14px;letter-spacing:1px;margin-bottom:12px;">PAGA ${price} EUR CON PAYPAL</a>
            <div style="background:rgba(201,169,110,.1);border:1px solid rgba(201,169,110,.3);border-radius:4px;padding:11px 13px;margin-bottom:12px;color:#d4b87a;font-size:11px;line-height:1.6;">Importante: invia come <strong style="color:#e8d2a0;">Amici e Famiglia</strong>, non come pagamento per beni o servizi.</div>
            <div style="color:#a8a8a8;font-size:11px;line-height:1.6;margin-bottom:20px;">Paghi per più persone? Inserisci i loro <strong style="color:#fff;">nomi nella descrizione</strong> del pagamento.</div>

            <div style="color:#999;font-size:11px;text-align:center;margin-bottom:16px;">oppure bonifico</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#161616;border:1px solid #2a2a2a;border-radius:4px;">
              <tr><td style="padding:14px 18px;border-bottom:1px solid #1e1e1e;">
                <div style="color:#a8a8a8;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;">Intestatario</div>
                <div style="color:#fff;font-size:13px;margin-top:3px;">${EVENT.ibanHolder}</div>
              </td></tr>
              <tr><td style="padding:14px 18px;border-bottom:1px solid #1e1e1e;">
                <div style="color:#a8a8a8;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;">IBAN</div>
                <div style="color:#fff;font-size:13px;margin-top:3px;font-family:monospace;">${EVENT.iban}</div>
              </td></tr>
              <tr><td style="padding:14px 18px;">
                <div style="color:#a8a8a8;font-size:9px;letter-spacing:1.5px;text-transform:uppercase;">Causale</div>
                <div style="color:#fff;font-size:13px;margin-top:3px;">${EVENT.causale}</div>
              </td></tr>
            </table>
          </td></tr>

          <!-- dettagli evento -->
          <tr><td style="padding:24px 32px;border-top:1px solid #2a2a2a;background:#0d0d0d;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;color:#a8a8a8;font-size:12px;">Data</td>
                <td style="padding:6px 0;color:#fff;font-size:12px;text-align:right;">${EVENT.data}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#a8a8a8;font-size:12px;">Orario</td>
                <td style="padding:6px 0;color:#fff;font-size:12px;text-align:right;">${EVENT.orario}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#a8a8a8;font-size:12px;">Luogo</td>
                <td style="padding:6px 0;color:#fff;font-size:12px;text-align:right;">${EVENT.luogo}</td>
              </tr>
            </table>
          </td></tr>

          <!-- footer -->
          <tr><td style="padding:24px 32px;text-align:center;border-top:1px solid #1e1e1e;">
            <div style="color:#999;font-size:11px;line-height:1.6;">Il posto è garantito alla ricezione del pagamento.<br>Ci vediamo sotto la rosa.</div>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}
