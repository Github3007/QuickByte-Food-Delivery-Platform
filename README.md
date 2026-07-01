# 🍔 QuickByte – Full Stack Food Delivery Platform

QuickByte is a full-stack food delivery platform built using **Spring Boot**, **React**, and **PostgreSQL**. The platform enables customers to browse restaurants, place food orders, restaurant owners to manage menus and orders, and delivery partners to complete deliveries through a secure role-based system.

The application follows modern backend development practices including JWT authentication, RESTful APIs, DTO-based architecture, Docker support, cloud database integration, and production deployment.

---

# 🚀 Live Demo

### 🌐 Frontend
https://quick-byte-food-delivery-platform.vercel.app/

### 📖 Swagger API Documentation
https://quickbyte-food-delivery-platform.onrender.com/swagger-ui/index.html

---

# ✨ Features

## 🔐 Authentication & Authorization

- User Registration & Login
- JWT Authentication
- BCrypt Password Encryption
- Role-Based Authorization
- Stateless Authentication
- Secure REST APIs

---

## 👥 User Roles

- 👤 Customer
- 🏪 Restaurant Owner
- 🚴 Delivery Partner
- 👨‍💼 Admin (Backend Ready)

---

# 🍽 Customer Features

- Browse Restaurants
- Search Restaurants
- View Restaurant Menus
- Add Items to Cart
- Remove Items from Cart
- Update Cart Quantity
- Place Orders
- View Order History
- Track Order Status

---

# 🏪 Restaurant Owner Features

- Register Restaurant
- Add Menu Items
- Manage Restaurant Orders
- Update Order Status

### Restaurant Workflow

```text
PENDING
   ↓
ACCEPTED
   ↓
PREPARING
   ↓
READY_FOR_PICKUP
```

---

# 🚴 Delivery Partner Features

- View Available Orders
- Accept Delivery
- View Assigned Orders
- Update Delivery Status

### Delivery Workflow

```text
READY_FOR_PICKUP
        ↓
OUT_FOR_DELIVERY
        ↓
DELIVERED
```

---

# 🔒 Security

- Spring Security
- JWT Authentication
- BCrypt Password Encoding
- Role-Based Access Control
- Stateless Session Management
- Protected REST APIs

---

# 🛠 Backend Tech Stack

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- Maven
- Lombok
- JWT
- Swagger / OpenAPI
- Docker

---

# 🎨 Frontend Tech Stack

- React
- Vite
- React Router
- Axios
- CSS3
- Responsive UI

---

# ☁️ Cloud & Deployment

- Frontend deployed on **Vercel**
- Backend deployed on **Render**
- Database hosted on **Neon PostgreSQL**
- Environment Variables
- Dockerized Backend

---

# 🗄 Database

### Tables

- Users
- Restaurants
- Menu Items
- Cart
- Cart Items
- Orders
- Order Items

---

# 📂 Project Structure

```text
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
│   ├── exception
│   └── util
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   ├── assets
│   └── styles
│
└── README.md
```

---

# 📡 REST API Modules

### Authentication

- Register
- Login

### Restaurants

- Create Restaurant
- View Restaurants
- Restaurant Details

### Menu

- Add Menu Items
- View Menu

### Cart

- Add Item
- Remove Item
- View Cart

### Orders

- Place Order
- Customer Orders
- Restaurant Orders
- Available Deliveries
- Assign Delivery
- Update Order Status

---

# 🔄 Complete Order Lifecycle

```text
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

# 📖 API Documentation

After running the backend:

```
http://localhost:8081/swagger-ui/index.html
```

For deployed application:

```
https://quickbyte-food-delivery-platform.onrender.com/swagger-ui/index.html
```

---

# ⚙️ Local Setup

## Clone Repository

```bash
git clone https://github.com/Github3007/QuickByte.git
```

---

## Backend

```bash
cd backend

mvn clean install

mvn spring-boot:run
```

Runs at

```
http://localhost:8081
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs at

```
http://localhost:5173
```

---

# 🔑 Environment Variables

Backend requires:

```properties
SPRING_DATASOURCE_URL=

SPRING_DATASOURCE_USERNAME=

SPRING_DATASOURCE_PASSWORD=

JWT_SECRET=
```

---

# 🧪 API Testing

Supported Tools

- Swagger UI
- Bruno
- Postman

---

# 📸 Screenshots

- Login
  <img width="832" height="405" alt="image" src="https://github.com/user-attachments/assets/31997641-c680-4b8d-a1b1-578181130c8a" />

- Register
  <img width="674" height="358" alt="image" src="https://github.com/user-attachments/assets/3aff9865-ffb5-4613-b787-53fba6ddc8c5" />

- Restaurant Listing
  <img width="842" height="401" alt="image" src="https://github.com/user-attachments/assets/3d725527-426a-4700-a28c-9e7a610304ca" />

- Restaurant Menu
  <img width="779" height="401" alt="image" src="https://github.com/user-attachments/assets/28a2074a-b7c6-44fa-8731-28ce2efdf985" />

- Shopping Cart
  <img width="773" height="333" alt="image" src="https://github.com/user-attachments/assets/78af335a-3318-4647-b8a7-010b068bc90e" />

- Customer Orders
  <img width="745" height="400" alt="image" src="https://github.com/user-attachments/assets/bc3308a6-06bf-4e6b-afed-a20fa00787ae" />

- Restaurant Dashboard
  <img width="615" height="401" alt="image" src="https://github.com/user-attachments/assets/14f6a327-0c06-42ef-929f-6085aac71d0c" />

- Delivery Dashboard
  <img width="633" height="382" alt="image" src="https://github.com/user-attachments/assets/d47f8439-1a5b-4787-84a7-a64868541a2f" />

---

# 🚀 Future Enhancements

- Online Payments
- Cloudinary Image Upload
- Email Notifications
- Live Order Tracking
- Ratings & Reviews
- Wishlist
- Coupons & Discounts
- Redis Caching
- CI/CD Pipeline
- Microservices Architecture
- Kubernetes Deployment

---

# 👨‍💻 Author

**Shiva Kumar**

Java Backend Developer

GitHub

https://github.com/Github3007

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub.
