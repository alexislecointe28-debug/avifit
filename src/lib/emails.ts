import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Avifit AUNL <onboarding@resend.dev>'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

// ─── CONFIRMATION SÉANCE ─────────────────────────────────────────────────────
export async function sendConfirmationSeance({
  to, prenom, titre, date, heureDebut, heureFin, avecLicence, montant,
}: {
  to: string; prenom: string; titre: string
  date: string; heureDebut: string; heureFin: string
  avecLicence: boolean; montant: number
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `✓ Réservation confirmée — ${titre}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
    <div style="background:#2563EB;padding:32px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">✓</div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Réservation confirmée</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;font-size:15px;margin:0 0 24px;">Bonjour <strong>${prenom}</strong>,</p>
      <p style="color:#374151;font-size:15px;margin:0 0 24px;">Votre place est confirmée. On vous attend !</p>

      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="font-size:16px;font-weight:700;color:#1E40AF;margin-bottom:12px;">${titre}</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div style="font-size:14px;color:#374151;">📅 <strong style="text-transform:capitalize">${formatDate(date)}</strong></div>
          <div style="font-size:14px;color:#374151;">🕐 ${heureDebut.slice(0,5)} – ${heureFin.slice(0,5)}</div>
          <div style="font-size:14px;color:#374151;">📍 AUNL — bord de Saône, Lyon</div>
        </div>
      </div>

      <div style="border:1px solid #E5E7EB;border-radius:10px;padding:16px;margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;">Récapitulatif</div>
        <div style="display:flex;justify-content:space-between;font-size:14px;color:#374151;margin-bottom:6px;">
          <span>1 séance Avifit</span>
          <span>${avecLicence ? (montant - 4500) / 100 : montant / 100}€</span>
        </div>
        ${avecLicence ? `<div style="display:flex;justify-content:space-between;font-size:14px;color:#374151;margin-bottom:6px;"><span>Licence FFA annuelle</span><span>45€</span></div>` : ''}
        <div style="height:1px;background:#F3F4F6;margin:10px 0;"></div>
        <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;color:#111;">
          <span>Total payé</span><span>${montant / 100}€</span>
        </div>
      </div>

      <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="font-size:13px;color:#6B7280;margin:0 0 6px;font-weight:600;">Pensez à apporter</p>
        <p style="font-size:13px;color:#6B7280;margin:0;">💧 De l'eau · 👟 Des chaussures de sport · Tenue confortable</p>
      </div>

      <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0;">
        Questions ? Répondez à cet email ou contactez Alexis directement.
      </p>
    </div>
    <div style="background:#F9FAFB;padding:16px;text-align:center;border-top:1px solid #E5E7EB;">
      <p style="font-size:12px;color:#9CA3AF;margin:0;">Avifit AUNL Lyon · Labellisé Avifit® FFA</p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ─── CONFIRMATION ABONNEMENT ──────────────────────────────────────────────────
export async function sendConfirmationAbonnement({
  to, prenom, montantSemaine, avecLicence,
}: {
  to: string; prenom: string; montantSemaine: number; avecLicence: boolean
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: '✓ Abonnement mercredi activé — Avifit AUNL',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
    <div style="background:#2563EB;padding:32px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">🎉</div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Abonnement activé !</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;font-size:15px;margin:0 0 24px;">Bonjour <strong>${prenom}</strong>,</p>
      <p style="color:#374151;font-size:15px;margin:0 0 24px;">Votre abonnement mercredi est actif. Votre place est désormais réservée automatiquement chaque semaine.</p>

      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="font-size:14px;color:#374151;margin-bottom:8px;">📅 <strong>Chaque mercredi</strong> — place réservée automatiquement</div>
        <div style="font-size:14px;color:#374151;margin-bottom:8px;">💳 <strong>${montantSemaine / 100}€ prélevés</strong> chaque semaine</div>
        <div style="font-size:14px;color:#374151;margin-bottom:8px;">🔒 <strong>Engagement 4 semaines</strong> minimum</div>
        <div style="font-size:14px;color:#374151;">📍 AUNL — bord de Saône, Lyon</div>
      </div>

      ${avecLicence ? `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:14px;margin-bottom:24px;font-size:13px;color:#166534;">✓ Licence FFA annuelle incluse dans ce premier prélèvement</div>` : ''}

      <div style="text-align:center;margin-bottom:24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/mon-abonnement"
          style="display:inline-block;background:#F3F4F6;color:#374151;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;">
          Gérer mon abonnement
        </a>
      </div>

      <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0;">
        Résiliation possible après 4 semaines depuis "Mon abonnement" ou par email.
      </p>
    </div>
    <div style="background:#F9FAFB;padding:16px;text-align:center;border-top:1px solid #E5E7EB;">
      <p style="font-size:12px;color:#9CA3AF;margin:0;">Avifit AUNL Lyon · Labellisé Avifit® FFA</p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ─── RAPPEL 24H AVANT ────────────────────────────────────────────────────────
export async function sendRappelSeance({
  to, prenom, titre, date, heureDebut, heureFin,
}: {
  to: string; prenom: string; titre: string
  date: string; heureDebut: string; heureFin: string
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `⏰ Rappel — votre séance Avifit demain`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
    <div style="background:#111827;padding:24px;text-align:center;">
      <div style="font-size:28px;margin-bottom:6px;">⏰</div>
      <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">C'est demain !</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;font-size:15px;margin:0 0 20px;">Bonjour <strong>${prenom}</strong>,</p>
      <p style="color:#374151;font-size:15px;margin:0 0 24px;">Rappel pour votre séance de demain :</p>

      <div style="background:#F9FAFB;border-left:4px solid #2563EB;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <div style="font-size:15px;font-weight:700;color:#111;margin-bottom:8px;">${titre}</div>
        <div style="font-size:14px;color:#374151;margin-bottom:4px;">📅 <span style="text-transform:capitalize">${formatDate(date)}</span></div>
        <div style="font-size:14px;color:#374151;margin-bottom:4px;">🕐 ${heureDebut.slice(0,5)} – ${heureFin.slice(0,5)}</div>
        <div style="font-size:14px;color:#374151;">📍 AUNL — bord de Saône, Lyon</div>
      </div>

      <div style="background:#FFF7ED;border-radius:8px;padding:14px;font-size:13px;color:#92400E;">
        💧 Eau · 👟 Chaussures de sport · Tenue confortable
      </div>
    </div>
    <div style="background:#F9FAFB;padding:16px;text-align:center;border-top:1px solid #E5E7EB;">
      <p style="font-size:12px;color:#9CA3AF;margin:0;">Avifit AUNL Lyon · Labellisé Avifit® FFA</p>
    </div>
  </div>
</body>
</html>`,
  })
}
