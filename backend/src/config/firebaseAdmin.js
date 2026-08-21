const { initializeApp, getApps, cert } = require("firebase-admin/app");

const path = require("path");

const serviceAccount = require(
  path.join(__dirname, "../../firebase-service-account.json"),
);

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    });

module.exports = app;
