"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitApplication } from "@/lib/api";
import {
  ApplicationFormData,
  AdmissionStatus,
  EmploymentType,
  INDIAN_STATES,
  EDUCATION_LEVELS,
} from "@/lib/types";
import styles from "./apply.module.css";

const INITIAL_FORM: ApplicationFormData = {
  fullName: "", email: "", phone: "", dateOfBirth: "", panNumber: "",
  city: "", state: "",
  highestEducation: "", currentInstitution: "", lastGpaPercentage: "",
  targetCourse: "", targetUniversity: "", admissionStatus: "",
  entranceExam: "", entranceScore: "", courseDurationYears: "", annualCourseFee: "",
  annualFamilyIncome: "", earnerEmploymentType: "", existingEmiAmount: "",
  hasCoapplicant: false, coapplicantRelation: "", loanAmountRequired: "",
  hasCollateral: false,
};

const STEPS = ["Personal Details", "Academic Details", "Financial Details", "Review & Submit"];

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ApplicationFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formStartTime] = useState(new Date().toISOString());

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("edufund_draft");
    if (saved) {
      try { setForm(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Auto-save to localStorage on form change
  useEffect(() => {
    localStorage.setItem("edufund_draft", JSON.stringify(form));
  }, [form]);

  const updateField = (field: keyof ApplicationFormData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.fullName || form.fullName.length < 2) errs.fullName = "Name is required (min 2 chars)";
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Valid email is required";
      if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) errs.phone = "Valid 10-digit mobile number required";
      if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
      if (!form.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) errs.panNumber = "Valid PAN required (e.g., ABCDE1234F)";
    } else if (step === 1) {
      if (!form.highestEducation) errs.highestEducation = "Education level is required";
      if (!form.targetCourse) errs.targetCourse = "Course name is required";
      if (!form.targetUniversity) errs.targetUniversity = "University name is required";
      if (!form.admissionStatus) errs.admissionStatus = "Admission status is required";
      if (!form.courseDurationYears) errs.courseDurationYears = "Course duration is required";
      if (!form.annualCourseFee) errs.annualCourseFee = "Annual fee is required";
    } else if (step === 2) {
      if (!form.annualFamilyIncome) errs.annualFamilyIncome = "Family income is required";
      if (!form.earnerEmploymentType) errs.earnerEmploymentType = "Employment type is required";
      if (!form.loanAmountRequired) errs.loanAmountRequired = "Loan amount is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 3)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        lastGpaPercentage: form.lastGpaPercentage || undefined,
        courseDurationYears: Number(form.courseDurationYears),
        annualCourseFee: Number(form.annualCourseFee),
        annualFamilyIncome: Number(form.annualFamilyIncome),
        existingEmiAmount: Number(form.existingEmiAmount) || 0,
        loanAmountRequired: Number(form.loanAmountRequired),
        formStartTime,
        formSubmitTime: new Date().toISOString(),
      };
      const res = await submitApplication(payload);
      localStorage.removeItem("edufund_draft");
      router.push(`/success?appNo=${res.data.applicationNumber}&score=${res.data.leadScore}&category=${res.data.leadCategory}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (label: string, field: keyof ApplicationFormData, type = "text", opts?: { required?: boolean; hint?: string; placeholder?: string }) => (
    <div className="form-group">
      <label className={`form-label ${opts?.required ? "form-label--required" : ""}`}>{label}</label>
      {opts?.hint && <span className="form-hint">{opts.hint}</span>}
      <input
        className={`form-input ${errors[field] ? "form-input--error" : ""}`}
        type={type}
        value={form[field] as string}
        onChange={(e) => updateField(field, type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
        placeholder={opts?.placeholder}
        id={`field-${field}`}
      />
      {errors[field] && <span className="form-error">{errors[field]}</span>}
    </div>
  );

  const renderSelect = (label: string, field: keyof ApplicationFormData, options: { value: string; label: string }[], opts?: { required?: boolean }) => (
    <div className="form-group">
      <label className={`form-label ${opts?.required ? "form-label--required" : ""}`}>{label}</label>
      <select className={`form-select ${errors[field] ? "form-input--error" : ""}`} value={form[field] as string} onChange={(e) => updateField(field, e.target.value)} id={`field-${field}`}>
        <option value="">Select...</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {errors[field] && <span className="form-error">{errors[field]}</span>}
    </div>
  );

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <a href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <span className={styles.logoText}>EduFund</span>
          </a>
          <div className={styles.securityBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>256-bit Encrypted</span>
          </div>
        </div>
      </nav>

      <main className={`container container--narrow ${styles.main}`}>
        <div className={styles.header}>
          <h1>Loan Application</h1>
          <p>Complete the form below. Your progress is auto-saved.</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          {STEPS.map((s, i) => (
            <div key={s} className={`progress-step ${i === step ? "progress-step--active" : ""} ${i < step ? "progress-step--completed" : ""}`}>
              <div className="progress-step__circle">{i < step ? "✓" : i + 1}</div>
              <span className="progress-step__label">{s}</span>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <div className={`card ${styles.formCard}`}>
          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className={styles.stepTitle}>Personal Details</h2>
              <p className={styles.stepDesc}>Tell us about yourself. This helps us verify your identity.</p>
              {renderInput("Full Name", "fullName", "text", { required: true, placeholder: "As per PAN card" })}
              <div className="form-row">
                {renderInput("Email Address", "email", "email", { required: true, placeholder: "you@example.com" })}
                {renderInput("Phone Number", "phone", "tel", { required: true, placeholder: "10-digit mobile number", hint: "Indian mobile number starting with 6-9" })}
              </div>
              <div className="form-row">
                {renderInput("Date of Birth", "dateOfBirth", "date", { required: true })}
                {renderInput("PAN Number", "panNumber", "text", { required: true, placeholder: "ABCDE1234F", hint: "Uppercase letters and digits" })}
              </div>
              <div className="form-row">
                {renderInput("City", "city", "text", { placeholder: "Your current city" })}
                {renderSelect("State", "state", INDIAN_STATES.map((s) => ({ value: s, label: s })))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className={styles.stepTitle}>Academic Details</h2>
              <p className={styles.stepDesc}>Your academic background helps us assess your eligibility.</p>
              <div className="form-row">
                {renderSelect("Highest Education", "highestEducation", EDUCATION_LEVELS.map((e) => ({ value: e, label: e })), { required: true })}
                {renderInput("Current Institution", "currentInstitution", "text", { placeholder: "Your current/last college" })}
              </div>
              {renderInput("Last GPA / Percentage", "lastGpaPercentage", "number", { placeholder: "e.g., 82.5", hint: "Enter as percentage (0-100)" })}
              <div className="form-row">
                {renderInput("Course Applying For", "targetCourse", "text", { required: true, placeholder: "e.g., M.Tech Computer Science" })}
                {renderInput("Target University", "targetUniversity", "text", { required: true, placeholder: "e.g., IIT Bombay" })}
              </div>
              {renderSelect("Admission Status", "admissionStatus", [
                { value: AdmissionStatus.CONFIRMED, label: "✅ Confirmed — I have the admission letter" },
                { value: AdmissionStatus.ACCEPTED, label: "📩 Accepted — Offer received, not yet confirmed" },
                { value: AdmissionStatus.APPLIED, label: "📝 Applied — Application submitted to university" },
                { value: AdmissionStatus.PLANNING, label: "💭 Planning — Haven't applied yet" },
              ], { required: true })}
              <div className="form-row">
                {renderInput("Entrance Exam (if any)", "entranceExam", "text", { placeholder: "e.g., GATE, GRE, CAT" })}
                {renderInput("Exam Score", "entranceScore", "text", { placeholder: "e.g., 320/340" })}
              </div>
              <div className="form-row">
                {renderInput("Course Duration (years)", "courseDurationYears", "number", { required: true, placeholder: "e.g., 2" })}
                {renderInput("Annual Course Fee (₹)", "annualCourseFee", "number", { required: true, placeholder: "e.g., 500000" })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className={styles.stepTitle}>Financial Details</h2>
              <p className={styles.stepDesc}>This helps us determine your loan eligibility and repayment capacity.</p>
              <div className="form-row">
                {renderInput("Annual Family Income (₹)", "annualFamilyIncome", "number", { required: true, placeholder: "e.g., 800000" })}
                {renderSelect("Primary Earner Employment", "earnerEmploymentType", [
                  { value: EmploymentType.SALARIED, label: "Salaried" },
                  { value: EmploymentType.SELF_EMPLOYED, label: "Self Employed" },
                  { value: EmploymentType.BUSINESS, label: "Business Owner" },
                  { value: EmploymentType.RETIRED, label: "Retired" },
                  { value: EmploymentType.OTHER, label: "Other" },
                ], { required: true })}
              </div>
              {renderInput("Existing EMI / Loan Payments (₹/month)", "existingEmiAmount", "number", { placeholder: "0 if none" })}
              <div className="form-group">
                <label className="form-label">Do you have a Co-applicant?</label>
                <span className="form-hint">Most education loans require a parent/guardian as co-applicant</span>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="coapplicant" checked={form.hasCoapplicant === true} onChange={() => updateField("hasCoapplicant", true)} /> Yes
                  </label>
                  <label className={styles.radioLabel}>
                    <input type="radio" name="coapplicant" checked={form.hasCoapplicant === false} onChange={() => updateField("hasCoapplicant", false)} /> No
                  </label>
                </div>
              </div>
              {form.hasCoapplicant && renderInput("Co-applicant Relationship", "coapplicantRelation", "text", { placeholder: "e.g., Father, Mother, Spouse" })}
              {renderInput("Loan Amount Required (₹)", "loanAmountRequired", "number", { required: true, placeholder: "e.g., 1000000" })}
              <div className="form-group">
                <label className="form-label">Do you have collateral (property, FD, etc.)?</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}><input type="radio" name="collateral" checked={form.hasCollateral === true} onChange={() => updateField("hasCollateral", true)} /> Yes</label>
                  <label className={styles.radioLabel}><input type="radio" name="collateral" checked={form.hasCollateral === false} onChange={() => updateField("hasCollateral", false)} /> No</label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className={styles.stepTitle}>Review Your Application</h2>
              <p className={styles.stepDesc}>Please verify all details before submitting.</p>
              <div className={styles.reviewSection}>
                <h3>Personal Details</h3>
                <div className={styles.reviewGrid}>
                  <div><span>Name</span><strong>{form.fullName}</strong></div>
                  <div><span>Email</span><strong>{form.email}</strong></div>
                  <div><span>Phone</span><strong>{form.phone}</strong></div>
                  <div><span>DOB</span><strong>{form.dateOfBirth}</strong></div>
                  <div><span>PAN</span><strong>{form.panNumber}</strong></div>
                  <div><span>Location</span><strong>{form.city}{form.state ? `, ${form.state}` : ""}</strong></div>
                </div>
              </div>
              <div className={styles.reviewSection}>
                <h3>Academic Details</h3>
                <div className={styles.reviewGrid}>
                  <div><span>Education</span><strong>{form.highestEducation}</strong></div>
                  <div><span>Course</span><strong>{form.targetCourse}</strong></div>
                  <div><span>University</span><strong>{form.targetUniversity}</strong></div>
                  <div><span>Admission</span><strong>{form.admissionStatus}</strong></div>
                  <div><span>Duration</span><strong>{form.courseDurationYears} years</strong></div>
                  <div><span>Annual Fee</span><strong>₹{Number(form.annualCourseFee).toLocaleString("en-IN")}</strong></div>
                </div>
              </div>
              <div className={styles.reviewSection}>
                <h3>Financial Details</h3>
                <div className={styles.reviewGrid}>
                  <div><span>Family Income</span><strong>₹{Number(form.annualFamilyIncome).toLocaleString("en-IN")}/yr</strong></div>
                  <div><span>Employment</span><strong>{form.earnerEmploymentType}</strong></div>
                  <div><span>Loan Amount</span><strong>₹{Number(form.loanAmountRequired).toLocaleString("en-IN")}</strong></div>
                  <div><span>Co-applicant</span><strong>{form.hasCoapplicant ? `Yes (${form.coapplicantRelation})` : "No"}</strong></div>
                  <div><span>Collateral</span><strong>{form.hasCollateral ? "Yes" : "No"}</strong></div>
                </div>
              </div>
              <div className={styles.disclaimer}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <p>By submitting, you confirm that all information provided is accurate. Your data is encrypted and secure.</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={styles.formActions}>
            {step > 0 && <button className="btn btn--secondary" onClick={prevStep} type="button">← Back</button>}
            <div style={{ flex: 1 }} />
            {step < 3 ? (
              <button className="btn btn--primary" onClick={nextStep} type="button" id="next-step-btn">
                Continue →
              </button>
            ) : (
              <button className="btn btn--primary btn--lg" onClick={handleSubmit} disabled={submitting} type="button" id="submit-btn">
                {submitting ? <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Submitting...</> : "Submit Application ✓"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
