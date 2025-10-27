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
const { getFirestore } = require('firebase-admin/firestore')
const cors = require("cors")({ origin: true }); // erlaubt alle Ursprünge
const stripe_webhook_Key = 'whsec_XQwzCRN8WANTp5Ri834FtGjOPh6UOhA9'
const stripe_Key = 'sk_test_51RQ5OQBNmgSWwkDy5BSkGRzSDcAgpj61UUE5boAnLva42cYBBvf4UJMDxWx6uudbZ1j7J3nrLpxsIf3OHepX8YDn00AYjrIK86'

admin.initializeApp();
const db = getFirestore();

exports.sendPushToToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      // Preflight-Anfrage, CORS antworten
      res.set('Access-Control-Allow-Methods', 'POST');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).send('');
    }

    console.log("📥 Anfrage erhalten:", req.method, req.body);

    const { token, title, body, msgType, eventDate, senderName } = req.body;

    if (!token || !title || !body) {
      console.warn("❌ Fehlende Parameter:", req.body);
      return res.status(400).json({ error: "token, title, and body required" });
    }

    try {
      const message = {
        data: { title, body, msgType, eventDate, senderName },
        //notification: { title, body },
        token: token,
      };

      console.log("📤 Sende Push an: ", token);
      const response = await admin.messaging().send(message);
      console.log("✅ Push erfolgreich:", response);

      return res.status(200).json({ success: true, response });
    } catch (err) {
      console.error("🔥 Fehler beim Push:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });
});

exports.stripeWebhook = functions.https.onRequest(async (req,res) => {
  const stripe = require('stripe')(stripe_Key);
  let event;

  try{
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers["stripe-signature"],
      stripe_webhook_Key,
    );
  }catch (err){
    console.error('Webhook signature verification failed', err)
    return res.sendStatus(400)
  }

  const dataObject = event.data.object;
  const eventType = event.type

  console.info('🍅', dataObject)
  console.info('🍅', eventType)
  
  switch (eventType) {
    case 'checkout.session.completed': {
      const userFirebaseId = dataObject.client_reference_id
      const stripeCustomerId = dataObject.customer
      const userDocRef = db.collection('Users').doc(userFirebaseId)

      await userDocRef.update({
        hasPremium: true,
        stripeId: stripeCustomerId
      })
    }

    case 'customer.subscription.deleted': {
      const userColRef = db.collection('Users')
      const queryRef = userColRef.where('stripeCustomerId' == stripeCustomerId)

      await queryRef.update({
        hasPremium: false,
      })
    }
      
      break;

  }

})

