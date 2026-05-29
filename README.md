# RetailOS AI — Neural Retail Intelligence Operating System

RetailOS AI is a high-performance, cinematic, and fully immersive **Retail Intelligence Ingestion & Demand Forecasting Platform**. Designed as a "living neural operating system," it combines a WebGL-powered 3D particle universe, real-time CSV datastream validation, temporal forecasting, and a terminal-style AI Command Drawer to deliver strategic retail insights.

The frontend is optimized for **60 FPS** rendering, utilizing Framer Motion for hardware-accelerated animations (restricting layouts to `transform` and `opacity` properties) alongside React Three Fiber (R3F) for WebGL rendering.

---

## 🌌 Tech Stack

### Frontend (Cinematic Interface)
- **Framework**: Next.js 14 (App Router, Client-Side Hydration)
- **Styling**: Vanilla CSS (Custom Glassmorphism tokens, HSL color palettes, scan-line overlays)
- **3D Graphics**: Three.js / React Three Fiber (R3F) & @react-three/drei
- **Motion & Interactions**: Framer Motion (GPU-accelerated layout-safe transitions)
- **Data Visualization**: Recharts (Interactive vector area charts)
- **Icons**: Lucide React
- **CSV Parsing**: PapaParse

### Backend (Analytical Core)
- **Framework**: FastAPI (Python 3.10+)
- **CSV Parsing & Normalization**: Native Python `csv` stream reader
- **Aggregations & Forecasting**: Statistical demand metrics and weighted historical trend forecasting
- **Server**: Uvicorn

---

## ⚡ Core Features & Capabilities

### 1. Ingestion Engine & Schema Guard
- **Size Limit Guard**: Checks dataset files prior to parsing, dropping payloads $>20\text{MB}$ with warnings to maintain system performance.
- **Header Parsing & Validation**: Reads headers using PapaParse and validates schema for critical retail metrics: `Date`, `Product_ID`, `Units_Sold`, and `Price`.
- **Friendly Mismatch Hints**: Displays detailed suggestions for correcting columns in the spreadsheet upon upload errors.

### 2. Interactive Temporal Forecast
- **Time Navigation Nodes**: Features a radial "Orbital Timeline" selector (7D, 14D, 30D cycles) that updates future demand models.
- **Interactive Recharts Area**: Enables users to click individual data points along the forecast line to dispatch deep-dive telemetry.
- **Kinetic Stat Increments**: Smoothly counts numeric metrics (Total Revenue, Peak Day Forecast, Margins) upon data ingestion.

### 3. AI Command drawer
- **Global Drawer Controller**: Consumes global context to trigger mode switches asynchronously.
- **Reactive Handshake**: Auto-opens the terminal drawer when a file is validated, injecting an automated system confirmation log with a UTC timestamp and a horizontal scale-expanding line.
- **Terminal Simulator**: Emulates a live CLI console with typewriter-effect answers to queries like `/metrics`, `/forecast`, `/insights`, or `/status`.

### 4. Telemetry Observability Panel
- **Health bar Strip**: Mounted directly below the navigation bar (`top: 64px`), polling the backend API `/health` endpoints to monitor network connectivity (`CORE ONLINE` / `OFFLINE`).
- **Telemetry Indicators**: Displays round-trip API latency (measured via `performance.now()`), Active Ingestion Mode, and live FPS tier metrics.
- **Console Event Streams**: Toggleable Terminal overlay displaying the last 5 system log events in real-time.

### 5. Accessibility & Session Persistence
- **Keyboard Shortcuts**:
  - `Ctrl + K` (or `Cmd + K` on Mac OS): Toggles the AI Command drawer.
  - `Escape`: Closes the Command drawer and Observability log viewer overlays.
- **Focus Rings**: Focus outline overrides that display a glowing cyan/violet ring during keyboard (`Tab`) navigation.
- **Session Memory**: Remembers whether the user had the drawer open or closed on their last session using `localStorage` persistence, alongside a client-side mock authentication token.

---

## 🏗️ Architecture & Data Flow

```
   [CSV Ingestion Core] ── Drag & Drop Validate
             │
             ▼ (uploadFile API Stream)
      [FastAPI Backend] ── Computes analytics, peaks, & 30-day forecast
             │
             ▼ (Response Payload + Latency)
   [retailContext Provider] ── Commit dataMode="live", trigger telemetry logs
     /            │           \
    ▼             ▼            ▼
[Health Bar]  [Forecast]   [AI Command Drawer]
 - Latency    - Render      - Auto-opens drawer
 - FPS tier     Chart       - Appends UTC activation line
 - Live Logs  - Click Pt    - Runs /metrics, /forecast
```

---

## 🛠️ How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/retailos-ai-platform.git
cd retailos-ai-platform
```

### 2. Spin up the Analytical Backend
The backend runs on Python. Create a virtual environment, install requirements, and run FastAPI:

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API Health Check endpoint: `http://127.0.0.1:8000/health`
- API documentation (Swagger): `http://127.0.0.1:8000/docs`

#### Environment Variables (Backend)
To customize CORS permissions, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Inside `.env`, define allowed origins:
```env
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Start the Next.js Frontend
Navigate to the frontend folder, install dependencies, and run the developer server:

```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
To test code optimizations, bundles, and compilation health:
```bash
npm run build
```

---

## 🎛️ Keyboard Shortcuts & Accessibility

| Shortcut | Description | Target |
|---|---|---|
| `Ctrl + K` / `Cmd + K` | Toggle Drawer console | Global |
| `Escape` | Close any active Drawer or Log panel | Global |
| `Tab` | Shift active focus | Interactive elements (Cyan outline) |
