const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your own Bearer token
const STATIC_BEARER = "bNzxay2Pvqh831iEcDviOfdv8hv4H2BY";

// Load your Firebase Admin SDK JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(bodyParser.json());

// Middleware for Bearer token check
app.use((req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth || auth !== `Bearer ${STATIC_BEARER}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// POST /send-notification
app.post("/send-notification", async (req, res) => {
  const { title, body, fcm_token, topic, send_type } = req.body;

  const message = {
    data: {
      title: title || "",
      body: body || ""
    },
    android: {
      priority: "high"
    },
    apns: {
      payload: {
        aps: {
          sound: "default"
        }
      }
    }
  };

  if (send_type === true && fcm_token) {
    message.token = fcm_token;
  } else if (send_type === false && topic) {
    message.topic = topic;
  } else {
    return res.status(400).json({ error: "Invalid send_type or missing token/topic" });
  }

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
