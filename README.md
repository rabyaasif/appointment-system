# Smart Appointment Management System

A web app for booking doctor appointments. Patients choose a service, a doctor, a date and a free time slot. Doctors and admins manage the schedule.

> Status: work in progress.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Auth:** bcryptjs (password hashing), JWT (planned)

## Roles

- **Patient:** books and manages their own appointments
- **Doctor:** sets availability and sees their own appointments
- **Admin:** manages services, doctors and all bookings

## Features

Done:
- Login and Signup pages
- Signup API with validation and password hashing (new accounts are always `patient`)
- Dashboard layout, Services page, Book Appointment page, My Appointments page (dummy data for now)
- MySQL schema (users, services, doctor_services, doctor_availability, appointments)

In progress / planned:
- OTP verification after signup (see below)
- Login API with JWT
- Protected routes and role-based access
- Real appointments, slot conflict checking and status updates
- Email notifications (Nodemailer)
- Admin and doctor dashboards

## Planned: Email OTP Verification

After signup, the user is taken to an OTP page to verify their email.

**Current behavior (development only):**
- The backend creates an OTP and the OTP page is auto-filled, so the flow can be tested without email.
- This auto-fill is controlled by a development setting in `backend/.env` and must be turned off in production.

**Planned behavior (production):**
- The OTP is sent to the user's email (Nodemailer with Gmail SMTP and an app password).
- The user opens their email, reads the OTP and types it in.
- OTPs are stored hashed, expire after a few minutes and allow a limited number of attempts.
- A "Resend OTP" option with a cooldown.
- Remove the auto-fill from the OTP page.
- Users who have not verified their email cannot log in.

## Project Structure

```
appointment-system/
  frontend/   React app
  backend/    Express API and database scripts
```

## Getting Started

### 1. Database

1. Install MySQL and open MySQL Workbench.
2. Run `backend/database/schema.sql`.
3. Create a MySQL user with SELECT, INSERT, UPDATE and DELETE access on `appointment_system`.

### 2. Backend

```
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your values, then:

```
npm run dev
```

The API runs on `http://localhost:5000`. Check `http://localhost:5000/api/health`.

### 3. Frontend

```
cd frontend
npm install
```

Copy `.env.example` to `.env`, then:

```
npm run dev
```

The app runs on `http://localhost:5173`.

## Environment Variables

Real `.env` files are never committed. Each folder has a `.env.example` showing what is needed.

## Design System

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for colors, typography, spacing and reusable components.