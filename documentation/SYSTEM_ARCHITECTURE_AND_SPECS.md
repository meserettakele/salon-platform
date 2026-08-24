# 🏛️ System Architecture & Technical Specifications

> **Salon Platform** — Enterprise Full-Stack Multi-Tenant Beauty & Wellness Booking Ecosystem

---

## 1. System Architecture Overview

The Salon Platform is built upon a modern, decoupled client-server architecture with a 3-tier structure:
1. **Presentation Layer (Frontend)**: React 18 SPA powered by Vite, Tailwind/Modular CSS, and React Router.
2. **Application / Business Logic Layer (Backend)**: Node.js with Express RESTful API, JWT Role-Based Authorization, Multer media pipeline, and Telegram bot notification bridge.
3. **Data Layer (Database & Storage)**: MySQL relational database with Sequelize ORM, connection pooling, and structured static asset storage.

```mermaid
graph TB
    subgraph Client_Layer ["🌐 Client Layer (Vite + React SPA)"]
        CustomerUI["Customer Portal<br/>(Discovery, Multi-Service Booking, Chapa Pay)"]
        OwnerUI["Salon Owner Dashboard<br/>(Staff, Services, Hours, Analytics)"]
        EmployeeUI["Employee Portal<br/>(Assigned Shifts & Appointments)"]
        AdminUI["Platform Admin Console<br/>(Salons, Audits, Platform Metrics)"]
    end

    subgraph Gateway ["🛡️ API & Security Gateway"]
        CORS["CORS & Request Sanitize"]
        JWTMiddleware["JWT Auth & Role Guard<br/>(CUSTOMER | OWNER | EMPLOYEE | ADMIN)"]
        RateLimit["Upload & Input Validators"]
    end

    subgraph API_Services ["⚙️ Express Application Services"]
        AuthService["Auth & Google OAuth Service"]
        BookingEngine["Multi-Service Slot Allocation Engine"]
        PaymentService["Chapa Payment Gateway & Webhook Verification"]
        NotificationEngine["Notification Engine + Telegram Bot Bridge"]
        StaffService["Staff & Service Rostering Service"]
        AnalyticsService["Revenue & Reporting Service"]
    end

    subgraph Data_Storage ["💾 Data & Storage Layer"]
        MySQL[("MySQL Database<br/>(Sequelize ORM)")]
        StaticStore[("Local Disk / Cloud Storage<br/>(Logos, Galleries, Avatars)")]
    end

    subgraph External_Services ["🔌 External Integrations"]
        Chapa["Chapa Payment Gateway (ETB)"]
        Telegram["Telegram Bot API (Instant Alerts)"]
        GoogleOAuth["Google Identity Services"]
    end

    Client_Layer --> Gateway
    Gateway --> API_Services
    API_Services --> MySQL
    API_Services --> StaticStore
    PaymentService <--> Chapa
    NotificationEngine <--> Telegram
    AuthService <--> GoogleOAuth
```

---

## 2. Core Functional Modules

```mermaid
mindmap
  root((Salon Platform))
    Authentication & Security
      JWT Tokens
      Bcrypt Password Hashing
      Role-Based Access Control
      Google OAuth2 Integration
      Password Reset OTP Flow
    Salon & Catalog Management
      Multi-category Tagging
      Salon Galleries & Logos
      Service Hierarchy & Durations
      Custom Business Hours per Day
    Multi-Service Booking Engine
      Staff Skill Mapping
      Multi-service Selection
      Dynamic Total Duration Calc
      Conflict-Free Slot Generation
      Status Lifecycle Management
    Financials & Payments
      Chapa Payment Integration
      Transaction Ledgers
      Salon Owner Daily/Monthly Revenue
      Payment Receipt Confirmation
    Smart Notification Engine
      In-App Notification Center
      Telegram Push Alerts
      Real-Time Status Updates
    Role Dashboards
      Customer Portal
      Owner Business Suite
      Employee Workstation
      Super Admin Oversight
```

---

## 3. Multi-Role Access Control Matrix

| Feature / Action | Guest | Customer | Salon Owner | Employee | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Browse Salons & Services** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Search & Filter Salons** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Register Account (Self)** | ✅ | ✅ | ❌ (Admin created) | ❌ (Owner created) | ❌ |
| **Book Multi-Service Appointments**| ❌ | ✅ | ❌ | ❌ | ❌ |
| **Cancel Own Booking** | ❌ | ✅ (Pending only) | ❌ | ❌ | ✅ |
| **Pay via Chapa Gateway** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Manage Salon Profile & Hours** | ❌ | ❌ | ✅ (Own salon) | ❌ | ✅ (All) |
| **Add / Edit / Remove Staff** | ❌ | ❌ | ✅ (Own salon) | ❌ | ❌ |
| **Assign Services to Staff** | ❌ | ❌ | ✅ (Own salon) | ❌ | ❌ |
| **Accept / Reject Bookings** | ❌ | ❌ | ✅ | ✅ (Assigned) | ❌ |
| **Mark Booking Completed** | ❌ | ❌ | ✅ | ✅ (Assigned) | ❌ |
| **View Revenue & Financial Analytics**| ❌ | ❌ | ✅ (Own salon) | ❌ | ✅ (Platform) |
| **Approve / Suspend Salons** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manage Global Service Categories**| ❌ | ❌ | ❌ | ❌ | ✅ |
| **Link Telegram for Notifications** | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 4. Multi-Service Booking & Slot Allocation Algorithm

