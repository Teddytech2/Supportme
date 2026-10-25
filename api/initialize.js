const PAYSTACK_API = 'https://api.paystack.co';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({
      success: false,
      error: 'PAYSTACK_SECRET_KEY is missing from Vercel environment variables.'
    });
  }

  try {
    const body = req.body || {};

    const email = String(body.email || '').trim();
    const amount = Number(body.amount);
    const currency = String(body.currency || 'KES').toUpperCase();

    const allowedCurrencies = ['KES', 'NGN', 'GHS', 'ZAR', 'USD'];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid donation amount.'
      });
    }

    if (!allowedCurrencies.includes(currency)) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported currency.'
      });
    }

    const amountInSubunits = Math.round(amount * 100);

    if (!Number.isSafeInteger(amountInSubunits) || amountInSubunits < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid donation amount.'
      });
    }

    const payload = {
      email,
      amount: amountInSubunits,
      currency,
      metadata: {
        project: 'Teddy Tech Support',
        donation_type: 'Voluntary'
      }
    };

    const response = await fetch(
      `${PAYSTACK_API}/transaction/initialize`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (
      !response.ok ||
      !result.status ||
      !result.data ||
      !result.data.authorization_url
    ) {
      console.error('Paystack initialization failed:', result);

      return res.status(502).json({
        success: false,
        error: result.message || 'Paystack could not initialize the donation.'
      });
    }

    return res.status(200).json({
      success: true,
      authorization_url: result.data.authorization_url,
      reference: result.data.reference
    });
  } catch (error) {
    console.error('Payment initialization error:', error);

    return res.status(500).json({
      success: false,
      error: 'Unable to initialize payment. Please try again.'
    });
  }
};
