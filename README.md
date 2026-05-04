================================================================
        WMT_IT_KU_<YOUR_GROUP_NUMBER>
        Vehicle Rental & Sale System
        SE2020 - Web and Mobile Technologies
        Group Assignment Submission
================================================================


----------------------------------------------------------------
01. GITHUB REPOSITORY LINK
----------------------------------------------------------------

GitHub Repository : <YOUR_GITHUB_REPO_URL>

Repository Structure:
  /frontend   - React Native Mobile Application (Expo)
  /backend    - Node.js + Express.js REST API Server


----------------------------------------------------------------
02. TEAM DETAILS
----------------------------------------------------------------

Group Number : WMT_IT_KU_<YOUR_GROUP_NUMBER>
Project Name : Vehicle Rental & Sale System
Module       : SE2020 - Web and Mobile Technologies
Faculty      : Faculty of Computing
Year         : 2026


Members:
  Member 1 : IT24103159 - <NAME> - Payment System
  Member 2 : IT<NUMBER> - <NAME> - Vehicle Buying
  Member 3 : IT<NUMBER> - <NAME> - Vehicle Management
  Member 4 : IT<NUMBER> - <NAME> - User Management & Admin Dashboard
  Member 5 : IT<NUMBER> - <NAME> - Review, Feedback & Promotion Handling
  Member 6 : IT<NUMBER> - <NAME> - Vehicle Renting


----------------------------------------------------------------
03. PROJECT DESCRIPTION
----------------------------------------------------------------

The Vehicle Rental & Sale System is a comprehensive mobile application
built for "Samarasinghe Motors" that provides an integrated platform for
vehicle rental services and vehicle sales operations.

The system supports two primary user roles:
  - Customer : Can browse vehicles, make rental bookings, submit
                bank slip payments, negotiate vehicle purchases,
                receive promotional discounts, and leave reviews.
  - Admin    : Can manage the vehicle fleet (rent & sale), approve
                payments, handle sale inquiries, manage users,
                create promotions, and finalize vehicle sales.

Key Features:
  * JWT-based authentication with role-based access control
  * Vehicle rental booking with date availability checking
  * Bank slip payment upload and admin approval workflow
  * Vehicle sale inquiry system (Negotiate / Buy Now)
  * Admin sale finalization with automated rejection logic
  * Promo code system with automatic discount application
  * Customer review and rating system for rented vehicles
  * Real-time notification system for promotions and alerts
  * Admin dashboard with fleet and user management tools


----------------------------------------------------------------
04. DEPLOYMENT DETAILS
----------------------------------------------------------------

Backend URL  : <YOUR_RENDER_DEPLOYMENT_URL>

Database     : MongoDB Atlas (Cloud-hosted NoSQL Database)
Frontend     : React Native (Expo) - Mobile Application
API Base URL : <YOUR_RENDER_DEPLOYMENT_URL>/api


Available API Endpoints:
  /api/auth           - Authentication & User Registration
  /api/users          - User Profile & Admin User Management
  /api/vehicles       - Vehicle Management (Rent & Sale Fleet)
  /api/bookings       - Rental Booking Management
  /api/payments       - Bank Slip Payment Processing
  /api/promotions     - Promotional Discount Code Management
  /api/reviews        - Customer Reviews & Ratings
  /api/notifications  - Customer Notification System
  /api/inquiries      - Vehicle Sale Inquiries & Negotiation


----------------------------------------------------------------
05. TECHNOLOGY STACK
----------------------------------------------------------------

Frontend Technologies:
  Framework       : React Native 0.81.5
  Platform        : Expo SDK ~54.0.0
  Language        : JavaScript (JSX)
  Navigation      : React Navigation v6 (Stack Navigator)
  HTTP Client     : Axios 1.6.5
  State Mgmt      : React Context API (AuthContext)
  Storage         : AsyncStorage (Mobile) / localStorage (Web)

Backend Technologies:
  Runtime         : Node.js
  Framework       : Express.js v5.2.1
  Database        : MongoDB Atlas via Mongoose v9.6.1
  Authentication  : JSON Web Token (jsonwebtoken v9.0.3)
  Password Hash   : bcryptjs v3.0.3
  File Upload     : Multer v2.1.1 (Bank Slip Uploads)
  Environment     : dotenv v17.4.2
  CORS            : cors v2.8.6

