# 📡 REST API Reference & Specification

> **Base URL**: `http://localhost:5000/api`  
> **Standard Response Format**: `application/json`  
> **Auth Header Format**: `Authorization: Bearer <JWT_TOKEN>`

---

## Table of Contents
- [1. Authentication Endpoints (`/api/auth`)](#1-authentication-endpoints-apiauth)
- [2. Customer & Public Discovery Endpoints (`/api/customer`)](#2-customer--public-discovery-endpoints-apicustomer)
- [3. Salon Owner Operations (`/api/owner`)](#3-salon-owner-operations-apiowner)
- [4. Employee Workstation (`/api/employee`)](#4-employee-workstation-apiemployee)
- [5. Platform Administrator (`/api/admin`)](#5-platform-administrator-apiadmin)
- [6. Payment & Chapa Integration (`/api/payments`)](#6-payment--chapa-integration-apipayments)
- [7. Notifications & Telegram Bridge (`/api/notifications`, `/api/telegram`)](#7-notifications--telegram-bridge)

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register Customer
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "phone": "+251911223344"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 14,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER",
    "phone": "+251911223344"
  }
}
```

### 1.2 User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 14,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "CUSTOMER",
    "profileImage": "/uploads/customers/avatar-14.png"
  }
}
```

### 1.3 Google OAuth Authentication
- **Method**: `POST`
- **Path**: `/api/auth/google`
- **Access**: Public
- **Request Body**:
```json
{
  "credential": "<GOOGLE_JWT_ID_TOKEN>"
}
```

### 1.4 Forgot Password & Password Reset
- `POST /api/auth/forgot-password` -> `{ "email": "user@example.com" }`
- `POST /api/auth/reset-password` -> `{ "email": "user@example.com", "otp": "492019", "newPassword": "NewPassword123!" }`

---

## 2. Customer & Public Discovery Endpoints (`/api/customer`)

### 2.1 Get Public Salons Catalog
- **Method**: `GET`
- **Path**: `/api/customer/salons`
- **Access**: Public
- **Query Parameters**:
  - `search` *(string, optional)*: Match name, city, address
  - `category` *(number, optional)*: Filter by Category ID
  - `rating` *(number, optional)*: Minimum rating (1-5)
  - `page` *(number, default: 1)*
  - `limit` *(number, default: 12)*
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "salons": [
      {
        "id": 1,
        "name": "Luxe Glamour Studio",
        "description": "Premium hair styling and organic spa treatments.",
        "address": "Bole Medhanialem, Suite 402",
        "city": "Addis Ababa",
        "phone": "+251911000111",
        "logo": "/uploads/salons/logo-1.jpg",
        "rating": 4.8,
        "categories": [{ "id": 1, "name": "Hair Care" }, { "id": 3, "name": "Spa" }],
        "images": [{ "id": 10, "imageUrl": "/uploads/salons/gallery-1.jpg" }]
      }
    ],
    "total": 24,
    "page": 1,
    "totalPages": 2
  }
}
```

### 2.2 Calculate Available Booking Slots
- **Method**: `GET`
- **Path**: `/api/customer/bookings/available-slots`
- **Access**: `CUSTOMER`
- **Query Parameters**:
  - `salonId` *(required)*: `1`
  - `employeeId` *(required)*: `4`
  - `date` *(required)*: `2026-08-25`
  - `serviceIds` *(required)*: `2,5` (comma separated)
- **Response `200 OK`**:
```json
{
  "success": true,
  "date": "2026-08-25",
  "totalDurationMinutes": 75,
  "businessHours": {
    "openingTime": "09:00",
    "closingTime": "18:00",
    "isClosed": false
  },
  "availableSlots": [
    "09:00", "09:30", "10:15", "11:30", "14:00", "15:15", "16:30"
  ]
}
```

### 2.3 Create Multi-Service Appointment
- **Method**: `POST`
- **Path**: `/api/customer/bookings`
- **Access**: `CUSTOMER`
- **Request Body**:
```json
{
  "salonId": 1,
  "employeeId": 4,
  "appointmentDate": "2026-08-25",
  "appointmentTime": "10:15",
  "serviceIds": [2, 5],
  "notes": "Prefer hypoallergenic shampoo."
}
```

### 2.4 Cancel Appointment
- **Method**: `PATCH`
- **Path**: `/api/customer/bookings/:id/cancel`
- **Access**: `CUSTOMER`
- **Request Body**: `{ "reason": "Schedule conflict" }`

---

## 3. Salon Owner Operations (`/api/owner`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/owner/salon` | Fetch own salon profile, gallery & status |
| `PUT` | `/api/owner/salon` | Update salon name, bio, address, phone |
| `PUT` | `/api/owner/business-hours` | Batch update weekly operating hours |
| `PUT` | `/api/owner/salon/logo` | Upload salon brand logo (`multipart/form-data`) |
| `POST`| `/api/owner/salon/gallery` | Add gallery showcase photo |
| `DELETE` | `/api/owner/salon/gallery` | Delete salon gallery image |
| `GET` | `/api/owner/employees` | List all staff members with assigned services |
| `POST`| `/api/owner/employees` | Add new employee account & initial assignment |
| `PUT` | `/api/owner/employees/:id` | Update staff details, status & working hours |
| `DELETE` | `/api/owner/employees/:id`| Remove staff member |
| `POST`| `/api/owner/employees/:id/services` | Map services to specific employee |
| `GET` | `/api/owner/services` | Get all salon services & pricing |
| `POST`| `/api/owner/services` | Create new service (duration, price, category) |
| `PUT` | `/api/owner/services/:id` | Edit service details |
| `DELETE`| `/api/owner/services/:id` | Soft delete or remove service |
| `GET` | `/api/owner/bookings` | View incoming/active salon bookings filterable by date & status |
| `PATCH`| `/api/owner/bookings/:id/accept` | Accept pending appointment |
| `PATCH`| `/api/owner/bookings/:id/reject` | Reject appointment with feedback |
| `PATCH`| `/api/owner/bookings/:id/complete`| Mark appointment fulfilled |
| `GET` | `/api/owner/transactions` | Financial ledger with revenue aggregations |
| `GET` | `/api/owner/customers` | Customer directory & visit history |

---

## 4. Employee Workstation (`/api/employee`)

- `GET /api/employee/bookings` — View appointments assigned to authenticated employee. Filter by `status` (PENDING, CONFIRMED, COMPLETED).
- `PATCH /api/employee/bookings/:id/accept` — Accept assigned booking.
- `PATCH /api/employee/bookings/:id/reject` — Reject booking with reason.
- `PATCH /api/employee/bookings/:id/complete` — Mark finished appointment.
- `GET /api/employee/profile` — Fetch employee profile, bio, specialties.
- `PUT /api/employee/profile` — Update phone, bio, and availability.

---

## 5. Platform Administrator (`/api/admin`)

- `GET /api/admin/salons` — List all registered salons with status (`PENDING`, `APPROVED`, `SUSPENDED`).
- `POST /api/admin/salons` — Register new salon entity on platform.
- `PATCH /api/admin/salons/:id/status` — Approve or Suspend salon (`{ "status": "APPROVED" }`).
- `POST /api/admin/owners` — Create salon owner login account.
- `POST /api/admin/salons/assign-owner` — Link owner account to salon.
- `GET /api/admin/categories` — List all global taxonomy categories.
- `POST /api/admin/categories` — Add new category (e.g., "Nail Art", "Barbering").
- `PUT /api/admin/categories/:id` — Rename category.
- `DELETE /api/admin/categories/:id` — Delete category.
- `GET /api/admin/reports/statistics` — Overall metrics (Total revenue, active salons, daily booking volume, user growth).

---

## 6. Payment & Chapa Integration (`/api/payments`)

### 6.1 Initialize Chapa Payment
- **Method**: `POST`
- **Path**: `/api/payments`
- **Access**: `CUSTOMER`
- **Request Body**:
```json
{
  "appointmentId": 88,
  "amount": "650.00",
  "currency": "ETB",
  "email": "customer@example.com",
  "firstName": "Abebe",
  "lastName": "Bikila",
  "phone": "+251911002233"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "checkoutUrl": "https://checkout.chapa.co/checkout/web/payment/...",
  "payment": {
    "id": 42,
    "appointmentId": 88,
    "amount": "650.00",
    "status": "PENDING",
    "tx_ref": "SALON-TX-1740312000-88"
  }
}
```

### 6.2 Chapa Verification & Webhook Redirect
- **Method**: `GET`
- **Path**: `/api/payments/chapa/verify?tx_ref=SALON-TX-1740312000-88`
- **Access**: Public / Callback redirect

---

## 7. Notifications & Telegram Bridge

### 7.1 In-App Notifications
- `GET /api/notifications` — Fetch user's alerts.
- `PATCH /api/notifications/:id/read` — Mark notification read.
- `PATCH /api/notifications/read-all` — Mark all as read.

### 7.2 Telegram Link & Control
- `GET /api/telegram/link-token` — Generate unique one-time token for bot activation.
- `GET /api/telegram/status` — Returns `{ isLinked: true, username: "@janedoe" }`.
- `POST /api/telegram/unlink` — Disconnects Telegram account.
- `POST /api/telegram/toggle-notifications` — Enables or disables Telegram alerts.
