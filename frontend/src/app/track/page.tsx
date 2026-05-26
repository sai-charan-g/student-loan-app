"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trackApplication } from "@/lib/api";
import { TrackingResponse, ApplicationStatus } from "@/lib/types";
import styles from "./track.module.css";

const STATUS_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
  SUBMITTED: { label: "Submitted", color: "#3b82f6", icon: "📥" },
  UNDER_REVIEW: { label: "Under Review", color: "#f59e0b", icon: "🔍" },
  SCORING_COMPLETE: { label: "Assessment Complete", color: "#6366f1", icon: "✅" },
  NEEDS_INFO: { label: "Additional Info Needed", color: "#f97316", icon: "📋" },
  APPROVED: { label: "Approved", color: "#10b981", icon: "🎉" },
  REJECTED: { label: "Not Approved", color: "#ef4444", icon: "❌" },
  DISBURSED: { label: "Loan Disbursed", color: "#059669", icon: "💰" },
};

function TrackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [appNumber, setAppNumber] = useState(params.get("appNo") || "");
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!appNumber.trim()) { setError("Please enter your application number"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await trackApplication(appNumber.trim());
      setResult(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Application not found");
    } finally { setLoading(false); }
  };

  const statusInfo = result ? STATUS_DISPLAY[result.status] || STATUS_DISPLAY.SUBMITTED : null;

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <a href="/" className={styles.logo}>
            <div className={styles.logoIcon}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
            <span className={styles.logoText}>EduFund</span>
          </a>
          <button className="btn btn--primary" onClick={() => router.push("/apply")}>Apply Now</button>
        </div>
      </nav>

      <main className={`container container--narrow ${styles.main}`}>
        <h1 className={styles.title}>Track Your Application</h1>
        <p className={styles.subtitle}>Enter your application number to check the current status.</p>

        <div className={styles.searchBox}>
          <input className="form-input" placeholder="e.g., EL-2026-00001" value={appNumber} onChange={(e) => setAppNumber(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleTrack()} id="track-input" />
          <button className="btn btn--primary" onClick={handleTrack} disabled={loading} id="track-btn">
            {loading ? "Searching..." : "Track"}
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}

        {result && statusInfo && (
          <div className={`card ${styles.resultCard} animate-fade-in-up`}>
            <div className={styles.statusHeader}>
              <span className={styles.statusIcon}>{statusInfo.icon}</span>
              <div>
                <span className={styles.statusLabel} style={{ color: statusInfo.color }}>{statusInfo.label}</span>
                <h2>{result.applicationNumber}</h2>
              </div>
            </div>

            <div className={styles.detailGrid}>
              <div><span>Applicant</span><strong>{result.fullName}</strong></div>
              <div><span>Course</span><strong>{result.targetCourse}</strong></div>
              <div><span>University</span><strong>{result.targetUniversity}</strong></div>
              <div><span>Loan Amount</span><strong>₹{Number(result.loanAmountRequired).toLocaleString("en-IN")}</strong></div>
              <div><span>Submitted</span><strong>{new Date(result.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></div>
            </div>

            {result.statusHistory && result.statusHistory.length > 0 && (
              <div className={styles.timeline}>
                <h3>Status Timeline</h3>
                {result.statusHistory.map((h, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelineDot} style={{ background: i === 0 ? statusInfo.color : "#d1d5db" }} />
                    <div>
                      <strong>{STATUS_DISPLAY[h.status]?.label || h.status}</strong>
                      <p>{h.reason}</p>
                      <span className={styles.timelineDate}>{new Date(h.date).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackPage() {
  return <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", paddingTop: "4rem" }}><div className="spinner" /></div>}><TrackContent /></Suspense>;
}