The platform features a slot calculation algorithm capable of booking multiple services in a single contiguous block.

### Workflow Sequence:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Frontend)
    participant API as Booking Controller
    participant Engine as Slot Allocation Service
    participant DB as MySQL Database

    Customer->>API: GET /api/customer/bookings/available-slots?salonId=1&employeeId=2&date=2026-08-25&serviceIds=3,5
    API->>DB: Query Salon Business Hours for Date (Day of Week)
    DB-->>API: Open: 09:00, Close: 18:00
    API->>DB: Query Selected Services (Durations: 30m + 45m = 75m total)
    API->>DB: Query Existing Bookings for Employee on Date (excluding CANCELLED/REJECTED)
    DB-->>API: Confirmed slots [10:00-11:00, 14:00-15:00]
    API->>Engine: Generate Time Windows (9:00 - 18:00) with Step = 15/30m
    Engine->>Engine: Filter out slots where (SlotStart + 75m > SlotEnd) OR overlaps existing booking
    Engine-->>API: Return Array of Valid Start Times ["09:00", "09:30", "11:00", "11:15", ...]
    API-->>Customer: Render Interactive Slot Grid
    Customer->>API: POST /api/customer/bookings (Payload + Service IDs + Slot)
    API->>DB: Atomic Transaction: Create Appointment + Lock Slot
    DB-->>API: Appointment #104 Created (Status: PENDING)
    API-->>Customer: Redirect to Payment / Confirmation
```

---

## 5. Payment & Transaction Flow (Chapa Gateway)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant Frontend as React Client
    participant Backend as Express Server
    participant Chapa as Chapa API Gateway
    participant DB as MySQL Database
    participant Telegram as Telegram Bot

    Customer->>Frontend: Click "Pay with Chapa" (ETB)
    Frontend->>Backend: POST /api/payments { appointmentId, amount, email, firstName, lastName }
    Backend->>Chapa: Initialize Payment (tx_ref, amount, currency="ETB", callback_url, return_url)
    Chapa-->>Backend: Return checkout_url
    Backend-->>Frontend: { checkoutUrl: "https://checkout.chapa.co/checkout/web/..." }
    Frontend->>Customer: Redirect to Chapa Hosted Payment Page
    Customer->>Chapa: Complete Card / Mobile Banking Payment
    Chapa->>Backend: Redirect back to /api/payments/chapa/verify?tx_ref=...
    Backend->>Chapa: GET /v1/transaction/verify/:tx_ref
    Chapa-->>Backend: Status: "success"
    Backend->>DB: Update Payment (Status: COMPLETED, tx_ref)
    Backend->>DB: Update Appointment (Status: CONFIRMED)
    Backend->>Telegram: Push Instant Alert to Salon Owner & Customer
    Backend->>Frontend: Redirect to /customer/payment-success?appointmentId=...
```

---

## 6. Telegram Instant Notification Pipeline

Users can connect their Telegram account directly to their Salon Platform profile via a 6-digit cryptographic OTP token or a deep link.

```mermaid
stateDiagram-v2
    [*] --> TokenGenerated: User clicks "Connect Telegram" in Profile
    TokenGenerated --> BotStarted: User sends /start <TOKEN> to @SalonPlatformBot
    BotStarted --> AccountLinked: Bot verifies token & saves Telegram Chat ID in DB
    AccountLinked --> NotificationDispatched: Trigger event occurs (New Booking / Payment / Status Change)
    NotificationDispatched --> TelegramDelivered: Bot sends formatted Markdown message to Telegram chat
    TelegramDelivered --> [*]
```

### Event Notification Triggers:
1. **`BOOKING_CREATED`**: Sent to Customer (Pending Confirmation) & Salon Owner (New Order alert).
2. **`BOOKING_ACCEPTED`**: Sent to Customer & Assigned Employee with calendar slot details.
3. **`BOOKING_REJECTED`**: Sent to Customer with explanation reason.
4. **`PAYMENT_SUCCESSFUL`**: Sent to Customer (receipt) & Salon Owner (revenue credit alert).
5. **`BOOKING_COMPLETED`**: Sent to Customer (inviting review) & Salon Owner.

---

## 7. Security & Compliance Implementation

- **Data Protection**: Passwords securely hashed with `bcryptjs` with salt round factor 10.
- **Stateless Authorization**: Signed JSON Web Tokens (JWT) containing userId, email, and role claims with strict expiration.
- **Route Protections**: Dual middleware layers (`protect` verifying bearer token integrity + `authorize(...roles)` enforcing granular least-privilege RBAC).
- **File Upload Security**: Multer with file mime-type checking (JPEG, PNG, WebP only) and strict file size limits (5MB max).
- **Input Validation**: Dedicated validator middlewares sanitizing and rejecting malformed payloads before database transactions.
- **Relational Integrity**: Foreign key constraints with cascading deletes for salons/business hours and restricted deletes for historical appointments.
