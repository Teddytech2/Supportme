# Teddy Tech Support — Vercel + Paystack Donations

A responsive donation website for Teddy Tech. Supporters can enter any donation amount, choose a card or mobile-money checkout route, and are shown a thank-you message only after the transaction is verified with Paystack. A **Join our WhatsApp Channel** button appears at the bottom of the page.

Donations are voluntary. The site explains that contributions help with hosting, servers, domains, maintenance, security, and future free community projects.

## Features

- Responsive black-and-gold Teddy Tech design
- User-entered donation amount and currency selection
- Card and mobile-money payment method options
- Paystack-hosted secure checkout
- Server-side Paystack transaction initialization
- Server-side transaction verification before showing payment success
- Test payments first, then switch the secret key when ready for live payments
- WhatsApp channel button at the bottom of the page
- Vercel serverless API routes — no always-on server needed

## Deploy to Vercel

1. Download and extract the ZIP.
2. Upload the project files to a GitHub repository.
3. In Vercel, choose **Add New → Project** and import that repository.
4. Open **Project → Settings → Environment Variables**.
5. Add the variables below.
6. Deploy or redeploy the project.

### Environment variables

For your first deployment, use your Paystack test secret key:

```env
mode setting=test
PAYSTACK_SECRET_KEY=sk_test_replace_with_your_test_secret
APP_BASE_URL=https://your-project.vercel.app
```

Replace the placeholder secret with your actual **Paystack test secret key**. Replace the URL with your real Vercel deployment URL, without a trailing slash.

Do not commit your real `.env` file or secret key to GitHub. On Vercel, add the values in Environment Variables instead.

## How to get Paystack test keys

1. Sign in to your Paystack Dashboard.
2. Open **Settings → API Keys & Webhooks**.
3. Switch to **Test Mode** / find **API Configuration — Test Mode**.
4. Copy the **Test Secret Key**, which starts with `sk_test_`.
5. Paste it into the Vercel `PAYSTACK_SECRET_KEY` environment variable.
6. Set `mode setting` to `test`, save, and redeploy.

Official references:
- Paystack authentication and test/live key formats: https://paystack.com/docs/api/authentication/
- Paystack API keys: https://paystack.com/docs/developer-tools/api-keys/
- Paystack test and live mode help: https://support.paystack.com/en/articles/2129922

## How test mode works

- a test secret key makes the API reject a live secret key.
- In test mode, use only a key beginning with `sk_test_`.
- Test transactions do not move real money.
- Use the test payment details and scenarios provided in Paystack's own test environment.
- The thank-you state is shown only when the Paystack verify endpoint returns a successful transaction.

**Important:** Test mode can have different channel availability from live mode. Mobile money may not be available for every test account or currency. Paystack decides which payment methods are available for the account, country, and selected currency.

## Switching to live payments

Only do this when your Paystack account is activated and you are ready to accept real money:

1. Get the **Live Secret Key**, beginning with `sk_live_`, from the Paystack dashboard.
2. In Vercel Environment Variables, set a live secret key.
3. Replace `PAYSTACK_SECRET_KEY` with your live secret key.
4. Redeploy.
5. Run a small real transaction and verify it in the Paystack dashboard.

There is no mode setting in this project. The secret key you place in Vercel determines whether Paystack uses test or live transactions. Never put any secret key in browser JavaScript or HTML.

## Payment methods and currencies

The page offers card and mobile-money choices. The selected option is passed to Paystack as a requested checkout channel. The availability of KES, NGN, GHS, ZAR, and individual payment methods depends on your Paystack account and supported markets. Confirm these settings in Paystack before publishing. If a payment method is not enabled for your account or test environment, checkout may show an error or not offer that method.

## Project structure

```text
.
├── api/
│   ├── initialize.js   # Securely starts a Paystack transaction
│   └── verify.js       # Verifies a transaction with Paystack
├── public/
│   └── index.html      # Frontend, donation form, thank-you UI, WhatsApp button
├── vercel.json         # Vercel build and routing configuration
├── package.json
├── .env.example        # Safe placeholder configuration example
└── README.md
```

## Troubleshooting

- **“Add PAYSTACK_SECRET_KEY”**: Set the environment variable in Vercel and redeploy.
- **Test mode key error**: Ensure a test secret key and the key starts with `sk_test_`.
- **Live mode key error**: Ensure a live secret key and the key starts with `sk_live_`.
- **Mobile money is missing**: Check whether Paystack supports and has enabled it for the selected currency, account, and test/live mode.
- **Payment completed but success is not shown**: Check the transaction reference in Paystack and verify that Vercel has the matching test or live secret key.

This project has not been connected to your Paystack account or tested with real credentials. Test it using your own Paystack test keys before publishing.


## Callback URL

This project does not use an `APP_BASE_URL` environment variable and does not send `callback_url` during transaction initialization. Set the deployed Vercel website URL as the callback URL in your Paystack Dashboard. Paystack will use that dashboard setting after checkout.

## Test and live payments

There is no `PAYSTACK_MODE` environment variable. Set `PAYSTACK_SECRET_KEY` to a test secret key while testing. When ready for real donations, replace it with your live secret key in Vercel and redeploy. Never expose the secret key in frontend code or commit it to a public repository.
