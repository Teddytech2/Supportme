const PAYSTACK_API = 'https://api.paystack.co';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');

    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.'
    });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({
      success: false,
      error: 'PAYSTACK_SECRET_KEY is missing from Vercel.'
    });
  }

  const reference = String(req.query?.reference || '').trim();

  if (!reference) {
    return res.status(400).json({
      success: false,
      error: 'Payment reference is required.'
    });
  }

  try {
    const response = await fetch(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status || !result.data) {
      return res.status(502).json({
        success: false,
        error: result.message || 'Unable to verify payment.'
      });
    }

    const payment = result.data;

    return res.status(200).json({
      success: true,
      status: payment.status,
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      paid_at: payment.paid_at,
      email: payment.customer?.email || null
    });
  } catch (error) {
    console.error('Payment verification error:', error);

    return res.status(500).json({
      success: false,
      error: 'An error occurred while verifying payment.'
    });
  }
};
