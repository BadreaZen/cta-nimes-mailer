// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('CTA Nîmes mailer OK');
});

app.post('/send-email', async (req, res) => {
  const { destinataire, date, heure, categorie } = req.body;

  if (!destinataire || !date || !heure || !categorie) {
    return res.status(400).json({ success: false, error: 'Champs manquants' });
  }

  // Transporteur SMTP Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER, // cta.secteur.nimes@gmail.com
      pass: process.env.MAIL_PASS  // wkiiafujtqxpvnzd
    }
  });

  const htmlMessage = `
    Bonjour,<br><br>
    Nous sommes au regret de vous annoncer qu'il ne nous sera pas possible de fournir un arbitre sur designation officielle pour la rencontre du <b>${date}</b> à <b>${heure}</b> concernant la categorie <b>${categorie}</b>.<br><br>
    Nous nous excusons pour la gêne occasionnée.<br><br>
    Sportivement,<br><br>
    --<br>
    <img src="https://upload.wikimedia.org/wikipedia/fr/thumb/2/2e/Logo_Ligue_Occitanie_FFH.png/320px-Logo_Ligue_Occitanie_FFH.png" alt="Ligue Occitanie FFHandball" width="120" /><br><br>
    Constantin DELATTRE<br>
    Commission territoriale d'arbitrage<br>
    Responsable secteur Nîmes<br>
    Tél. 06 61 65 99 20<br>
    cta.secteur.nimes@gmail.com
  `;

  try {
    await transporter.sendMail({
      from: '"CTA Secteur Nîmes" <cta.secteur.nimes@gmail.com>',
      to: destinataire,
      subject: "absence d'arbitre sur rencontre",
      html: htmlMessage
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi mail:', error);
    res.status(500).json({ success: false, error: 'Erreur envoi mail' });
  }
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
