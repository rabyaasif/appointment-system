# Appointment System - Backend (Phase 1)

Express + MySQL + JWT. Is phase mein: database tables, server setup, register/login.

## Folder structure

```
backend/
├── config/db.js                  # MySQL connection
├── controllers/authController.js # register, login, me
├── database/schema.sql           # saari tables
├── middleware/auth.js            # verifyToken + authorizeRoles (RBAC)
├── routes/authRoutes.js
├── scripts/seedAdmin.js          # pehla admin banane ke liye
├── server.js
├── package.json
└── .env.example
```

## Setup (step by step)

1. **Packages install karein**
   ```bash
   cd backend
   npm install
   ```

2. **Database banayein** (MySQL chal raha ho)
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   Ya MySQL Workbench mein `schema.sql` kholke run kar dein.

3. **.env file banayein**
   `.env.example` ko copy karke `.env` naam dein, phir apna MySQL password aur `JWT_SECRET` likhein.

4. **Admin account banayein**
   ```bash
   npm run seed:admin
   ```

5. **Server chalayein**
   ```bash
   npm run dev
   ```
   Browser mein `http://localhost:5000/` kholein, message dikhna chahiye.

## API endpoints

| Method | URL | Kya karta hai | Token chahiye? |
|--------|-----|---------------|----------------|
| POST | `/api/auth/register` | Naya customer account | Nahi |
| POST | `/api/auth/login` | Login, token milta hai | Nahi |
| GET | `/api/auth/me` | Apni profile | Haan |

### Postman mein test

**Register** - `POST http://localhost:5000/api/auth/register`
```json
{
  "name": "Ali Khan",
  "email": "ali@example.com",
  "password": "123456",
  "phone": "03001234567"
}
```

**Login** - `POST http://localhost:5000/api/auth/login`
```json
{
  "email": "ali@example.com",
  "password": "123456"
}
```

**Me** - `GET http://localhost:5000/api/auth/me`
Headers mein: `Authorization: Bearer <login se mila hua token>`

## Zaroori baatein

- Public register se sirf **customer** banta hai. Admin seed script se banta hai, aur staff accounts admin banayega (Phase 2).
- Password hamesha hash hokar save hota hai.
- `.env` ko GitHub par push na karein.
