module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ error: "Add PAYSTACK_SECRET_KEY in Vercel environment variables." });
  }

  try {
    const { email, amount, currency = "KES", channel = "all" } = req.body || {};
    const value = Number(amount);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }
    if (!Number.isInteger(value) || value < 1 || value > 10000000) {
      return res.status(400).json({ error: "Enter a valid donation amount." });
    }
    const allowedCurrencies = ["KES", "NGN", "GHS", "ZAR"];
    if (!allowedCurrencies.includes(currency)) {
      return res.status(400).json({ error: "Unsupported currency." });
    }

    const channels = channel === "card" ? ["card"] :
      channel === "mobile_money" ? ["mobile_money"] :
      ["card", "mobile_money"];

    const payload = {
      email,
      amount: String(value * 100),
      currency,
      channels,
      metadata: {
        purpose: "Voluntary donation to Teddy Tech Support"
      }
    };

    // No callback_url is sent: Paystack uses the callback URL configured in the dashboard.
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || !data.status || !data.data?.authorization_url) {
      return res.status(502).json({ error: data.message || "Could not start payment. Please try again." });
    }
    return res.status(200).json({ authorization_url: data.data.authorization_url });
  } catch (err) {
    console.error("Paystack initialize error:", err);
    return res.status(500).json({ error: "Payment service temporarily unavailable." });
  }
};
