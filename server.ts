import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

dotenv.config();

const __dirname = path.resolve();

// Initialize Firebase Admin for server-side updates
let db: any = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

// Initialize Stripe lazy wrapper
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook needs raw body to verify signature
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const stripeClient = getStripe();
      const sig = req.headers['stripe-signature'];
      if (!sig) return res.status(400).send("No signature found");
      
      const event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const uid = paymentIntent.metadata?.uid;
        const passType = paymentIntent.metadata?.passType; // 'proPlan' | 'godTier' | 'musicPass'
        
        if (uid && db) {
          console.log(`Unlocking ${passType} for user: ${uid} via Stripe`);
          const userRef = db.collection('game_states').doc(uid);
          const updateData: any = { lastUpdated: new Date() };
          
          if (passType === 'godTier') {
            updateData["stats.godTier"] = true;
            updateData["stats.proPlan"] = true; // God tier includes pro
          } else if (passType === 'proPlan') {
            updateData["stats.proPlan"] = true;
          } else if (passType === 'musicPass') {
            updateData["stats.musicPass"] = true; // Adding musicPass explicitly if they buy it individually
          }
          await userRef.update(updateData);
        }
      } else if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        
        if (uid && db) {
          let passType = session.metadata?.passType;
          
          if (!passType) {
            // Infer from amount if metadata is empty
            if (session.amount_total === 500) {
              passType = 'proPlan';
            } else if (session.amount_total === 1500) {
              passType = 'godTier';
            } else {
              passType = 'musicPass';
            }
          }
          
          console.log(`Unlocking ${passType} for user: ${uid} via Stripe Checkout Session`);
          const userRef = db.collection('game_states').doc(uid);
          const updateData: any = { 
            "lastUpdated": new Date() 
          };
          
          if (passType === 'musicPass') {
            updateData["stats.musicPass"] = true;
          } else if (passType === 'proPlan') {
            updateData["stats.proPlan"] = true;
          } else if (passType === 'godTier') {
            updateData["stats.godTier"] = true;
            updateData["stats.proPlan"] = true;
          }
          
          await userRef.update(updateData);
        }
      }
      res.json({ received: true });
    } catch (err: any) {
      console.error('Stripe webhook error:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Global JSON parser for other routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Create Payment Intent explicitly for Elements
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { uid, passType } = req.body; // 'proPlan', 'godTier', 'musicPass'
      let amount = 500; // $5.00 default for Pro
      if (passType === 'godTier') amount = 1500; // $15.00 God tier
      if (passType === 'musicPass') amount = 200; // $2.00 music pass

      const stripeClient = getStripe();
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { uid, passType },
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Legacy Ko-fi webhook...
  app.post("/api/kofi-webhook", async (req, res) => {
    try {
      const data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
      const verificationToken = process.env.KOFI_VERIFICATION_TOKEN;
      if (verificationToken && data.verification_token !== verificationToken) {
        return res.status(401).send("Unauthorized");
      }
      const message = data.message || "";
      const userIdMatch = message.match(/[a-zA-Z0-9]{20,}/);
      const userId = userIdMatch ? userIdMatch[0] : null;

      if (userId && db) {
        const isGodTier = data.tier_name === "God of Creation";
        const userRef = db.collection('game_states').doc(userId);
        const updateData: any = { "stats.proPlan": true, "lastUpdated": new Date() };
        if (isGodTier) updateData["stats.godTier"] = true;
        await userRef.update(updateData);
      }
      res.status(200).send("OK");
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
