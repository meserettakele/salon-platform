# 💇 Salon Platform

A full-stack web application for discovering beauty salons, exploring services and employees, and booking appointments online.

The platform provides separate dashboards and functionality for **Customers, Salon Owners, Employees, and Platform Administrators**.

---

## 📌 Project Overview

The Salon Platform is designed to simplify the process of finding and managing beauty salon services.

Customers can discover salons, view available services and employees, select one or multiple services, check available appointment slots, make bookings, and manage their appointments.

Salon owners can manage their salon information, employees, services, business hours, bookings, customers, transactions, and revenue information.

Employees can manage assigned bookings and their employee profiles, while administrators can manage salons, categories, bookings, and system reports.

---

## ✨ Main Features

### 👤 Customer

- Customer registration and login
- Browse salons
- Search salons
- View salon details
- View salon services
- View salon employees
- Select multiple services
- View available appointment slots
- Book appointments
- View appointment history
- Cancel eligible appointments
- Make payments
- View payment information
- Receive notifications
- Manage profile
- Change password
- Forgot-password and password-reset functionality

### 💼 Salon Owner

- Manage salon profile
- Upload salon logo
- Manage salon gallery images
- Manage business hours
- Add, edit, and remove employees
- Upload employee profile photos
- Add, edit, and remove services
- Assign services to employees
- Manage bookings
- View customers
- View transactions
- View revenue information
- Receive notifications
- Manage owner profile

### 👩‍💼 Employee

- Employee login
- View assigned bookings
- View booking details
- Accept bookings
- Reject bookings
- Complete bookings
- Manage employee profile
- Change password
- Receive notifications

### 🛡️ Platform Administrator

- Admin login
- Manage salons
- Approve salons
- Suspend salons
- Manage service categories
- Manage system bookings
- View system reports
- Manage admin profile
- Change password
- Receive notifications

---

## 📅 Booking System

The platform provides a multi-service appointment booking system.

Customers can:

1. Select a salon.
2. Select one or multiple services.
3. Select an available employee when applicable.
4. View available appointment slots.
5. Create an appointment.
6. View their booking history.
7. Cancel eligible appointments.

The available time slots take the selected service duration into consideration.

---

## 💳 Payment System

The platform includes payment and transaction management.

Payment functionality includes:

- Payment processing
- Payment status tracking
- Payment records
- Appointment-payment association
- Paid and pending payment statuses
- Owner transaction history
- Revenue summaries

Salon owners can view:

- Total revenue
- Today's revenue
- Monthly revenue
- Pending payments
- Paid transaction count
- Transaction history

---

## 🔔 Notification System

The application provides notifications for important events, including:

- New bookings
- Booking assignments
- Successful payments
- Payments received
- Employee booking acceptance
- Employee booking rejection
- Booking completion

Users can view notifications from their respective dashboards.

---

## 🔐 Authentication & Security

The application uses role-based authentication and authorization.

Security features include:

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Protected frontend routes
- Protected backend routes
- Input validation
- Password change functionality
- Forgot-password functionality
- Temporary password-reset codes
- Environment variables for sensitive configuration

> **Important:** Real `.env` files and sensitive credentials are excluded from this repository using `.gitignore`.

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- Axios
- React Router

### Backend

- Node.js
- Express.js
- JavaScript
- Sequelize ORM
- JWT
- bcrypt

### Database

- MySQL

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm

---

## 📁 Project Structure

```text
salon-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeders/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── documentation/
│   └── project-requirement.md
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/meserettakele/salon-platform.git
```

Then enter the project directory:

```bash
cd salon-platform
```

---

## 🔧 Backend Setup

Go to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

Add your backend configuration, including your database connection and other required secrets.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
```

> Use the environment variables required by your existing backend configuration. Never commit your real `.env` file to GitHub.

Start the backend:

```bash
npm start
```

If your project uses a development script, you can also use:

```bash
npm run dev
```

---

## 🎨 Frontend Setup

Open another terminal and go to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory using the API configuration required by the project.

Then start the development server:

```bash
npm run dev
```

The Vite development server will provide a local URL, normally similar to:

```text
http://localhost:5173
```

---

## 🗄️ Database

The project uses **MySQL** as its database.

Sequelize ORM is used by the backend to communicate with the database.

The main models include:

- User
- Salon
- Category
- SalonCategory
- Employee
- Service
- EmployeeService
- BusinessHour
- SalonImage
- Appointment
- Payment
- Review
- Notification

Before running the backend, make sure MySQL is running and the database configuration in the backend `.env` file is correct.

---

## 📚 Comprehensive Documentation Suite

The project includes an enterprise-grade documentation suite located in the [`documentation/`](file:///c:/Users/hp/Desktop/salon-platform/documentation/) directory:

| Document | Description |
| :--- | :--- |
| 🏛️ [**System Architecture & Specs**](file:///c:/Users/hp/Desktop/salon-platform/documentation/SYSTEM_ARCHITECTURE_AND_SPECS.md) | High-level system architecture, Mermaid diagrams, multi-service slot engine, and security specs. |
| 📡 [**REST API Reference**](file:///c:/Users/hp/Desktop/salon-platform/documentation/API_DOCUMENTATION.md) | Full API specification with request/response schemas, query parameters, and status codes. |
| 🗄️ [**Database Architecture & ERD**](file:///c:/Users/hp/Desktop/salon-platform/documentation/DATABASE_SCHEMA.md) | Relational ERD diagram, table schemas, data dictionary, and foreign key cascades. |
| 📸 [**Visual User Manual & Screen Layouts**](file:///c:/Users/hp/Desktop/salon-platform/documentation/VISUAL_USER_GUIDE_AND_SCREENSHOTS.md) | Step-by-step UI walkthroughs, wireframe layouts, and role workflows (Customer, Owner, Employee, Admin). |
| 🚀 [**Deployment & Configuration Guide**](file:///c:/Users/hp/Desktop/salon-platform/documentation/DEPLOYMENT_AND_SETUP_GUIDE.md) | Environment setup, MySQL setup, Chapa payment gateway, Telegram Bot, Google OAuth, and Nginx/PM2 guide. |
| 📋 [**Project Requirements Specification**](file:///c:/Users/hp/Desktop/salon-platform/documentation/project-requirement.md) | Detailed functional & non-functional project scope. |

---

## 🚀 Future Improvements

Possible future improvements include:

- Advanced salon search and filtering
- GPS-based salon recommendations
- More advanced analytics
- Real-time notifications
- Additional payment providers
- Improved appointment scheduling
- Enhanced customer reviews and ratings
- Mobile application support
- Production deployment

---

## 👩‍💻 Project Status

**Status:** Active Development

The platform is currently being developed and improved with additional features, UI enhancements, and system improvements.

---

## 📄 License

This project is currently intended for educational and development purposes.
