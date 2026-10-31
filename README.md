# FraudWatch — Banking Transaction Fraud Detection System

A full-stack application for real-time monitoring and detection of fraudulent banking transactions.  
Built with **Spring Boot** (backend) and **React + TypeScript** (frontend).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [License](#license)

---

## Overview

FraudWatch is a banking transaction monitoring system that analyses transactions in real time, flags suspicious activity, and provides a rich dashboard for fraud analysts. It comes with a demo data generator that seeds the database on startup so you can explore the UI immediately.

---

## Tech Stack

### Backend
| Technology | Version |
|---|---|
| Java | 17 |
| Spring Boot | 3.2.5 |
| Spring Data MongoDB | — |
| Spring Security | — |
| Lombok | — |
| Maven | 3.x |

### Frontend
| Technology | Version |
|---|---|
| React | 19 |
| TypeScript | 6 |
| Vite | 8 |
| Material UI (MUI) | 9 |
| Recharts | 3 |
| React Router | 7 |
| Axios | 1 |
| React Hook Form + Zod | — |

### Database
- **MongoDB** (local or remote via URI)

---

## Project Structure

```
Fraud-Detection-Systeme/
├── backend/                         # Spring Boot application
│   ├── src/main/java/com/fraudwatch/backend/
│   │   ├── config/                  # CORS, Security, MongoDB, Demo data
│   │   ├── controller/              # REST controllers
│   │   ├── document/                # MongoDB documents
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── exception/               # Global exception handling
│   │   ├── mapper/                  # DTO ↔ Document mappers
│   │   ├── repository/              # MongoDB repositories
│   │   └── service/                 # Business logic
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/                        # React + TypeScript application
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── ...
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+** and **npm**
- **MongoDB** running locally on port `27017`, or a remote MongoDB URI

---

### Backend Setup

```bash
cd backend

# (Optional) set environment variables
$env:SPRING_DATA_MONGODB_URI = "mongodb://localhost:27017/fraudwatch"
$env:SECURITY_PASSWORD = "yourpassword"

# Build and run
mvn spring-boot:run
```

The API will be available at **http://localhost:8081**.

On first startup, the demo data generator automatically seeds the `fraudwatch` database with sample transactions.

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy the example env file and adjust if needed
cp .env.example .env

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## Configuration

### Backend — `application.properties`

| Property | Default | Description |
|---|---|---|
| `server.port` | `8081` | HTTP port |
| `SPRING_DATA_MONGODB_URI` | `mongodb://localhost:27017/fraudwatch` | MongoDB connection URI |
| `SECURITY_PASSWORD` | `changeme` | Spring Security password for the `admin` user |
| `app.demo-mode.enabled` | `true` | Seed demo data on startup |
| `app.cors.allowed-origins` | `http://localhost:3000,http://localhost:5173` | Allowed CORS origins |

### Frontend — `.env`

```env
VITE_API_BASE_URL=http://localhost:8081
```

---

## Features

- 📊 **Dashboard** — KPI summary cards (total transactions, fraud rate, flagged amounts)
- 🔍 **Transaction explorer** — paginated, filterable, sortable transaction list
- 🚨 **Fraud detection** — real-time flagging with risk scoring
- 📈 **Trend charts** — time-series fraud trend visualization (Recharts)
- 🥧 **Distribution charts** — fraud type breakdown
- 🖥️ **Monitoring** — system health and processing status
- 🔐 **Security** — Spring Security with configurable credentials
- 🌱 **Demo mode** — automatic seed data on first run

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Global KPI summary |
| `GET` | `/api/dashboard/trends` | Fraud trend over time |
| `GET` | `/api/dashboard/fraud-distribution` | Fraud type distribution |
| `GET` | `/api/transactions` | Paginated transaction list (filterable) |
| `GET` | `/api/transactions/{id}` | Transaction detail |
| `GET` | `/api/monitoring/status` | System monitoring status |
| `GET` | `/actuator/health` | Health check |

---

## License

This project is for educational and demonstration purposes.
