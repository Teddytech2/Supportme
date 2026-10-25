module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return res.status(500).json({ error: "Add PAYSTACK_SECRET_KEY in Vercel environment variables." });
  }

  const reference = String(req.query.reference || "");
  if (!/^[A-Za-z0-9=._-]+$/.test(reference) || reference.length > 100) {
    return res.status(400).json({ error: "Invalid payment reference." });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    });
    const result = await response.json();
    if (!response.ok || !result.status || !result.data) {
      return res.status(502).json({ status: "unknown", error: "Could not verify payment right now." });
    }
    const paid = result.data.status === "success";
    return res.status(200).json({
      status: paid ? "success" : result.data.status,
      amount: result.data.amount,
      currency: result.data.currency,
      reference: result.data.reference
    });
  } catch (err) {
    console.error("Paystack verify error:", err);
    return res.status(500).json({ status: "unknown", error: "Could not verify payment right now." });
  }
};
