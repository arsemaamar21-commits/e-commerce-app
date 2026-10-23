# Arsema Market

Customer storefront and inventory/order administration built with Next.js, Express, and MongoDB.

## Run locally

1. Start MongoDB locally, or set `MONGODB_URI` to a MongoDB connection string.
2. In `backend`, set `ADMIN_EMAIL` to the email address that should receive administrator access. Set a long random `TOKEN_SECRET` before deployment.
3. Start the API with `npm run dev` from `backend`. It listens on port 5000 and idempotently seeds the catalog to 100 sample products across eight categories.
4. Start the storefront with `npm run dev` from `frontend`, then open http://localhost:3000.
5. Create the account using the configured `ADMIN_EMAIL` to access `/admin`. Other registrations receive customer access.

The frontend API base defaults to `http://localhost:5000`. Set `NEXT_PUBLIC_API_URL` when the API runs elsewhere.

## Included workflows

- Customer registration, sign-in, profile editing, catalog search/category filtering/price sorting, cart quantity editing, and wishlist.
- Checkout with a delivery address, database-priced orders, inventory reservation, and customer order tracking.
- Admin product and stock management, order status changes, customer listing, revenue summary, and best sellers.

Chapa, Telebirr, and card are recorded as the selected payment method, but orders remain `pending` until a payment provider and signed webhook are configured. This project does not collect payment credentials or claim a payment succeeded. The optional vendor portal is not included because the current app is single-store.

## Production checklist

- Configure `MONGODB_URI`, a cryptographically random `TOKEN_SECRET`, `ADMIN_EMAIL`, `FRONTEND_ORIGIN`, and `NEXT_PUBLIC_API_URL`.
- Use HTTPS, secure HttpOnly sessions, rate limiting, and a payment-provider callback that verifies signatures before changing `paymentStatus` to `paid`.
- Configure a MongoDB replica set if order creation and inventory updates need multi-document transactions.