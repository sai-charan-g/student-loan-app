"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      {/* ─── Background Effects ─── */}
      <div className={styles.bgGradient} />
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      {/* ─── Navbar ─── */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span className={styles.logoText}>EduFund</span>
          </div>
          <div className={styles.navLinks}>
            <button
              className="btn btn--outline"
              onClick={() => router.push("/track")}
            >
              Track Application
            </button>
            <button
              className="btn btn--primary"
              onClick={() => router.push("/apply")}
            >
              Apply Now
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <div className={`${styles.heroBadge} animate-fade-in-up`}>
              <span className={styles.heroBadgeDot} />
              Trusted by 10,000+ Students
            </div>
            <h1 className={`${styles.heroTitle} animate-fade-in-up stagger-1`}>
              Your Education Dreams,{" "}
              <span className="text-gradient">Funded Smartly</span>
            </h1>
            <p className={`${styles.heroSubtitle} animate-fade-in-up stagger-2`}>
              Apply for education loans with instant eligibility assessment. 
              Our AI-powered system evaluates your profile in seconds — 
              no long queues, no paperwork hassle.
            </p>
            <div className={`${styles.heroCta} animate-fade-in-up stagger-3`}>
              <button
                className="btn btn--primary btn--lg"
                onClick={() => router.push("/apply")}
                id="hero-apply-btn"
              >
                Start Application
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
              <button
                className="btn btn--secondary btn--lg"
                onClick={() => router.push("/track")}
                id="hero-track-btn"
              >
                Track Existing Application
              </button>
            </div>
            <div className={`${styles.heroStats} animate-fade-in-up stagger-4`}>
              <div className={styles.stat}>
                <span className={styles.statValue}>₹500Cr+</span>
                <span className={styles.statLabel}>Loans Disbursed</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statValue}>24hrs</span>
                <span className={styles.statLabel}>Avg. Processing</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statValue}>98%</span>
                <span className={styles.statLabel}>Satisfaction Rate</span>
              </div>
            </div>
          </div>
          <div className={`${styles.heroVisual} animate-fade-in-up stagger-2`}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardHeader}>
                <div className={styles.heroCardDots}>
                  <span /><span /><span />
                </div>
                <span className={styles.heroCardTitle}>Loan Assessment</span>
              </div>
              <div className={styles.heroCardBody}>
                <div className={styles.heroCardScore}>
                  <div className={styles.scoreCircle}>
                    <svg viewBox="0 0 100 100" className={styles.scoreRing}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="6" strokeDasharray="264" strokeDashoffset="53" strokeLinecap="round" transform="rotate(-90 50 50)" />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className={styles.scoreValue}>82</span>
                  </div>
                  <div>
                    <p className={styles.scoreLabel}>Lead Score</p>
                    <span className="badge badge--high">HIGH QUALITY</span>
                  </div>
                </div>
                <div className={styles.heroCardItems}>
                  <div className={styles.heroCardItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Admission Confirmed
                  </div>
                  <div className={styles.heroCardItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Strong Academics (86%)
                  </div>
                  <div className={styles.heroCardItem}>
                    <span className={styles.checkIcon}>✓</span>
                    Co-applicant Available
                  </div>
                  <div className={styles.heroCardItem}>
                    <span className={styles.warnIcon}>!</span>
                    Documents Pending
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className={styles.features} id="features">
        <div className="container">
          <h2 className={styles.sectionTitle}>
            Why Students Choose <span className="text-gradient">EduFund</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            We&apos;ve simplified the entire loan application journey — from application to disbursement.
          </p>
          <div className={styles.featureGrid}>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon} style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Instant Assessment</h3>
              <p className={styles.featureDesc}>
                Our smart scoring system evaluates your eligibility in seconds, not days. Know where you stand immediately.
              </p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon} style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>100% Secure</h3>
              <p className={styles.featureDesc}>
                Bank-grade encryption protects your data. We never share your personal information with third parties.
              </p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon} style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Real-time Tracking</h3>
              <p className={styles.featureDesc}>
                Track your application status at every stage. No more calling branches or waiting for updates.
              </p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon} style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Expert Guidance</h3>
              <p className={styles.featureDesc}>
                Get matched with experienced loan advisors who understand education financing inside out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Process Section ─── */}
      <section className={styles.process}>
        <div className="container">
          <h2 className={styles.sectionTitle}>
            Simple <span className="text-gradient">4-Step</span> Process
          </h2>
          <div className={styles.processSteps}>
            <div className={styles.processStep}>
              <div className={styles.processNumber}>01</div>
              <h3>Fill Application</h3>
              <p>Complete our smart form in under 5 minutes with step-by-step guidance.</p>
            </div>
            <div className={styles.processArrow}>→</div>
            <div className={styles.processStep}>
              <div className={styles.processNumber}>02</div>
              <h3>Instant Scoring</h3>
              <p>Our system evaluates your profile and assigns an eligibility score.</p>
            </div>
            <div className={styles.processArrow}>→</div>
            <div className={styles.processStep}>
              <div className={styles.processNumber}>03</div>
              <h3>Review & Verify</h3>
              <p>Our team reviews your application and may request additional documents.</p>
            </div>
            <div className={styles.processArrow}>→</div>
            <div className={styles.processStep}>
              <div className={styles.processNumber}>04</div>
              <h3>Get Funded</h3>
              <p>Once approved, funds are disbursed directly to your institution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className={styles.cta}>
        <div className="container text-center">
          <h2 className={styles.ctaTitle}>Ready to Fund Your Future?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of students who&apos;ve taken the first step towards their dream education.
          </p>
          <button
            className="btn btn--primary btn--lg"
            onClick={() => router.push("/apply")}
            id="cta-apply-btn"
          >
            Start Your Application Now
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <span className={styles.logoText}>EduFund</span>
              </div>
              <p className={styles.footerDesc}>
                Making education financing accessible, transparent, and smart.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <p className={styles.footerCopyright}>
                © {new Date().getFullYear()} EduFund. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
