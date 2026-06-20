# 🍔 QuickByte - Food Delivery Platform

QuickByte is a full-stack food delivery platform that enables customers to browse restaurants, order food, restaurant owners to manage menus and orders, and delivery partners to complete deliveries. The application is built using Spring Boot, React, PostgreSQL, and JWT Authentication following modern full-stack development practices.

---

## 🚀 Features

### 👤 Authentication & Authorization
- User Registration & Login
- JWT-based Authentication
- BCrypt Password Encryption
- Role-Based Access Control
- Secure REST APIs

### 👥 Supported Roles

- Customer
- Restaurant Owner
- Delivery Partner
- Admin (Backend Ready)

---

## 🍽 Customer Features

- Browse Restaurants
- Search Restaurants
- View Restaurant Menu
- Add Items to Cart
- Remove Items from Cart
- View Cart Summary
- Place Orders
- View Order History
- Track Order Status

---

## 🏪 Restaurant Owner Features

- Create Restaurant
- Add Menu Items
- View Restaurant Orders
- Update Order Status

Supported Workflow:

```
PENDING
   ↓
ACCEPTED
   ↓
PREPARING
   ↓
READY_FOR_PICKUP
```

---

## 🚴 Delivery Partner Features

- View Assigned Orders
- Accept Delivery
- Mark Order as Delivered

Delivery Workflow

```
READY_FOR_PICKUP
        ↓
ASSIGNED
        ↓
DELIVERED
```

---

## 🔐 Security

- Spring Security
- JWT Authentication
- Role-Based Authorization
- Protected APIs
- Password Encryption using BCrypt
- Stateless Authentication

---

## ⚙ Backend Technologies

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- Maven
- Lombok
- JWT
- Swagger/OpenAPI

---

## 🎨 Frontend Technologies

- React
- Vite
- React Router
- Axios
- CSS3
- Responsive Design

---

## 🗄 Database

PostgreSQL

Major Tables

- Users
- Restaurants
- Menu Items
- Cart
- Cart Items
- Orders
- Order Items

---

## 📂 Project Structure

```
QuickByte
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── config
│   ├── security
│   └── exception
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   └── assets
│
└── README.md
```

---

## 📌 API Modules

### Authentication

- Register User
- Login User

### Restaurant

- Create Restaurant
- View Restaurants
- View Restaurant Menu

### Menu

- Add Menu Item

### Cart

- Add to Cart
- View Cart
- Remove from Cart

### Orders

- Place Order
- View Customer Orders
- View Restaurant Orders
- Assign Delivery Partner
- Update Order Status
- View Delivery Orders

---

## 📄 API Documentation

Swagger UI

```
http://localhost:8081/swagger-ui/index.html
```

---

## 🔄 Order Lifecycle

```
PENDING
   ↓
ACCEPTED
   ↓
PREPARING
   ↓
READY_FOR_PICKUP
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

---

## 🛠 Setup Instructions

### Backend

```bash
cd backend

mvn clean install

mvn spring-boot:run
```

Backend runs on

```
http://localhost:8081
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

## 🧪 Testing

Backend APIs can be tested using:

- Swagger UI
- Bruno
- Postman

---

## 📸 Screenshots

- Login Page
- Restaurant Listing
- Menu
- Cart
- Orders
- Delivery Dashboard

---

## 🔮 Future Improvements

- Online Payment Integration
- Restaurant Image Upload
- Food Image Upload
- Email Notifications
- Live Order Tracking
- Reviews & Ratings
- Wishlist
- Coupons & Offers
- Docker Deployment
- CI/CD Pipeline
- Microservices Architecture

---

## 👨‍💻 Author

**Shiva Kumar**

Java Backend Developer

GitHub:
https://github.com/Github3007

---

## ⭐ If you found this project useful, consider giving it a Star!
