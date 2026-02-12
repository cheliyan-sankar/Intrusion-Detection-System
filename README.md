# DemoKart

DemoKart is a Flipkart-inspired demo store with a public catalog and a secure admin panel for product uploads.

## Quick Start

1. Install dependencies:
	- `npm install`
2. Configure admin credentials (optional but recommended):
	- Copy `.env.example` to `.env` and update values.
3. Start the server:
	- `npm start`
4. Open in browser:
	- Storefront: `http://localhost:3000/`
	- Admin panel: `http://localhost:3000/admin.html`

## Admin Access

Admin login uses the credentials from `.env`:

```
ADMIN_USER=admin
ADMIN_PASS=change-me
```

If no `.env` is provided, default values are used:

- Username: `admin`
- Password: `admin123`

## Notes

- Products are stored in a local SQLite database at `data/demokart.db`.
- The admin panel allows adding and deleting products.