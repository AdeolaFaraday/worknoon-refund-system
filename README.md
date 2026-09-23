# Worknoon AI-Powered Customer Support Refund System

## 1. Project Overview
This project is a Full Stack solution for the WORKNOON Refund System. It features a Next.js frontend, a modular NestJS backend, and a PostgreSQL database managed via Prisma ORM. It leverages Google Gemini AI to provide intelligent decision support alongside a strict deterministic policy engine.

## 2. Quick Start: Run Everything with Docker

To make evaluating this project as easy as possible, the entire stack (Frontend, Backend, and PostgreSQL database) is containerized for development.

### Prerequisites
- Docker and Docker Compose
- Node.js (v22+) (Optional, if you wish to run outside Docker)

### Setup & Run
1. **Environment Variables**: Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` to the `.env` file. (Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)). If omitted, the app will gracefully fall back to deterministic policies without AI reasoning.

2. **Start the Stack**:
   Run the following command in the root directory:
   ```bash
   docker-compose up --build
   ```
   This single command will:
   - Start the PostgreSQL database (`worknoon_db`).
   - Install dependencies, apply Prisma migrations, and start the NestJS backend on `http://localhost:3001`.
   - Install dependencies and start the Next.js frontend on `http://localhost:3000`.

*Note: On first run, Docker will download Node and Postgres images and install npm packages. Subsequent starts will be much faster.*

---

## 3. Architecture

### Frontend Architecture (Next.js)
- **Framework**: Next.js App Router (React 18) using TypeScript and Tailwind CSS.
- **State & Data Fetching**: React Query (`@tanstack/react-query`) is used for robust, cached, and synchronized data fetching.
- **Component Design**: Highly modular UI components (`Select`, `Textarea`, `GlowButton`, `FormStep`). Form logic is decoupled using custom hooks (`useRefundForm`, `useRefundQueries`).
- **Routing**: Separated into `/customer` (public refund requests) and `/admin` (protected dashboard).
- **Authentication**: A client-side `AdminGuard` proxy component protects the dashboard, verifying an auth token in `localStorage`.

### Backend Architecture (NestJS)
Structured into highly cohesive, loosely coupled domains:
- **`PrismaModule`**: Global data access layer.
- **`CustomersModule` & `OrdersModule`**: Read-only endpoints providing searchable customer and order details to the frontend.
- **`RefundsModule`**: The core transactional boundary. It orchestrates policy evaluation, AI reasoning, database persistence, and audit logging.
- **`AiModule`**: Encapsulates the Google GenAI SDK. 

---

## 4. How AI Integration Works

The `POST /refunds` endpoint uses a multi-stage pipeline where AI acts as a smart advisor, but **never** bypasses strict business rules.

1. **Deterministic Policy Engine**: First, the backend evaluates hard business rules (e.g., Final sale items = instantly DENIED).
2. **Gemini AI Decision Support**: If the policy does not result in an outright denial or escalation, the request is passed to Gemini. 
   - **Prompt Engineering**: Gemini is instructed to analyze the customer's text (e.g., "The shirt was torn"). 
   - **Prompt Injection Protection**: Customer text is strictly isolated in the prompt structure and labeled as untrusted user data. The LLM is explicitly commanded to ignore any instructions within that data.
3. **Final Decision Logic**: The backend code holds ultimate authority.
   - If Policy = `DENIED`, Final = `DENIED` (AI is ignored).
   - If Policy = `APPROVED` but AI flags as suspicious (`ESCALATED`), Final = `ESCALATED` (conservative approach).
4. **Graceful Degradation**: If the Gemini API fails, times out, or the API key is missing, the system catches the error, logs a warning, and falls back entirely to the deterministic policy engine.

---

## 5. Assumptions and Trade-offs

- **Development Docker Setup**: The provided `docker-compose.yml` mounts the local directory and runs `npm run dev` rather than building optimized production images. *Trade-off*: This yields slightly slower startup and performance than a production multi-stage build, but it was explicitly chosen for this assessment so reviewers can easily tweak the code and instantly see live reloads without rebuilding images.
- **Authentication**: The admin dashboard is protected via a dummy login that drops a flag in `localStorage` (`AdminGuard`). *Trade-off*: In a production app, this would use HttpOnly secure cookies, JWTs, and Server-Side Middleware (like NextAuth.js or Supabase Auth). I opted for a lightweight client-side proxy to keep the assessment focused on the core refund/AI logic without the overhead of an auth provider.
- **Database Seeding**: Migrations and seeding are not fully automated inside the docker-compose command beyond `migrate deploy` to keep the startup script simple. The reviewer can manually run `npx prisma db seed` if they wish to populate edge-case test data.

---

## 6. Video Demo Walkthrough
*(Please refer to the submission email or attached video file for the demo walkthrough showing the local setup, customer flow, and admin dashboard.)*
