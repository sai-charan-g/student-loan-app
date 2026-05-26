"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import styles from "./success.module.css";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const appNo = params.get("appNo") || "N/A";
  const score = params.get("score") || "N/A";
  const category = params.get("category") || "N/A";

  const getCategoryColor = (cat: string) => {
    if (cat === "HIGH") return "#10b981";
    if (cat === "MEDIUM") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h1>Application Submitted!</h1>
        <p className={styles.subtitle}>Your education loan application has been received and processed.</p>
        
        <div className={styles.appNumber}>
          <span>Application Number</span>
          <strong>{appNo}</strong>
          <p className={styles.hint}>Save this number to track your application status</p>
        </div>

        <div className={styles.scoreBar}>
          <div className={styles.scoreItem}>
            <span>Eligibility Score</span>
            <strong>{score}/100</strong>
          </div>
          <div className={styles.scoreItem}>
            <span>Lead Quality</span>
            <strong style={{ color: getCategoryColor(category) }}>{category}</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <button className="btn btn--primary btn--lg btn--full" onClick={() => router.push(`/track?appNo=${appNo}`)}>Track Your Application</button>
          <button className="btn btn--secondary btn--full" onClick={() => router.push("/")}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense fallback={<div className={styles.page}><div className="spinner" /></div>}><SuccessContent /></Suspense>;
}