Development Tools:
  Dev Server      : Nodemon v3.1.14
  Version Control : Git & GitHub
  Hosting         : Render.com (Backend API)


----------------------------------------------------------------
06. DATABASE SCHEMA (MongoDB Collections)
----------------------------------------------------------------

Collection: users
  Fields: fullName, email, phone, password, role, isBlocked

Collection: vehiclerents
  Fields: name, type, year, dailyRate, status, description,
          mileageLimit, extraMileageCharge, avgFuelEfficiency,
          gearType, seats, fuelType, images[]

Collection: vehiclesales
  Fields: name, brand, bodyType, yom, yearReg, price,
          transmission, conditionStatus, mileage, engineCap,
          color, edition, scanReportUrl, description, images[]

Collection: bookings
  Fields: customerId (ref: User), vehicleId (ref: VehicleRent),
          startDate, endDate, totalCost, pickupLocation, status,
          promoCode, discount

Collection: payments
  Fields: bookingId (ref: Booking), amount, bankSlipUrl,
          status, remarks

Collection: inquiries
  Fields: vehicleSaleId (ref: VehicleSale),
          customerId (ref: User), inquiryType, message,
          status, adminReply

Collection: promotions
  Fields: code, discountPercent, description, expiresAt, isActive

Collection: reviews
  Fields: vehicleId, bookingId, customerId (ref: User),
          stars, comment

Collection: notifications
  Fields: userId (ref: User), title, message, isRead


----------------------------------------------------------------
07. API ENDPOINTS SUMMARY (40 Total Endpoints)
----------------------------------------------------------------

Authentication (2 Endpoints):
  POST /api/auth/register         - Register new user account
  POST /api/auth/login            - Login and receive JWT token

User Management (7 Endpoints):
  GET  /api/users/profile         - Get logged-in user profile
  PUT  /api/users/profile         - Update own profile
  GET  /api/users/                - Get all users (Admin)
  GET  /api/users/:id             - Get user by ID (Admin)
  PUT  /api/users/:id             - Update user details (Admin)
  PUT  /api/users/:id/block       - Block/Unblock user (Admin)
  DEL  /api/users/:id             - Delete user account (Admin)

Vehicle Management (11 Endpoints):
  GET  /api/vehicles/trending     - Get trending vehicles
  GET  /api/vehicles/rent         - Get all rental vehicles
  GET  /api/vehicles/rent/:id     - Get rental vehicle by ID
  POST /api/vehicles/rent         - Add rental vehicle (Admin)
  PUT  /api/vehicles/rent/:id     - Update rental vehicle (Admin)
  DEL  /api/vehicles/rent/:id     - Delete rental vehicle (Admin)
  GET  /api/vehicles/sale         - Get all sale vehicles
  GET  /api/vehicles/sale/:id     - Get sale vehicle by ID
  POST /api/vehicles/sale         - Add sale vehicle (Admin)
  PUT  /api/vehicles/sale/:id     - Update sale vehicle (Admin)
  DEL  /api/vehicles/sale/:id     - Delete sale vehicle (Admin)

Booking System (4 Endpoints):
  GET  /api/bookings/check-availability - Check vehicle availability
  POST /api/bookings/create       - Create new rental booking
  GET  /api/bookings/my-bookings  - Get customer's bookings
  DEL  /api/bookings/:id          - Cancel a booking

Payment System (3 Endpoints):
  POST /api/payments/upload       - Upload bank slip payment
  GET  /api/payments/             - Get all payments (Admin)
  PUT  /api/payments/:id          - Update payment status (Admin)

Sale Inquiries (6 Endpoints):
  POST /api/inquiries/inquire     - Submit purchase inquiry
  GET  /api/inquiries/my-inquiries - Get customer's inquiries
  GET  /api/inquiries/admin/all   - Get all inquiries (Admin)
  PUT  /api/inquiries/admin/status/:id - Reply to inquiry (Admin)
  POST /api/inquiries/admin/finalize-sale - Finalize sale (Admin)
  GET  /api/inquiries/trending    - Trending vehicles analytics

Promotions (5 Endpoints):
  GET  /api/promotions/active     - Get active promotions
  POST /api/promotions/verify     - Verify & apply promo code
  POST /api/promotions/           - Create promotion (Admin)
  GET  /api/promotions/           - Get all promotions (Admin)
  DEL  /api/promotions/:id        - Delete promotion (Admin)

