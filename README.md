# Car Resale Marketplace

A MERN stack used-car resale marketplace adapted from a car rental app. Buyers can browse cars for sale, filter listings, review resale details, and send purchase enquiries with an offer price. Sellers can list cars, manage listing visibility, and respond to buyer enquiries from a dashboard.

For deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Features

- Buyer-facing used-car search by location, make, model, category, fuel, transmission, and condition
- Sale listing detail page with asking price, mileage, title status, condition, color, and seller enquiry form
- Seller listing form with resale fields such as mileage, condition, title status, cylinders, and paint color
- Quick asking-price estimator in the listing form based on resale factors
- Seller dashboard for total listings, total enquiries, pending enquiries, accepted enquiries, and accepted offer value
- Image upload through ImageKit
- JWT authentication with buyer and seller roles

## ML Backend

The root folder includes `MINI.ipynb`, which contains the car price modelling experiments using tree, boosting, gating, and stacking ensemble approaches. The web app currently includes a lightweight listing-price helper in React so sellers can quickly prefill an asking price.

This project now includes `ml_backend/`, a FastAPI service that trains a LightGBM resale price model from `../craigslist_vehicles.csv` and exposes it at `/predict`. The seller listing form calls Express, and Express calls this ML backend through `ML_API_URL`.

Train the model:

```powershell
python ml_backend/train_model.py --rows 60000
```

Run the ML backend:

```powershell
python -m uvicorn ml_backend.app:app --host 127.0.0.1 --port 8000
```

Run Express with the ML API URL:

```powershell
cd server
$env:PORT='5000'
$env:ML_API_URL='http://127.0.0.1:8000'
npm run start
```

Run React:

```powershell
cd client
$env:VITE_BASE_URL='http://localhost:5000'
npm run dev -- --host 127.0.0.1 --port 5173
```

In VS Code, use `Terminal -> Run Task...` and run:

```text
1 Train ML model
2 Start ML backend
3 Start Express backend
4 Start React client
```

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Media: ImageKit
- Auth: JSON Web Tokens

## Project Structure

```text
CarResale-fullstack/
  client/
    src/
      components/
      pages/
      context/
      assets/
  server/
    configs/
    controllers/
    middleware/
    models/
    routes/
```

## Environment

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
ML_API_URL=http://127.0.0.1:8000
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=your_stripe_secret_key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=Car Resale <no-reply@example.com>
PORT=3000
```

Create `client/.env`:

```env
VITE_BASE_URL=http://localhost:3000
VITE_CURRENCY=$
```

Notes:

- MongoDB will create the database automatically on first connect. If your URI does not specify a database name, the app will use `car-resale`.
- Car and profile image uploads are sent to ImageKit, which is safer for production than local disk storage.
- This project uses JWT-based authentication and stores tokens in `localStorage`. It does not currently integrate Clerk.

## Run Locally

Install dependencies:

```bash
cd server
npm install

cd ../client
npm install
```

Seed the database with sample users and a listing:

```bash
cd server
npm run seed
```

Start the backend:

```bash
cd server
npm run server
```

Start the frontend:

```bash
cd client
npm run dev
```

## Main API Routes

```text
POST /api/user/register
POST /api/user/login
GET  /api/user/data
GET  /api/user/cars
GET  /api/user/ml-health
POST /api/user/predict-price

POST /api/owner/change-role
POST /api/owner/add-car
GET  /api/owner/cars
POST /api/owner/toggle-car
POST /api/owner/delete-car
GET  /api/owner/dashboard

POST /api/inquiries/create
GET  /api/inquiries/user
GET  /api/inquiries/owner
POST /api/inquiries/change-status
```
