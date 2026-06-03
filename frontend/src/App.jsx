import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Download,
  Filter,
  Gauge,
  LogOut,
  PackageCheck,
  RefreshCw,
  Store,
  Upload,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inventorySeed, sampleOrders } from "./data/sampleRetailData";
import {
  buildDashboardModel,
  buildInventoryActions,
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  parseCsv,
} from "./lib/analytics";
import Login from "./components/Login.jsx";
import AIInsightsPanel from "./components/AIInsightsPanel.jsx";
import AITicker from "./components/AITicker.jsx";
import InvestorMode from "./components/InvestorMode.jsx";
import NeuralBackground from "./components/NeuralBackground.jsx";
import TrendRadar from "./components/TrendRadar.jsx";

const chartPalette = ["#22d3ee", "#34d399", "#f59e0b", "#e879f9", "#94a3b8"];
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// Auth Context
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("retailos_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("retailos_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("retailos_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#e2e8f0"
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function KpiCard({ icon: Icon, label, value, detail, tone = "green" }) {
  return (
    <section className={`kpi-card tone-${tone}`}>
      <div className="kpi-icon">
        <Icon size={18} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
    </section>
  );
}

function StatusPill({ online }) {
  return (
    <div className={`status-pill ${online ? "online" : "offline"}`}>
      {online ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      <span>{online ? "Backend online" : "Local analytics mode"}</span>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (userData) => {
    login(userData);
    navigate("/", { replace: true });
  };

  return <Login onLogin={handleLogin} />;
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState(sampleOrders);
  const [inventory] = useState(inventorySeed);
  const [range, setRange] = useState(14);
  const [region, setRegion] = useState("All regions");
  const [apiOnline, setApiOnline] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRun, setLastRun] = useState("Sample retail dataset");

  const model = useMemo(() => buildDashboardModel(orders, range, region), [orders, range, region]);
  const inventoryActions = useMemo(() => buildInventoryActions(inventory), [inventory]);
  const combinedTrend = useMemo(() => {
    // When range is 0, treat the view as empty until a dataset enables ranges
    if (range === 0) return [];

    const recent = model.dailySeries.slice(-range).map((item) => ({
      date: item.date.slice(5),
      revenue: item.revenue,
      forecast: null,
    }));
    const forecast = model.forecast.map((item) => ({
      date: item.date.slice(5),
      revenue: null,
      forecast: item.forecast,
      lower: item.lower,
      upper: item.upper,
    }));
    return [...recent, ...forecast];
  }, [model, range]);

  const forecastSummary = useMemo(() => {
    const total = model.forecast.reduce((sum, item) => sum + item.forecast, 0);
    const low = model.forecast.reduce((sum, item) => sum + item.lower, 0);
    const high = model.forecast.reduce((sum, item) => sum + item.upper, 0);
    return {
      total,
      low,
      high,
      preview: model.forecast.slice(0, 5),
    };
  }, [model.forecast]);

  // When range is 0 (no active dataset/range selected), display empty/zero KPIs
  const displayKpis =
    range === 0
      ? {
          currentRevenue: 0,
          revenueChange: 0,
          currentUnits: 0,
          marginRate: 0,
          projectedRevenue: 0,
          topCategory: "-",
        }
      : model.kpis;

  useEffect(() => {
    let isMounted = true;

    fetch(`${apiBase}/health`, { signal: AbortSignal.timeout(1400) })
      .then((response) => {
        if (isMounted) setApiOnline(response.ok);
      })
      .catch(() => {
        if (isMounted) setApiOnline(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const parsed = parseCsv(text);

      if (parsed.length > 0) {
        setOrders(parsed);
        setRegion("All regions");
        setLastRun(file.name);
        // Enable forecast ranges once a real dataset is uploaded
        setRange(14);
      }

      if (apiOnline) {
        const formData = new FormData();
        formData.append("file", file);
        fetch(`${apiBase}/api/v1/analytics/async-compute`, {
          method: "POST",
          body: formData,
        }).catch(() => setApiOnline(false));
      }
    } finally {
      setIsProcessing(false);
      event.target.value = "";
    }
  };

  const exportReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      source: lastRun,
      kpis: model.kpis,
      forecast: model.forecast,
      inventoryActions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "retailos-ai-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const rerunSample = () => {
    setOrders(sampleOrders);
    setRegion("All regions");
    setLastRun("Sample retail dataset");
    // When using the bundled sample, enable the default range
    setRange(14);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
    <NeuralBackground />
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <Store size={22} />
          </div>
          <div>
            <p>RetailOS AI</p>
            <h1>Forecast command center</h1>
          </div>
        </div>

        <div className="topbar-actions">
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingRight: "16px",
            borderRight: "1px solid #334155",
            fontSize: "0.9rem",
            color: "#cbd5e1"
          }}>
            <span>Welcome, {user?.name}</span>
          </div>
          <StatusPill online={apiOnline} />
          <InvestorMode />
          <button className="icon-button" title="Reload sample dataset" onClick={rerunSample}>
            <RefreshCw size={17} />
          </button>
          <button className="primary-button" onClick={exportReport}>
            <Download size={17} />
            Export
          </button>
          <button
            className="icon-button"
            title="Sign out"
            onClick={handleLogout}
            style={{ color: "#ef4444" }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <AITicker />

      <section className="control-row">
        <div className="dataset-card">
          <div>
            <p className="eyebrow">Active dataset</p>
            <strong>{lastRun}</strong>
            <span>{orders.length.toLocaleString()} transaction rows analyzed</span>
          </div>
          <label className={`upload-button ${isProcessing ? "loading" : ""}`}>
            <Upload size={17} />
            {isProcessing ? "Processing" : "Import CSV"}
            <input accept=".csv" type="file" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="filters-card">
          <div className="filter-label">
            <Filter size={16} />
            Forecast range
          </div>
          <div className="segmented-control">
            {[0, 7, 14, 30].map((days) => (
              <button
                className={range === days ? "active" : ""}
                key={days}
                onClick={() => setRange(days)}
                disabled={range === 0 && days !== 0}
                title={range === 0 && days !== 0 ? "Upload a dataset to enable ranges" : ""}
              >
                {days}d
              </button>
            ))}
          </div>
          {range === 0 && (
            <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 12 }}>
              Upload a CSV to enable forecast ranges
            </div>
          )}
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            {model.regions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="kpi-grid">
        <KpiCard
          icon={BarChart3}
          label="14-day revenue"
          value={formatCurrency(displayKpis.currentRevenue)}
          detail={`${formatPercent(displayKpis.revenueChange)} vs previous window`}
          tone="green"
        />
        <KpiCard
          icon={PackageCheck}
          label="Units sold"
          value={displayKpis.currentUnits.toLocaleString()}
          detail="Current operating window"
          tone="blue"
        />
        <KpiCard
          icon={Gauge}
          label="Gross margin"
          value={formatPercent(displayKpis.marginRate)}
          detail={`Leader: ${displayKpis.topCategory}`}
          tone="amber"
        />
        <KpiCard
          icon={Zap}
          label={`${range === 0 ? 0 : range}-day forecast`}
          value={formatCurrency(displayKpis.projectedRevenue)}
          detail="Projected demand revenue"
          tone="violet"
        />
      </section>

      <section className="ai-os-grid">
        <AIInsightsPanel />
        <TrendRadar />
      </section>

      <section className="dashboard-grid">
        <article className="panel panel-wide">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Demand intelligence</p>
              <h2>Revenue actuals and forecast</h2>
            </div>
            <Activity size={20} />
          </div>
          <div className="chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedTrend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#22314a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} dot={false} />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#22d3ee"
                  strokeDasharray="6 5"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Category mix</p>
              <h2>Revenue share</h2>
            </div>
          </div>
          <div className="chart-medium">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={model.categoryBreakdown}
                  dataKey="revenue"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {model.categoryBreakdown.map((entry, index) => (
                    <Cell fill={chartPalette[index % chartPalette.length]} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-list">
            {model.categoryBreakdown.slice(0, 4).map((item, index) => (
              <div key={item.name}>
                <span style={{ backgroundColor: chartPalette[index % chartPalette.length] }} />
                <p>{item.name}</p>
                <strong>{formatCurrency(item.revenue)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Channels</p>
              <h2>Store performance</h2>
            </div>
          </div>
          <div className="chart-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={model.regionBreakdown} margin={{ top: 10, right: 0, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#22314a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#22d3ee" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Forecast ranges</p>
              <h2>Demand confidence outlook</h2>
            </div>
          </div>
          <div className="forecast-range-section">
            <div className="forecast-summary">
              <span>Projected {range}-day demand</span>
              <strong>{formatCurrency(forecastSummary.total)}</strong>
              <span>
                Confidence range: {formatCurrency(forecastSummary.low)} – {formatCurrency(forecastSummary.high)}
              </span>
            </div>
            <div className="forecast-band-list">
              {forecastSummary.preview.map((item) => (
                <div className="forecast-band-item" key={item.date}>
                  <span>{item.date.slice(5)}</span>
                  <strong>{formatCurrency(item.forecast)}</strong>
                  <span>
                    {formatCurrency(item.lower)} – {formatCurrency(item.upper)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel panel-wide">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Inventory execution</p>
              <h2>Reorder action queue</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Cover</th>
                  <th>Suggested buy</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                {inventoryActions.map((item) => (
                  <tr key={item.sku}>
                    <td>{item.sku}</td>
                    <td>
                      <strong>{item.product}</strong>
                      <span>{item.category}</span>
                    </td>
                    <td>
                      <span className={`table-status ${item.priority === 1 ? "hot" : item.priority === 2 ? "warn" : "ok"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.coverDays.toFixed(1)} days</td>
                    <td>{item.targetUnits.toLocaleString()} units</td>
                    <td>{formatPercent(item.margin * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">AI brief</p>
              <h2>Recommended actions</h2>
            </div>
          </div>
          <div className="insight-list">
            {model.insights.map((insight) => (
              <div className={`insight tone-${insight.tone}`} key={insight.title}>
                <strong>{insight.title}</strong>
                <p>{insight.body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel panel-wide">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Forecast envelope</p>
              <h2>Demand confidence band</h2>
            </div>
          </div>
          <div className="chart-medium">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={model.forecast} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#22314a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => date.slice(5)}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#164e63" fillOpacity={0.28} />
                <Area type="monotone" dataKey="forecast" stroke="#22d3ee" fill="#06b6d4" fillOpacity={0.34} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#020617" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </main>
    </>
  );
}
