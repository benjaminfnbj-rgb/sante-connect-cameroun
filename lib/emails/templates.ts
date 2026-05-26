export const emailTemplates = {

  // 1. Bienvenue + vérification compte
  welcome: (name: string, verifyUrl: string) => ({
    subject: '🏥 Bienvenue sur Santé Connect Cameroun !',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0fdf8;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d4a3a,#1a7a5e);padding:40px 32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🏥</div>
      <h1 style="color:white;margin:0;font-size:26px;font-weight:700;">Santé Connect Cameroun</h1>
      <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Votre santé, notre priorité</p>
    </div>

    <!-- Body -->
    <div style="padding:40px 32px;">
      <h2 style="color:#0d4a3a;margin:0 0 16px;font-size:22px;">Bienvenue, ${name} ! 👋</h2>
      <p style="color:#4a6a5e;font-size:16px;line-height:1.7;margin:0 0 24px;">
        Votre compte Santé Connect Cameroun a été créé avec succès. Vous bénéficiez d'un <strong style="color:#1a7a5e;">mois d'essai gratuit</strong> pour découvrir tous nos services.
      </p>

      <div style="background:#f0fdf8;border-radius:12px;padding:20px;margin:0 0 28px;">
        <p style="color:#0d4a3a;font-weight:700;margin:0 0 12px;font-size:15px;">✨ Ce que vous pouvez faire :</p>
        <div style="color:#4a6a5e;font-size:14px;line-height:2;">
          📅 Prendre rendez-vous avec un médecin en ligne<br>
          💊 Commander vos médicaments en pharmacie<br>
          🤖 Consulter l'Assistant Santé IA<br>
          🌺 Suivre votre cycle menstruel<br>
          🚨 Accéder aux numéros d'urgence 24h/24
        </div>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a7a5e,#2eb87a);color:white;padding:16px 40px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:700;box-shadow:0 4px 20px rgba(46,184,122,0.4);">
          ✅ Activer mon compte
        </a>
      </div>

      <p style="color:#9ab0a8;font-size:13px;text-align:center;margin:0;">
        Ce lien expire dans 24 heures. Si vous n'avez pas créé ce compte, ignorez cet email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f0fdf8;padding:24px 32px;text-align:center;border-top:1px solid #d4ede5;">
      <p style="color:#7a9a8e;font-size:12px;margin:0;">
        © 2025 Santé Connect Cameroun · Fait avec ❤️ pour la santé au Cameroun<br>
        <a href="mailto:benjaminfnbj@gmail.com" style="color:#1a7a5e;">Nous contacter</a>
      </p>
    </div>
  </div>
</body>
</html>`
  }),

  // 2. Rappel abonnement J-3
  subscriptionReminder: (name: string, expiryDate: string, renewUrl: string) => ({
    subject: '⚠️ Votre abonnement Santé Connect expire dans 3 jours',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fff8f0;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f5a623,#e8950f);padding:40px 32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">⏰</div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">Abonnement bientôt expiré</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#0d4a3a;margin:0 0 16px;">Bonjour ${name},</h2>
      <p style="color:#4a6a5e;font-size:16px;line-height:1.7;">
        Votre abonnement Santé Connect Cameroun expire le <strong style="color:#e8950f;">${expiryDate}</strong>. 
        Renouvelez maintenant pour continuer à accéder à tous nos services sans interruption.
      </p>
      <div style="background:#fff8f0;border-radius:12px;padding:20px;margin:24px 0;border-left:4px solid #f5a623;">
        <p style="color:#92400e;margin:0;font-size:14px;font-weight:600;">
          ⚠️ Après expiration, votre accès sera suspendu (sauf numéros d'urgence).
        </p>
      </div>
      <div style="display:flex;gap:16px;margin:32px 0;text-align:center;">
        <div style="flex:1;background:#f0fdf8;border-radius:12px;padding:20px;">
          <div style="color:#1a7a5e;font-size:24px;font-weight:700;">1 000 FCFA</div>
          <div style="color:#4a6a5e;font-size:13px;">/ mois</div>
        </div>
        <div style="flex:1;background:linear-gradient(135deg,#0d4a3a,#1a7a5e);border-radius:12px;padding:20px;">
          <div style="color:#f5a623;font-size:24px;font-weight:700;">10 000 FCFA</div>
          <div style="color:rgba(255,255,255,0.7);font-size:13px;">/ an · 2 mois offerts 🎉</div>
        </div>
      </div>
      <div style="text-align:center;">
        <a href="${renewUrl}" style="display:inline-block;background:linear-gradient(135deg,#f5a623,#e8950f);color:white;padding:16px 40px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:700;">
          🔄 Renouveler mon abonnement
        </a>
      </div>
    </div>
    <div style="background:#f0fdf8;padding:20px 32px;text-align:center;border-top:1px solid #d4ede5;">
      <p style="color:#7a9a8e;font-size:12px;margin:0;">© 2025 Santé Connect Cameroun</p>
    </div>
  </div>
</body>
</html>`
  }),

  // 3. Abonnement expiré
  subscriptionExpired: (name: string, renewUrl: string) => ({
    subject: '🔴 Votre abonnement Santé Connect a expiré',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fff5f5;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:40px 32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🔴</div>
      <h1 style="color:white;margin:0;font-size:22px;">Accès suspendu</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#0d4a3a;margin:0 0 16px;">Bonjour ${name},</h2>
      <p style="color:#4a6a5e;font-size:16px;line-height:1.7;">
        Votre abonnement a expiré. Votre accès aux services est suspendu. Les <strong style="color:#dc2626;">numéros d'urgence</strong> restent toujours accessibles.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${renewUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a7a5e,#2eb87a);color:white;padding:16px 40px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:700;">
          ✅ Réactiver mon compte
        </a>
      </div>
    </div>
    <div style="background:#f0fdf8;padding:20px 32px;text-align:center;border-top:1px solid #d4ede5;">
      <p style="color:#7a9a8e;font-size:12px;margin:0;">© 2025 Santé Connect Cameroun</p>
    </div>
  </div>
</body>
</html>`
  }),

  // 4. Confirmation rendez-vous
  appointmentConfirmed: (patientName: string, doctorName: string, date: string, time: string, location: string) => ({
    subject: `✅ Rendez-vous confirmé avec ${doctorName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0fdf8;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#0d4a3a,#1a7a5e);padding:40px 32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">📅</div>
      <h1 style="color:white;margin:0;font-size:22px;">Rendez-vous confirmé !</h1>
    </div>
    <div style="padding:40px 32px;">
      <p style="color:#4a6a5e;font-size:16px;line-height:1.7;margin:0 0 24px;">
        Bonjour <strong>${patientName}</strong>, votre rendez-vous a été confirmé.
      </p>
      <div style="background:#f0fdf8;border-radius:16px;padding:24px;margin:0 0 24px;">
        <div style="display:grid;gap:16px;">
          <div style="display:flex;gap:12px;align-items:center;">
            <span style="font-size:24px;">👨‍⚕️</span>
            <div><div style="color:#9ab0a8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Médecin</div><div style="color:#0d4a3a;font-weight:700;font-size:16px;">${doctorName}</div></div>
          </div>
          <div style="display:flex;gap:12px;align-items:center;">
            <span style="font-size:24px;">📅</span>
            <div><div style="color:#9ab0a8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Date</div><div style="color:#0d4a3a;font-weight:700;font-size:16px;">${date}</div></div>
          </div>
          <div style="display:flex;gap:12px;align-items:center;">
            <span style="font-size:24px;">🕐</span>
            <div><div style="color:#9ab0a8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Heure</div><div style="color:#0d4a3a;font-weight:700;font-size:16px;">${time}</div></div>
          </div>
          <div style="display:flex;gap:12px;align-items:center;">
            <span style="font-size:24px;">📍</span>
            <div><div style="color:#9ab0a8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Lieu</div><div style="color:#0d4a3a;font-weight:700;font-size:16px;">${location}</div></div>
          </div>
        </div>
      </div>
      <div style="background:#fff8f0;border-radius:12px;padding:16px;border-left:4px solid #f5a623;">
        <p style="color:#92400e;margin:0;font-size:14px;">💡 Pensez à apporter votre carnet de santé et vos ordonnances précédentes.</p>
      </div>
    </div>
    <div style="background:#f0fdf8;padding:20px 32px;text-align:center;border-top:1px solid #d4ede5;">
      <p style="color:#7a9a8e;font-size:12px;margin:0;">© 2025 Santé Connect Cameroun</p>
    </div>
  </div>
</body>
</html>`
  }),

  // 5. Professionnel approuvé (KYC)
  professionalApproved: (name: string, loginUrl: string) => ({
    subject: '✅ Votre profil professionnel Santé Connect est approuvé !',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0fdf8;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#0d4a3a,#1a7a5e);padding:40px 32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">🎉</div>
      <h1 style="color:white;margin:0;font-size:22px;">Profil approuvé !</h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="color:#0d4a3a;margin:0 0 16px;">Félicitations, ${name} !</h2>
      <p style="color:#4a6a5e;font-size:16px;line-height:1.7;">
        Votre dossier KYC a été vérifié et validé. Votre profil est maintenant <strong style="color:#1a7a5e;">public et visible</strong> par tous les patients sur Santé Connect Cameroun.
      </p>
      <div style="background:#f0fdf8;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="color:#0d4a3a;font-weight:700;margin:0 0 12px;">Vous pouvez maintenant :</p>
        <div style="color:#4a6a5e;font-size:14px;line-height:2;">
          ✅ Recevoir des rendez-vous de patients<br>
          ✅ Publier vos disponibilités<br>
          ✅ Être contacté directement<br>
          ✅ Gérer votre profil et services
        </div>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a7a5e,#2eb87a);color:white;padding:16px 40px;border-radius:50px;text-decoration:none;font-size:16px;font-weight:700;">
          🚀 Accéder à mon espace
        </a>
      </div>
    </div>
    <div style="background:#f0fdf8;padding:20px 32px;text-align:center;border-top:1px solid #d4ede5;">
      <p style="color:#7a9a8e;font-size:12px;margin:0;">© 2025 Santé Connect Cameroun</p>
    </div>
  </div>
</body>
</html>`
  }),

  // 6. Commande pharmacie confirmée
  orderConfirmed: (name: string, orderRef: string, items: string, total: string, pharmacy: string) => ({
    subject: `💊 Commande #${orderRef} confirmée — Santé Connect`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f0fdf8;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:40px 32px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">💊</div>
      <h1 style="color:white;margin:0;font-size:22px;">Commande confirmée</h1>
      <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Référence : #${orderRef}</p>
    </div>
    <div style="padding:40px 32px;">
      <p style="color:#4a6a5e;font-size:16px;line-height:1.7;">Bonjour <strong>${name}</strong>, votre commande a été confirmée par <strong>${pharmacy}</strong>.</p>
      <div style="background:#f8faff;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #dbeafe;">
        <p style="color:#1d4ed8;font-weight:700;margin:0 0 12px;">🛍️ Articles commandés :</p>
        <p style="color:#374151;font-size:14px;margin:0;white-space:pre-line;">${items}</p>
        <div style="border-top:1px solid #dbeafe;margin-top:16px;padding-top:16px;">
          <strong style="color:#1d4ed8;font-size:18px;">Total : ${total} FCFA</strong>
        </div>
      </div>
      <div style="background:#f0fdf8;border-radius:12px;padding:16px;border-left:4px solid #2eb87a;">
        <p style="color:#0d4a3a;margin:0;font-size:14px;">📍 Vous serez contacté pour la livraison ou le retrait en pharmacie.</p>
      </div>
    </div>
    <div style="background:#f0fdf8;padding:20px 32px;text-align:center;border-top:1px solid #d4ede5;">
      <p style="color:#7a9a8e;font-size:12px;margin:0;">© 2025 Santé Connect Cameroun</p>
    </div>
  </div>
</body>
</html>`
  }),
}