Reviews (2 Endpoints):
  POST /api/reviews/add           - Submit vehicle review
  GET  /api/reviews/vehicle/:id   - Get reviews for a vehicle

Notifications (2 Endpoints):
  GET  /api/notifications/        - Get customer notifications
  PUT  /api/notifications/:id/read - Mark notification as read


----------------------------------------------------------------
08. PROJECT STRUCTURE
----------------------------------------------------------------

Vehicle-Rental-Sale-System/
|
|-- backend/
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- userController.js
|   |   |-- vehicleController.js
|   |   |-- bookingController.js
|   |   |-- paymentController.js
|   |   |-- promotionController.js
|   |   |-- reviewController.js
|   |   |-- notificationController.js
|   |   |-- inquiryController.js
|   |
|   |-- models/
|   |   |-- User.js
|   |   |-- VehicleRent.js
|   |   |-- VehicleSale.js
|   |   |-- Booking.js
|   |   |-- Payment.js
|   |   |-- Promotion.js
|   |   |-- Review.js
|   |   |-- Notification.js
|   |   |-- Inquiry.js
|   |
|   |-- routes/
|   |   |-- authRoutes.js
|   |   |-- userRoutes.js
|   |   |-- vehicleRoutes.js
|   |   |-- bookingRoutes.js
|   |   |-- paymentRoutes.js
|   |   |-- promotionRoutes.js
|   |   |-- reviewRoutes.js
|   |   |-- notificationRoutes.js
|   |   |-- inquiryRoutes.js
|   |
|   |-- middleware/
|   |   |-- authMiddleware.js       (JWT verification & role check)
|   |   |-- uploadMiddleware.js     (Multer file upload config)
|   |
|   |-- uploads/                    (Bank slip file storage)
|   |-- server.js                   (Express app entry point)
|   |-- package.json
|   |-- .env                        (Environment variables)
|
|-- frontend/
|   |-- App.js                      (Root component & navigation)
|   |
|   |-- app/
|   |   |-- screens/
|   |   |   |-- HomeScreen.jsx
|   |   |   |-- LoginScreen.jsx
|   |   |   |-- RegisterScreen.jsx
|   |   |   |-- CustomerDashboard.jsx
|   |   |   |-- AdminDashboard.jsx
|   |   |   |-- UpdateProfileScreen.jsx
|   |   |   |-- UserManagementScreen.jsx
|   |   |   |-- RentGalleryScreen.jsx
|   |   |   |-- RentBookingScreen.jsx
|   |   |   |-- BuyGalleryScreen.jsx
|   |   |   |-- SaleVehicleDetailsScreen.jsx
|   |   |   |-- AddVehicleScreen.jsx
|   |   |   |-- AddSaleVehicleScreen.jsx
|   |   |   |-- FleetManagementScreen.jsx
|   |   |   |-- PaymentScreen.jsx
|   |   |   |-- PaymentHistoryScreen.jsx
|   |   |   |-- AdminPaymentsScreen.jsx
|   |   |   |-- AdminPromotionsScreen.jsx
|   |   |   |-- AdminInquiriesScreen.jsx
|   |   |   |-- CustomerNotificationsScreen.jsx
|   |   |   |-- RentalHistoryScreen.jsx
|   |   |
|   |   |-- components/
|   |       |-- CustomHeader.jsx    (Reusable navigation header)
|   |
|   |-- context/
|   |   |-- AuthContext.jsx         (Global auth state management)
|   |
|   |-- services/
|   |   |-- api.js                  (Axios HTTP client config)
|   |
|   |-- package.json


----------------------------------------------------------------
09. HOW TO RUN LOCALLY
----------------------------------------------------------------

Prerequisites:
  - Node.js (v18 or above)
  - npm (Node Package Manager)
  - Expo CLI (npx expo)
  - MongoDB Atlas account (or local MongoDB)

Step 1: Clone the Repository
  $ git clone <YOUR_GITHUB_REPO_URL>
  $ cd Vehicle-Rental-Sale-System

Step 2: Setup Backend
  $ cd backend
  $ npm install
  $ (Create .env file with MONGODB_URI and JWT_SECRET)
  $ npm run dev

Step 3: Setup Frontend
  $ cd frontend
  $ npm install
  $ npx expo start

