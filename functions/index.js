/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // erlaubt alle Ursprünge

admin.initializeApp();

exports.sendPushToToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      // Preflight-Anfrage, CORS antworten
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).send('');
    }

    console.log("📥 Anfrage erhalten:", req.method, req.body);

    const { token, title, body } = req.body;

    if (!token || !title || !body) {
      console.warn("❌ Fehlende Parameter:", req.body);
      return res.status(400).json({ error: "token, title, and body required" });
    }

    try {
      const message = {
        notification: { title, body },
        token: token,
      };

      console.log("📤 Sende Push an Token:", token);
      const response = await admin.messaging().send(message);
      console.log("✅ Push erfolgreich:", response);

      return res.status(200).json({ success: true, response });
    } catch (err) {
      console.error("🔥 Fehler beim Push:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });
});

