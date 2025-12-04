const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Route de test simple
app.get('/', (req, res) => {
  res.send('CTA Nîmes mailer OK');
});

// Route d'envoi d'email
app.post('/send-email', async (req, res) => {
  const { destinataire, date, heure, categorie } = req.body;

  // Vérif des champs
  if (!destinataire || !date || !heure || !categorie) {
    return res.status(400).json({ success: false, error: 'Champs manquants' });
  }

  // Clé API Resend
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY manquante dans les variables d’environnement');
    return res.status(500).json({ success: false, error: 'Clé API manquante' });
  }

  // Contenu HTML du mail
  const htmlMessage = `
    Bonjour,<br><br>
    Nous sommes au regret de vous annoncer qu'il ne nous sera pas possible de fournir un arbitre sur désignation officielle pour la rencontre du <b>${date}</b> à <b>${heure}</b> concernant la catégorie <b>${categorie}</b>.<br><br>
    Nous nous excusons pour la gêne occasionnée.<br><br>
    Sportivement,<br><br>
    --<br><br>
    Constantin DELATTRE<br>
    Commission territoriale d'arbitrage<br>
    Responsable secteur Nîmes<br>
    Tél. 06 61 65 99 20<br>
    cta.secteur.nimes@gmail.com
  `;

  try {
    // Appel à l'API Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'CTA Nîmes <contact@cta-secteur-nimes.resend.dev>', // expéditeur
        to: [destinataire],                                     // destinataire
        subject: 'absence d\'arbitre sur rencontre',
        html: htmlMessage
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Erreur Resend:', text);
      return res.status(500).json({ success: false, error: 'Erreur côté Resend' });
    }

    // Tout s'est bien passé
    res.json({ success: true });
  } catch (err) {
    console.error('Erreur envoi mail:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur lors de l’envoi' });
  }
});

// Lancement du serveur
app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
