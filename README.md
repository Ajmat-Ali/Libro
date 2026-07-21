# Libro

Libro is a full-stack library management system built to manage library operations for multiple user roles such as owners, members/students, and guards. The platform supports library setup, floor and seat management, booking, payments, QR-based attendance, and role-based dashboards.

It was developed as a practical, real-world project to simulate how a modern library or study-center management system would work in production.

## Project Overview

Libro helps a library owner manage:

- library setup and configuration
- floors and seat layouts
- time slots and pricing plans
- member registration and approvals
- seat bookings
- payments and fee tracking
- QR code generation for membership and attendance
- attendance tracking with guard scan support

The system is designed around three main user roles:

- Owner/Admin: full control of the platform
- Member/Student: can register, view dashboards, book seats, and manage personal activity
- Guard: can scan QR codes and mark attendance quickly

## What This Project Is About

This project aims to solve the problem of manually managing a library’s day-to-day operations. Instead of handling everything through spreadsheets or paper records, this system provides a centralized digital platform for:

- seat allocation
- membership management
- booking workflows
- attendance tracking
- payment recording
- automated QR-based check-ins

## Key Features

### 1. Authentication and Role-Based Access

- owner/admin registration and login
- member/student registration and approval flow
- secure authentication using JWT
- role-based access control for different modules

### 2. Library Setup

- library profile creation and management
- opening/closing time configuration
- working day and holiday setup

### 3. Floor and Seat Management

- create, update, and delete floors
- manage seats by floor and seat type
- visual seat layout support

### 4. Booking System

- student/member book seats
- seat availability management
- booking history and status tracking

### 5. Payment and Membership Management

- plan and pricing management
- payment recording
- fee status tracking
- membership lifecycle support

### 6. QR-Based Attendance

- QR code generation for members
- scan-based attendance tracking by guard
- entry log management

### 7. Dashboard and Reporting

- owner dashboard with key stats
- reporting support for attendance, payments, and active usage

## Tech Stack

- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT, bcrypt
- File Uploads: Multer + Cloudinary
- Payments: Razorpay
- QR: qrcode
- PDF Generation: PDFKit
- Security: Helmet, CORS, Express Rate Limiting
- Dev Tooling: Nodemon

## Project Structure

- src/app.js: main Express application setup
- src/routes: API routes for auth, bookings, payments, QR, attendance, and dashboard
- src/controllers: business logic for each domain
- src/models: MongoDB schemas for users, bookings, payments, seats, attendance, and more
- src/middlewares: authentication, upload, rate limiting, and access control
- src/config: database, Cloudinary, and payment configuration

## How the System Works

1. The owner registers and sets up the library.
2. Floors, seats, slots, and pricing plans are created.
3. Members register and wait for approval.
4. Approved members can browse available seats and place booking.
5. The owner manages bookings.
6. Attendance is recorded through QR scanning by guards.
7. Payments and membership statuses are tracked in the system.

## Installation and Setup

### Prerequisites

- Node.js
- MongoDB
- npm

### Steps

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a .env file with the required environment variables:

```env
PORT=2020
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NODE_ENV=development
```

4. Run the server:

```bash
npm run dev
```

The server will start on the configured port.

## What I Built / Implemented

This project includes the core backend modules for:

- authentication and authorization
- library configuration
- floor and seat management
- booking workflow
- payment integration
- QR generation and attendance handling
- role-based access for owners, students, and guards

I focused on building a practical, scalable backend architecture that can support real-world library operations.

## Future Enhancements

Possible next steps for the project:

- add advanced analytics and charts
- strengthen admin reporting
- add automated notifications and reminders
- Build Frontend for Member
- flexible booking for any number of days

## Why This Project Is Strong for Interviews

This project demonstrates:

- end-to-end full-stack development thinking
- backend API design and modular architecture
- authentication and authorization implementation
- multi-role system design
- real-world business workflow modeling
- integration with third-party services like Razorpay and Cloudinary
- problem-solving around operational workflows rather than just basic CRUD

### Interview Summary You Can Use

“I built Libro, a library management platform designed for owners, members, and guards. The project includes role-based access, seat booking flow, member management, payments, QR-based attendance, and library setup modules. I implemented the backend architecture using Node.js, Express, MongoDB, and several integrations such as Razorpay and Cloudinary. The project reflects my ability to design practical systems for real-world business operations and manage complex workflows through a single platform.”

## Conclusion

Libro is a strong example of a business-oriented backend project that combines multiple real-world features into one system. It is suitable for showcasing full-stack development skills, API design, database modeling, authentication, and industry-style workflow implementation.
