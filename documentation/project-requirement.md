# Salon Platform — Project Requirements

## 1. Project Overview

The Salon Platform is a full-stack web application designed to help customers discover beauty salons, view available services and employees, and book appointments online.

The platform provides separate functionality for customers, salon owners, employees, and platform administrators. It manages salon information, services, employees, appointments, payments, reviews, and notifications through a centralized system.

The system consists of a React-based frontend and a Node.js/Express backend connected to a MySQL database using Sequelize ORM.

---

## 2. Project Objectives

The main objectives of the Salon Platform are to:

- Provide customers with an easy way to discover salons and available services.
- Allow customers to book appointments online.
- Allow customers to select multiple services during a booking.
- Provide employees with access to their assigned appointments.
- Allow salon owners to manage their salon, employees, services, business hours, and bookings.
- Provide administrators with tools to manage salons, categories, users, and system information.
- Support online payment management.
- Provide notifications for important booking and payment activities.
- Provide dashboards for different user roles.
- Provide a centralized and organized salon management system.

---

## 3. User Roles

The system supports four main user roles:

### 3.1 Customer

Customers can:

- Register and log in.
- Browse available salons.
- Search for salons.
- View salon details.
- View salon services.
- View available employees.
- Select one or multiple services.
- Select an employee when applicable.
- View available appointment time slots.
- Book appointments.
- View appointment history.
- Cancel appointments when permitted.
- Make payments.
- View payment information.
- Receive notifications.
- Manage their profile.
- Change their password.
- Reset a forgotten password.

### 3.2 Salon Owner

Salon owners can:

- Log in to the platform.
- View and update salon information.
- Upload and manage salon images.
- Manage salon business hours.
- Add employees.
- Update employee information.
- Remove employees.
- Upload employee profile photos.
- Add services.
- Update services.
- Remove services.
- View salon bookings.
- Manage booking status.
- View customers.
- View transactions.
- View revenue information.
- View payment-related information.
- Receive notifications.
- Manage their profile.

### 3.3 Employee

Employees can:

- Log in to the platform.
- View their assigned bookings.
- View booking details.
- Accept assigned bookings.
- Reject bookings when appropriate.
- Complete bookings.
- Manage their employee profile.
- Update profile information.
- Change their password.
- Receive booking-related notifications.

### 3.4 Platform Administrator

Administrators can:

- Log in to the administration dashboard.
- Manage salon registrations.
- Approve salons.
- Suspend salons when necessary.
- Manage service categories.
- View bookings.
- View system reports.
- Manage administrator profile information.
- Change administrator password.
- Receive system notifications.

---

# 4. Functional Requirements

## 4.1 Authentication

The system shall provide secure authentication for users.

The authentication system includes:

- User registration.
- User login.
- JWT-based authentication.
- Role-based access control.
- Protected routes.
- Password hashing.
- Password change functionality.
- Forgot-password functionality.
- Password reset using a temporary verification code.

---

## 4.2 User Registration

Customers shall be able to create an account by providing the required registration information.

The system shall validate registration information before creating the account.

---

## 4.3 User Login

Registered users shall be able to log in using their credentials.

After successful authentication, users shall be directed to the appropriate dashboard based on their role.

---

# 5. Salon Management

Salon owners shall be able to manage their salon information.

Salon information includes:

- Salon name.
- Description.
- Contact information.
- Location information.
- Salon logo.
- Gallery images.
- Business hours.
- Categories.
- Services.
- Employees.

Administrators shall be able to manage salon registration and approval status.

---

# 6. Service Management

Salon owners shall be able to manage the services offered by their salon.

Service management includes:

- Creating services.
- Updating services.
- Removing services.
- Setting service prices.
- Setting service duration.
- Associating services with employees.

Customers shall be able to view the available services before creating an appointment.

---

# 7. Employee Management

Salon owners shall be able to manage employees associated with their salon.

Employee management includes:

- Adding employees.
- Updating employee information.
- Removing employees.
- Uploading employee profile photos.
- Assigning services to employees.
- Viewing employee information.

Employees shall have their own accounts and access to employee-specific functionality.

---

# 8. Appointment and Booking System

The platform shall provide an online appointment booking system.

Customers shall be able to:

- Select a salon.
- Select one or multiple services.
- Select an available employee when applicable.
- View available appointment time slots.
- Create an appointment.
- View appointment information.
- View booking history.
- Cancel eligible appointments.

The booking system considers the duration of the selected service when determining available time slots.

Multiple services can be selected as part of a booking.

Appointments are associated with the relevant salon, customer, employee, and service information.

---

# 9. Booking Status Management

The system shall support different appointment states.

Booking-related actions include:

- Creating a booking.
- Accepting a booking.
- Rejecting a booking.
- Cancelling a booking.
- Completing a booking.

Salon owners and employees receive access to booking actions according to their roles.

---

# 10. Payment System

The platform includes payment management for appointments.

Payment functionality includes:

- Recording payment information.
- Tracking payment status.
- Associating payments with appointments.
- Displaying payment information to authorized users.
- Updating payment status after successful payment.
- Providing transaction information to salon owners.
- Providing revenue-related information through the owner dashboard.

The system supports payment statuses such as pending and paid.

---

# 11. Transaction and Revenue Management

Salon owners shall be able to view transaction information.

The transaction dashboard provides information such as:

