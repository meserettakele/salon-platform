const { initializeApp, getApps, cert } = require("firebase-admin/app");
const path = require("path");
const fs = require("fs");

let app = null;

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === "string"
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;
  } else {
    const serviceAccountPath = path.join(
      __dirname,
      "../../firebase-service-account.json"
    );
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = require(serviceAccountPath);
    }
  }

  if (serviceAccount) {
    app = getApps().length
      ? getApps()[0]
      : initializeApp({
          credential: cert(serviceAccount),
        });
    console.log("✔ Firebase Admin initialized successfully.");
  } else {
    console.warn("⚠ Firebase Service Account not found. Google Auth will be disabled.");
  }
} catch (error) {
  console.warn("⚠ Firebase Admin initialization notice:", error.message);
}

module.exports = app;
