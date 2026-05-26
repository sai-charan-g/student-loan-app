"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminStats, getApplications, getApplicationScore } from "@/lib/api";
import styles from "./admin.module.css";

interface DashboardStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  deadLeads: number;
  avgScore: number;
  recentApplications: Array<Record<string, unknown>>;
}

interface Application {
  id: string;
  applicationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  targetCourse: string;
  targetUniversity: string;
  admissionStatus: string;
  loanAmountRequired: number;
  leadScore: number;
  leadCategory: string;
  isDeadLead: boolean;
  status: string;
  createdAt: string;
}

interface ScoreDetail {
  leadScore: number;
  leadCategory: string;
  scoreBreakdown: {
    breakdown: Array<{ factor: string; score: number; maxScore: number; explanation: string; status: string }>;
    recommendation: string;
  };
  isDeadLead: boolean;
  deadLeadReasons: string[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<ScoreDetail | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        getAdminStats(),
        getApplications({
          ...(filter !== "all" && filter !== "dead" ? { leadCategory: filter } : {}),
          ...(filter === "dead" ? { isDeadLead: "true" } : {}),
          ...(search ? { search } : {}),
        }),
      ]);
      setStats(statsRes.data);
      setApps(appsRes.data);
      setTotal(appsRes.total);
    } catch {
      console.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { loadData(); }, [loadData]);

  const viewScore = async (app: Application) => {
    try {
      const res = await getApplicationScore(app.id);
      setSelectedApp(res.data);
      setSelectedName(app.fullName);
    } catch {
      alert("Failed to load score details");
    }
  };

  const getCategoryBadge = (cat: string) => {
    const map: Record<string, string> = { HIGH: "badge--high", MEDIUM: "badge--medium", LOW: "badge--low", DEAD: "badge--dead" };
    return `badge ${map[cat] || "badge--dead"}`;
  };

  if (loading) return <div className={styles.loadingWrap}><div className="spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div>
            <h1 className={styles.navTitle}>Admin Dashboard</h1>
            <p className={styles.navSubtitle}>Education Loan Lead Management</p>
          </div>
          <a href="/" className="btn btn--secondary">← Back to Site</a>
        </div>
      </nav>

      <main className={`container ${styles.main}`}>
        {/* Stats Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Applications</span>
              <strong className={styles.statValue}>{stats.total}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Avg. Lead Score</span>
              <strong className={styles.statValue}>{stats.avgScore}<span className={styles.statUnit}>/100</span></strong>
            </div>
            <div className={`${styles.statCard} ${styles.statCardHigh}`}>
              <span className={styles.statLabel}>High Quality</span>
              <strong className={styles.statValue}>{stats.byCategory?.HIGH || 0}</strong>
            </div>
            <div className={`${styles.statCard} ${styles.statCardDead}`}>
              <span className={styles.statLabel}>Dead Leads</span>
              <strong className={styles.statValue}>{stats.deadLeads}</strong>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={styles.toolbar}>
          <div className={styles.filterTabs}>
            {["all", "HIGH", "MEDIUM", "LOW", "dead"].map((f) => (
              <button key={f} className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "dead" ? "🚩 Dead Leads" : f}
              </button>
            ))}
          </div>
          <input className="form-input" style={{ maxWidth: 260 }} placeholder="Search by name, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Applications Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>App #</th><th>Applicant</th><th>Course</th><th>University</th>
                <th>Loan Amount</th><th>Score</th><th>Category</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} className={app.isDeadLead ? styles.deadRow : ""}>
                  <td className={styles.appNo}>{app.applicationNumber}</td>
                  <td><strong>{app.fullName}</strong><br /><span className="text-xs" style={{ color: "var(--gray-400)" }}>{app.email}</span></td>
                  <td>{app.targetCourse}</td>
                  <td>{app.targetUniversity}</td>
                  <td>₹{Number(app.loanAmountRequired).toLocaleString("en-IN")}</td>
                  <td><strong>{app.leadScore}</strong></td>
                  <td><span className={getCategoryBadge(app.leadCategory)}>{app.leadCategory}</span></td>
                  <td><span className={`badge badge--${app.status.toLowerCase().replace(/_/g, "-")}`}>{app.status}</span></td>
                  <td><button className="btn btn--secondary btn--icon" onClick={() => viewScore(app)} title="View Score">🔍</button></td>
                </tr>
              ))}
              {apps.length === 0 && <tr><td colSpan={9} className={styles.emptyState}>No applications found</td></tr>}
            </tbody>
          </table>
          <p className={styles.totalCount}>Showing {apps.length} of {total} applications</p>
        </div>

        {/* Score Detail Modal */}
        {selectedApp && (
          <div className={styles.modalOverlay} onClick={() => setSelectedApp(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Score Breakdown — {selectedName}</h2>
                <button className="btn btn--icon btn--secondary" onClick={() => setSelectedApp(null)}>✕</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.scoreOverview}>
                  <div className={styles.scoreCircleLg}>
                    <strong>{selectedApp.leadScore}</strong><span>/100</span>
                  </div>
                  <span className={getCategoryBadge(selectedApp.leadCategory)} style={{ fontSize: "0.875rem" }}>{selectedApp.leadCategory}</span>
                </div>

                {selectedApp.isDeadLead && (
                  <div className={styles.deadWarning}>
                    <strong>⚠️ Flagged as Dead Lead</strong>
                    <ul>{selectedApp.deadLeadReasons?.map((r, i) => <li key={i}>{r}</li>)}</ul>
                  </div>
                )}

                <div className={styles.breakdownList}>
                  {selectedApp.scoreBreakdown?.breakdown?.map((item, i) => (
                    <div key={i} className={styles.breakdownItem}>
                      <div className={styles.breakdownHeader}>
                        <span>{item.status === "positive" ? "✅" : item.status === "neutral" ? "⚠️" : "❌"} {item.factor}</span>
                        <strong>{item.score}/{item.maxScore}</strong>
                      </div>
                      <div className={styles.breakdownBar}>
                        <div className={styles.breakdownFill} style={{ width: `${(item.score / item.maxScore) * 100}%`, background: item.status === "positive" ? "#10b981" : item.status === "neutral" ? "#f59e0b" : "#ef4444" }} />
                      </div>
                      <p className={styles.breakdownExplanation}>{item.explanation}</p>
                    </div>
                  ))}
                </div>

                {selectedApp.scoreBreakdown?.recommendation && (
                  <div className={styles.recommendation}>
                    <strong>Recommendation:</strong> {selectedApp.scoreBreakdown.recommendation}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