- Total revenue.
- Today's revenue.
- Monthly revenue.
- Pending payments.
- Paid transaction count.
- Transaction history.

This allows salon owners to monitor their salon's financial activity.

---

# 12. Notification System

The platform provides notifications for important system events.

Notifications can be generated for events such as:

- New booking creation.
- Booking assignment.
- Successful payment.
- Payment received.
- Employee booking acceptance.
- Employee booking rejection.
- Booking completion.

Users can access notifications through their respective dashboards.

The notification system also provides unread notification information.

---

# 13. Password Recovery

The system provides a password recovery mechanism.

The process includes:

1. User requests a password reset.
2. The system generates a temporary verification code.
3. The code is sent to the registered user through the configured communication service.
4. The verification code has a limited validity period.
5. The user provides a new password.
6. The system updates the user's password securely.

Password reset information is stored using temporary reset-token and expiration fields.

---

# 14. Profile Management

Different user roles can manage their profile information.

Profile management includes:

- Viewing profile information.
- Updating profile information.
- Changing passwords.
- Uploading profile images where applicable.

Salon owners and employees also have role-specific profile information.

---

# 15. Dashboard System

The application provides role-specific dashboards.

### Customer Dashboard

Provides access to:

- Customer information.
- Appointments.
- Payments.
- Notifications.
- Salon discovery and booking functionality.

### Owner Dashboard

Provides access to:

- Salon information.
- Employees.
- Services.
- Bookings.
- Customers.
- Transactions.
- Revenue information.
- Notifications.

### Employee Dashboard

Provides access to:

- Assigned bookings.
- Booking management.
- Employee profile.
- Notifications.

### Admin Dashboard

Provides access to:

- Salon management.
- Category management.
- Booking management.
- System reports.
- Administrator profile.

---

# 16. Database Requirements

The application uses a MySQL relational database.

The database is managed through Sequelize ORM.

The main database models include:

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

Relationships between these models are used to manage users, salons, services, employees, appointments, payments, and notifications.

---

# 17. Technology Stack

## Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- Axios
- React Router

## Backend

- Node.js
- Express.js
- JavaScript
- Sequelize ORM
- JWT authentication
- bcrypt

## Database

- MySQL

## Development Tools

- Visual Studio Code
- Git
- GitHub
- npm

---

# 18. Frontend Requirements

The frontend shall:

- Provide a responsive user interface.
- Provide role-specific dashboards.
- Provide protected routes.
- Communicate with the backend through REST APIs.
- Display loading states.
- Display validation and error messages.
- Provide forms for user interaction.
- Provide booking and payment interfaces.
- Provide notification interfaces.

The frontend is organized into reusable components, pages, layouts, contexts, services, routes, utilities, and styles.

---

# 19. Backend Requirements

The backend shall:

- Provide REST API endpoints.
- Authenticate users.
- Authorize users based on roles.
- Validate incoming data.
- Manage database operations.
- Manage appointments.
- Manage services and employees.
- Manage payments.
- Manage notifications.
- Handle image uploads.
- Provide appropriate error responses.

The backend follows a controller, service, model, route, middleware, and validation structure.

---

# 20. API Structure

The backend API is organized by functionality.

Main API areas include:

- Authentication
- Customer
- Owner
- Employee
- Admin
- Booking
- Payment
- Notification
- Service
- Image management

The API uses JSON for request and response data.

---

# 21. Security Requirements

The system shall protect user and application data.

Security mechanisms include:

- JWT authentication.
- Password hashing.
- Role-based authorization.
- Protected API routes.
- Protected frontend routes.
- Environment variables for sensitive configuration.
- Temporary password-reset credentials.
- Input validation.

Sensitive configuration values such as database credentials, API keys, and authentication secrets shall not be committed to the Git repository.

---

# 22. File Upload Requirements

The platform supports image uploads for applicable entities.

Uploaded images may include:

- Salon logos.
- Salon gallery images.
- Employee profile images.

The backend uses upload middleware to process uploaded files.

---

# 23. Project Structure

The project is divided into three main areas:

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
└── .gitignore
```

---

# 24. Non-Functional Requirements

## Performance

The system should provide reasonable response times for common operations such as:

- Login.
- Salon search.
- Service retrieval.
- Appointment creation.
- Dashboard loading.

## Usability

The user interface should be simple and easy to understand for each user role.

## Reliability

The system should validate requests and handle errors without crashing the application.

## Maintainability

The application should use a structured architecture that allows individual features to be updated without unnecessarily affecting other parts of the system.

## Scalability

The application structure should allow additional salons, employees, services, customers, and appointments to be added as the platform grows.

---

# 25. Future Improvements

Possible future improvements include:

- Advanced salon search and filtering.
- GPS-based salon recommendations.
- More advanced reporting and analytics.
- Real-time notifications.
- Additional payment providers.
- Improved appointment scheduling.
- Customer reviews and ratings enhancements.
- Mobile application support.
- Deployment to a production environment.

---

# 26. Conclusion

The Salon Platform provides a centralized system for connecting customers with beauty salons and managing salon operations.

The system combines salon discovery, service management, employee management, appointment booking, payment tracking, notifications, and role-based dashboards into one full-stack web application.

The project is built using React and Vite on the frontend, Node.js and Express on the backend, and MySQL with Sequelize for data management.
