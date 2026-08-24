# 🗄️ Database Architecture & Data Dictionary

> **DBMS**: MySQL 8.0+  
> **ORM Engine**: Sequelize v6+  
> **Naming Standard**: camelCase attributes mapped to snake_case column keys  

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o| SALONS : "owns (1:1)"
    USERS ||--o| EMPLOYEES : "has profile (1:1)"
    USERS ||--o{ APPOINTMENTS : "books as customer (1:N)"
    USERS ||--o{ NOTIFICATIONS : "receives (1:N)"
    USERS ||--o{ REVIEWS : "writes (1:N)"

    SALONS ||--o{ EMPLOYEES : "employs (1:N)"
    SALONS ||--o{ SERVICES : "offers (1:N)"
    SALONS ||--o{ BUSINESS_HOURS : "configures (1:7)"
    SALONS ||--o{ SALON_IMAGES : "gallery (1:N)"
    SALONS ||--o{ APPOINTMENTS : "hosts (1:N)"
    SALONS ||--o{ REVIEWS : "evaluated by (1:N)"
    SALONS }|--|{ CATEGORIES : "tagged via SalonCategory"

    EMPLOYEES ||--o{ APPOINTMENTS : "performs (1:N)"
    EMPLOYEES }|--|{ SERVICES : "specializes in via EmployeeService"

    CATEGORIES ||--o{ SERVICES : "classifies (1:N)"

    APPOINTMENTS ||--o| PAYMENTS : "billed via (1:1)"
    APPOINTMENTS ||--o{ NOTIFICATIONS : "triggers (1:N)"

    USERS {
        int id PK
        string name
        string email UK
        string password
        enum role "CUSTOMER, OWNER, EMPLOYEE, ADMIN"
        string phone
        string profileImage
        string telegramChatId
        boolean telegramNotifications
        datetime createdAt
        datetime updatedAt
    }

    SALONS {
        int id PK
        int ownerId FK
        string name
        text description
        string address
        string city
        string phone
        string email
        string logo
        enum status "PENDING, APPROVED, SUSPENDED"
        float rating
        datetime createdAt
        datetime updatedAt
    }

    EMPLOYEES {
        int id PK
        int userId FK
        int salonId FK
        string name
        string phone
        string email
        string photo
        string bio
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    SERVICES {
        int id PK
        int salonId FK
        int categoryId FK
        string name
        text description
        decimal price
        int durationMinutes
        string photo
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    BUSINESS_HOURS {
        int id PK
        int salonId FK
        enum dayOfWeek "MONDAY..SUNDAY"
        time openTime
        time closeTime
        boolean isClosed
    }

    APPOINTMENTS {
        int id PK
        int customerId FK
        int salonId FK
        int employeeId FK
        int serviceId FK
        date appointmentDate
        time appointmentTime
        int durationMinutes
        decimal totalPrice
        enum status "PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED"
        text notes
        datetime createdAt
    }

    PAYMENTS {
        int id PK
        int appointmentId FK
        decimal amount
        enum method "CHAPA, CASH, TELEBIRR, CBE_BIRR"
        enum status "PENDING, COMPLETED, FAILED, REFUNDED"
        string tx_ref UK
        string paymentReference
        datetime paymentDate
    }

    CATEGORIES {
        int id PK
        string name UK
        string description
        string icon
        boolean isActive
    }

    REVIEWS {
        int id PK
        int customerId FK
        int salonId FK
        int rating "1..5"
        text comment
        datetime createdAt
    }

    NOTIFICATIONS {
        int id PK
        int userId FK
        int bookingId FK
        string title
        text message
        enum type "BOOKING, PAYMENT, SYSTEM, REMINDER"
        boolean isRead
        datetime createdAt
    }
```

---

## 2. Table Specifications & Constraints

### 2.1 `Users`
Central account credentials and global role identity.
- `id`: INT (Auto Increment, Primary Key)
- `name`: VARCHAR(255), NOT NULL
- `email`: VARCHAR(255), UNIQUE, NOT NULL
- `password`: VARCHAR(255), NOT NULL (Bcrypt hashed)
- `role`: ENUM('CUSTOMER', 'OWNER', 'EMPLOYEE', 'ADMIN'), DEFAULT 'CUSTOMER'
- `phone`: VARCHAR(50), NULLABLE
- `profileImage`: VARCHAR(255), DEFAULT '/uploads/defaults/user.png'
- `telegramChatId`: VARCHAR(100), NULLABLE (Indexed)
- `telegramNotifications`: BOOLEAN, DEFAULT true

### 2.2 `Salons`
Registered salon entities and owner linkage.
- `id`: INT (Auto Increment, Primary Key)
- `ownerId`: INT, FOREIGN KEY (`Users.id`) ON DELETE CASCADE
- `name`: VARCHAR(255), NOT NULL
- `description`: TEXT, NULLABLE
- `address`: VARCHAR(255), NOT NULL
- `city`: VARCHAR(100), NOT NULL
- `phone`: VARCHAR(50), NOT NULL
- `email`: VARCHAR(100), NULLABLE
- `logo`: VARCHAR(255), NULLABLE
- `status`: ENUM('PENDING', 'APPROVED', 'SUSPENDED'), DEFAULT 'PENDING'
- `rating`: DECIMAL(3,2), DEFAULT 0.00

### 2.3 `Employees`
Staff members assigned to salons.
- `id`: INT (Auto Increment, Primary Key)
- `userId`: INT, FOREIGN KEY (`Users.id`) ON DELETE SET NULL
- `salonId`: INT, FOREIGN KEY (`Salons.id`) ON DELETE CASCADE
- `name`: VARCHAR(255), NOT NULL
- `phone`: VARCHAR(50), NULLABLE
- `email`: VARCHAR(100), NULLABLE
- `photo`: VARCHAR(255), NULLABLE
- `bio`: TEXT, NULLABLE
- `isActive`: BOOLEAN, DEFAULT true

### 2.4 `Services`
Service menu offered by salons with pricing and duration.
- `id`: INT (Auto Increment, Primary Key)
- `salonId`: INT, FOREIGN KEY (`Salons.id`) ON DELETE CASCADE
- `categoryId`: INT, FOREIGN KEY (`Categories.id`) ON DELETE SET NULL
- `name`: VARCHAR(255), NOT NULL
- `description`: TEXT, NULLABLE
- `price`: DECIMAL(10, 2), NOT NULL
- `durationMinutes`: INT, NOT NULL (e.g. 30, 45, 60, 90)
- `photo`: VARCHAR(255), NULLABLE
- `isActive`: BOOLEAN, DEFAULT true

### 2.5 `Appointments`
Booking orders placed by customers.
- `id`: INT (Auto Increment, Primary Key)
- `customerId`: INT, FOREIGN KEY (`Users.id`) ON DELETE CASCADE
- `salonId`: INT, FOREIGN KEY (`Salons.id`) ON DELETE CASCADE
- `employeeId`: INT, FOREIGN KEY (`Employees.id`) ON DELETE RESTRICT
- `serviceId`: INT, FOREIGN KEY (`Services.id`) ON DELETE RESTRICT
- `appointmentDate`: DATE, NOT NULL
- `appointmentTime`: TIME, NOT NULL
- `durationMinutes`: INT, NOT NULL
- `totalPrice`: DECIMAL(10, 2), NOT NULL
- `status`: ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'), DEFAULT 'PENDING'
- `notes`: TEXT, NULLABLE

### 2.6 `Payments`
Financial transactions and gateway references.
- `id`: INT (Auto Increment, Primary Key)
- `appointmentId`: INT, FOREIGN KEY (`Appointments.id`) ON DELETE CASCADE
- `amount`: DECIMAL(10, 2), NOT NULL
- `method`: ENUM('CHAPA', 'CASH', 'TELEBIRR', 'CBE_BIRR'), DEFAULT 'CHAPA'
- `status`: ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'), DEFAULT 'PENDING'
- `tx_ref`: VARCHAR(255), UNIQUE, NOT NULL
- `paymentReference`: VARCHAR(255), NULLABLE

---

## 3. Indexing & Optimization Strategy
1. **Unique Lookups**: `Users(email)`, `Payments(tx_ref)`, `Categories(name)`.
2. **Booking Slot Queries**: Composite index on `Appointments(salonId, employeeId, appointmentDate, status)` ensures sub-millisecond slot conflict lookups.
3. **Foreign Key Integrity**: Cascades configured to cleanly remove child records when salons or owners are purged, while protecting historical transactional ledgers (`RESTRICT` on appointment services and employees).
