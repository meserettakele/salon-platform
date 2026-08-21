// src/services/chapaService.js
// Handles all direct communication with the Chapa payment gateway API.
const https = require("https");

const CHAPA_API_URL = "https://api.chapa.co/v1";

/**
 * Makes a JSON request to the Chapa API.
 * GET requests do NOT send Content-Type / Content-Length headers.
 */
function chapaRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const secretKey = process.env.CHAPA_SECRET_KEY;
    if (!secretKey || secretKey === "PASTE_YOUR_SECRET_KEY_HERE") {
      return reject(new Error("CHAPA_SECRET_KEY is not configured in .env"));
    }

    const bodyStr = body ? JSON.stringify(body) : "";
    const url = new URL(CHAPA_API_URL + path);

    // Only include body headers for POST/PUT requests
    const headers = { Authorization: `Bearer ${secretKey}` };
    if (method !== "GET" && bodyStr) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(bodyStr);
    }

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          console.log(
            `[Chapa] ${method} ${path} -> ${res.statusCode}`,
            JSON.stringify(parsed).slice(0, 300)
          );
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || `Chapa error: ${res.statusCode}`));
          }
        } catch (e) {
          console.error("[Chapa] Raw response:", data);
          reject(new Error("Invalid JSON response from Chapa"));
        }
      });
    });

    req.on("error", (err) => {
      console.error("[Chapa] Network error:", err.message);
      reject(err);
    });

    if (bodyStr && method !== "GET") req.write(bodyStr);
    req.end();
  });
}

/**
 * Generates a unique transaction reference.
 * Format: SALON-{timestamp}-{random4digits}
 */
function generateTxRef() {
  const ts = Date.now();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SALON-${ts}-${rand}`;
}

/**
 * Initialize a payment with Chapa.
 *
 * KEY FIX: return_url and callback_url point to the BACKEND verify endpoint,
 * NOT the frontend. Flow:
 *   Customer pays -> Chapa redirects browser to backend /chapa/verify
 *   -> backend verifies with Chapa API -> marks PAID -> redirects to frontend success page
 *
 * Returns { checkout_url, tx_ref }
 */
exports.initializePayment = async ({
  amount,
  email,
  firstName,
  lastName,
  phone,
  description,
}) => {
  const tx_ref = generateTxRef();

  // This is where Chapa sends the browser AFTER payment (backend first, then it redirects to frontend)
  const backendBase = process.env.CHAPA_BACKEND_URL || "http://localhost:5000";
  const verifyUrl = `${backendBase}/api/v1/payment/chapa/verify?tx_ref=${tx_ref}`;

  const payload = {
    amount: String(amount),
    currency: "ETB",
    email: email || "customer@salon.com",
    first_name: firstName || "Customer",
    last_name: lastName || "User",
    phone_number: phone || "",
    tx_ref,
    return_url: verifyUrl,   // browser redirect after payment
    callback_url: verifyUrl, // server-side webhook from Chapa
    "customization[title]": "Salon Booking Payment",
    "customization[description]": description || "Payment for salon service",
  };

  console.log("[Chapa] Initializing payment:", { tx_ref, amount, verifyUrl });

  const response = await chapaRequest("POST", "/transaction/initialize", payload);

  if (!response.data?.checkout_url) {
    throw new Error(
      "Chapa did not return a checkout URL. Response: " + JSON.stringify(response)
    );
  }

  console.log("[Chapa] Got checkout_url for tx_ref:", tx_ref);

  return {
    checkout_url: response.data.checkout_url,
    tx_ref,
  };
};

/**
 * Verify a completed payment with Chapa by tx_ref.
 * Returns the full Chapa transaction data on success.
 */
exports.verifyPayment = async (tx_ref) => {
  console.log("[Chapa] Verifying tx_ref:", tx_ref);

  const response = await chapaRequest(
    "GET",
    `/transaction/verify/${encodeURIComponent(tx_ref)}`,
    null
  );

  // Chapa response shape: { status: "success", message: "...", data: { status: "success", ... } }
  if (response.status !== "success") {
    throw new Error(
      "Chapa verification failed: " + (response.message || "unknown")
    );
  }

  console.log(
    "[Chapa] Verified ok - tx status:",
    response.data?.status,
    "for tx_ref:",
    tx_ref
  );

  return response.data; // { status: "success", amount, tx_ref, ... }
};
