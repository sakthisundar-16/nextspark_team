# EXTERNIQ — External Events, Achievements & Impact Intelligence Platform

> **Capture. Verify. Certify. Measure.**  
> *External Engagement Intelligence for Educational Institutions*

---

## 🏛️ Executive Summary

**EXTERNIQ** replaces disconnected spreadsheets, emails, and manual paperwork with a centralized, verified digital repository for student and faculty external achievements (hackathons, conferences, workshops, paper presentations, and competitions).

Every external activity completes the complete institutional chain:
$$\text{Participation} \longrightarrow \text{Evidence} \longrightarrow \text{AI Extraction} \longrightarrow \text{Verification} \longrightarrow \text{E-Certificate} \longrightarrow \text{QR Verification} \longrightarrow \text{Impact Center}$$

---

## 🌟 Key Highlights & Differentiators

1. **AI Certificate Intelligence**:
   - Automated parsing of participant names, events, issuing organizers, and achievements with percentage confidence indicators.
   - Built-in duplicate detection checking identical titles, organizers, and dates to prevent fraudulent double-claims.
   - Graceful offline heuristic fallback so demos run smoothly even when API keys are absent.

2. **Faculty Verification Workspace**:
   - Dedicated review portal comparing student-declared data vs. AI-extracted evidence side-by-side.
   - One-click workflow: *Verify & Issue Certificate*, *Request Correction*, or *Reject* with permanent audit remarks.

3. **Tamper-Proof E-Certificate Studio**:
   - Instant cryptographic credential issuance using institutional identifiers (e.g., `EXN-2026-CSE-000184`).
   - Dynamic 2D QR Code generation linking to public verification endpoints.
   - High-resolution print-ready certificate renderer with institutional seals and verification watermarks.

4. **Public Verification Portal (No Login Required)**:
   - Direct verification interface (`/verify/:certificateId`) for employers, universities, and accreditation bodies (NAAC/NIRF).
   - Real-time validity checks (`VALID` vs. `REVOKED` vs. `NOT_FOUND`).

5. **Institutional Impact Center & Impact Copilot**:
   - Transparent **External Engagement Score** calculated from verification ratios, competition levels, and achievement quality.
   - 5-stage verification funnel and department comparison analytics.
   - **Impact Copilot**: Interactive natural-language assistant answering queries directly using real database aggregations.

6. **Live External Impact Feed**:
   - Real-time institutional ticker broadcasting verified student achievements across departments.

7. **Report Center**:
   - Automated export of NAAC / NIRF compliance dossiers in formatted CSV / Excel and printable PDF formats.

---

## 👥 Role-Based Demo Accounts

Switch roles instantly from the sidebar menu:

| Role | Account Email | Password | Designation |
| :--- | :--- | :--- | :--- |
| **Student** | `student@externiq.edu` | `externiq123` | Sakthi Sundar (CSE, Year 3) |
| **Verifier** | `verifier@externiq.edu` | `externiq123` | Prof. Anitha Selvam (Verification Officer) |
| **HOD** | `hod.cse@externiq.edu` | `externiq123` | Dr. S. R. Shankaran (Professor & Head, CSE) |
| **Admin** | `admin@externiq.edu` | `externiq123` | Dr. K. R. Ramanathan (Dean of Academic Affairs) |

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Recharts, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript (`tsx`).
- **Database**: SQLite with `better-sqlite3` (WAL mode enabled, foreign keys enforced).
- **Security & Tokens**: JWT authentication, bcrypt password hashing, audit logs table.
- **AI Engine**: Google GenAI SDK (`@google/genai`) with deterministic fallback heuristics.
- **QR Codes**: Server & client-side high-error-correction QR generator (`qrcode`).

---

## 🚀 Running the Project Locally

### 1. Backend Server
```bash
# In project root
npx tsx server/index.ts
```
The server will start on `http://localhost:5000` and seed the SQLite database with 13 users, 7 major external events, verified participations, and certificates.

### 2. Frontend Client
```bash
# In client/ folder
cd client
npm run dev
# OR for production preview:
npm run build
npm run preview
```
Visit `http://localhost:5173` in your browser.

---

## 🧭 Step-by-Step Judge Demonstration Flow (3–5 Minutes)

1. **Open Landing Page**: Navigate to `http://localhost:5173` to explore the value proposition and before/after comparison.
2. **Public QR Verification**: Click *"Verify a Certificate"* to view certificate `EXN-2026-CSE-000184` (Smart India Hackathon Winner credential).
3. **Student Submission**: Sign in as `student@externiq.edu`, click *"+ Add Activity"*, upload a certificate, and review the AI confidence scores and duplicate checks.
4. **Faculty Review**: Switch role to `Verifier`, open the **Verification Workspace**, select a pending submission, inspect side-by-side details, and click *"Verify & Issue Certificate"*.
5. **E-Certificate Studio**: Switch to **E-Certificates** to inspect the live printable credential with institutional seal and QR code.
6. **Impact Center & Copilot**: Open **Impact Center**, inspect the 89/100 Engagement Score, and ask Copilot *"Which department has the highest hackathon participation?"* to see live database responses.
7. **Report Export**: Open **Report Center** and click *"Export Formatted CSV"* to download institutional audit records.