Step 4: Access the Application
  - Press 'w' for web browser
  - Press 'a' for Android emulator
  - Scan QR code with Expo Go app for physical device


----------------------------------------------------------------
10. ENVIRONMENT VARIABLES (.env)
----------------------------------------------------------------

Required environment variables for backend:

  MONGODB_URI = <Your MongoDB Atlas Connection String>
  JWT_SECRET  = <Your JWT Secret Key>
  PORT        = 5000


----------------------------------------------------------------
11. MIDDLEWARE & SECURITY
----------------------------------------------------------------

Authentication Middleware (authMiddleware.js):
  - protect   : Verifies JWT token from Authorization header.
                 Attaches decoded user object to req.user.
                 Returns 401 Unauthorized if token is invalid.
  - adminOnly : Checks if req.user.role === 'Admin'.
                 Returns 403 Forbidden for non-admin users.

Upload Middleware (uploadMiddleware.js):
  - Uses Multer for multipart/form-data file handling.
  - Accepts PDF, JPEG, and PNG file formats.
  - Stores uploaded bank slips in /backend/uploads/.

Security Measures:
  - Password hashing with bcryptjs (salt rounds: 10)
  - JWT token expiration (24 hours)
  - Role-based access control (RBAC)
  - Input validation on all API endpoints
  - CORS enabled for cross-origin requests
  - Parameterized MongoDB queries (injection prevention)


----------------------------------------------------------------
12. GROUP MEMBER RESPONSIBILITIES
----------------------------------------------------------------

Member 1 (IT24103159) - Payment System:
  - Bank slip upload with file type validation (PDF/JPEG/PNG)
  - Admin payment approval and rejection workflow
  - Payment history tracking for customers
  - Files: paymentController.js, paymentRoutes.js, Payment.js,
           PaymentScreen.jsx, AdminPaymentsScreen.jsx,
           PaymentHistoryScreen.jsx

Member 2 (IT<NUMBER>) - Vehicle Buying:
  - Sale vehicle detail view with image gallery
  - Negotiate Price and Buy Now inquiry submission
  - Admin inquiry management and reply system
  - Finalize Sale logic (mark sold, reject others)
  - Files: inquiryController.js, inquiryRoutes.js, Inquiry.js,
           SaleVehicleDetailsScreen.jsx, AdminInquiriesScreen.jsx,
           BuyGalleryScreen.jsx

Member 3 (IT<NUMBER>) - Vehicle Management:
  - Add, edit, and delete rental vehicles
  - Add, edit, and delete sale vehicles
  - Fleet management dashboard
  - Vehicle image handling with URL storage
  - Files: vehicleController.js, vehicleRoutes.js,
           VehicleRent.js, VehicleSale.js,
           AddVehicleScreen.jsx, AddSaleVehicleScreen.jsx,
           FleetManagementScreen.jsx

Member 4 (IT<NUMBER>) - User Management & Admin Dashboard:
  - User registration and login with JWT authentication
  - Admin user directory with block/unblock functionality
  - Profile update functionality
  - Admin dashboard with metrics overview
  - Files: authController.js, userController.js, authRoutes.js,
           userRoutes.js, User.js, authMiddleware.js,
           AdminDashboard.jsx, UserManagementScreen.jsx,
           UpdateProfileScreen.jsx, LoginScreen.jsx,
           RegisterScreen.jsx

Member 5 (IT<NUMBER>) - Review, Feedback & Promotion:
  - Customer review submission (stars & comments)
  - Vehicle review display on booking page
  - Promo code creation and management (Admin)
  - Promo code verification and discount application
  - Notification system for promotional alerts
  - Files: reviewController.js, promotionController.js,
           notificationController.js, reviewRoutes.js,
           promotionRoutes.js, notificationRoutes.js,
           Review.js, Promotion.js, Notification.js,
           RentalHistoryScreen.jsx, AdminPromotionsScreen.jsx,
           CustomerNotificationsScreen.jsx

Member 6 (IT<NUMBER>) - Vehicle Renting:
  - Vehicle rental gallery with search and filter
  - Date-based availability checking
  - Rental booking form with cost calculation
  - Booking history and cancellation
  - Files: bookingController.js, bookingRoutes.js, Booking.js,
           RentGalleryScreen.jsx, RentBookingScreen.jsx,
           HomeScreen.jsx


================================================================
  SE2020 | Faculty of Computing | 2026
================================================================
