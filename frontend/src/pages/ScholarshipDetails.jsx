
import { useState } from "react";

export default function ScholarshipDetails({
  scholarship,
  onClose,
  onApply,
}) {
  const [course, setCourse] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [income, setIncome] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Added: document proof fields
  const [collegeId, setCollegeId] = useState(null);
  const [marksheet, setMarksheet] = useState(null);
  const [incomeCertificate, setIncomeCertificate] = useState(null);

  if (!scholarship) return null;

  const minCgpa = scholarship.minCgpa ?? 6;
  const maxIncome = scholarship.maxIncome ?? 500000;

  function checkEligibility(event) {
    event.preventDefault();
    setSubmitError("");

    const score = Number(cgpa);
    const familyIncome = Number(income);

    if (
      !course.trim() ||
      cgpa === "" ||
      income === "" ||
      !Number.isFinite(score) ||
      !Number.isFinite(familyIncome) ||
      score < 0 ||
      score > 10 ||
      familyIncome < 0
    ) {
      setResult("invalid");
      return;
    }

    if (score >= minCgpa && familyIncome <= maxIncome) {
      setResult("eligible");
    } else {
      setResult("not-eligible");
    }
  }

  async function submitApplication() {
    setSubmitError("");

    const token = localStorage.getItem("studentToken");

    if (!token) {
      setSubmitError(
        "Please log in to your student account before submitting an application."
      );
      return;
    }

    if (result !== "eligible") {
      setSubmitError("Please check your eligibility first.");
      return;
    }

    // Added: check required document proofs
    if (!collegeId || !marksheet) {
      setSubmitError(
        "Please upload your College ID and latest marksheet before submitting."
      );
      return;
    }

    setSubmitting(true);

    try {
      await onApply({
        scholarship,
        course: course.trim(),
        cgpa: Number(cgpa),
        annualFamilyIncome: Number(income),
        eligibility: {
          eligible: true,
          reason: "Meets the sample eligibility criteria",
          conditions: {
            minCgpa,
            maxIncome,
          },
        },

        // Added: pass documents with application details
        documents: {
          collegeId,
          marksheet,
          incomeCertificate,
        },
      });
    } catch (err) {
      setSubmitError(
        err.message || "Unable to submit your application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="scholarship-title"
        style={styles.modal}
      >
        <div style={styles.topBanner}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scholarship details"
            style={styles.closeButton}
          >
            ✕
          </button>

          <div style={styles.topIcon}>{scholarship.icon}</div>
          <div style={styles.eyebrow}>SCHOLARCONNECT OPPORTUNITY</div>

          <h2 id="scholarship-title" style={styles.title}>
            {scholarship.title}
          </h2>

          <p style={styles.bannerText}>
            Check your eligibility and take the next step toward your goals.
          </p>
        </div>

        <div style={styles.content}>
          <div style={styles.awardCard}>
            <div>
              <div style={styles.muted}>Scholarship award</div>
              <div style={styles.amount}>{scholarship.amount}</div>
            </div>

            <div style={styles.categoryBadge}>
              {scholarship.category}
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Eligibility overview</h3>

          <div style={styles.criteriaGrid}>
            <div style={styles.criteriaCard}>
              <div style={styles.criteriaIcon}>🎓</div>
              <div style={styles.muted}>Minimum CGPA</div>
              <strong style={styles.criteriaValue}>
                {minCgpa}/10
              </strong>
            </div>

            <div style={styles.criteriaCard}>
              <div style={styles.criteriaIcon}>💰</div>
              <div style={styles.muted}>Annual family income</div>
              <strong style={styles.criteriaValue}>
                Up to ₹{maxIncome.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div style={styles.notice}>
            <span>📄</span>
            <div>
              <strong>Documents to prepare</strong>
              <p style={styles.noticeText}>
                College ID, latest marksheet, and income certificate if required.
              </p>
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Tell us about yourself</h3>

          <p style={styles.formDescription}>
            Enter your details to check the sample eligibility criteria.
          </p>

          <form onSubmit={checkEligibility}>
            <label style={styles.label}>
              Course / Branch
              <input
                style={styles.input}
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                placeholder="e.g. B.Tech CSE"
                required
              />
            </label>

            <div style={styles.formGrid}>
              <label style={styles.label}>
                Current CGPA
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={cgpa}
                  onChange={(event) => setCgpa(event.target.value)}
                  placeholder="e.g. 8.2"
                  required
                />
                <span style={styles.helper}>Out of 10</span>
              </label>

              <label style={styles.label}>
                Family income
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  step="1"
                  value={income}
                  onChange={(event) => setIncome(event.target.value)}
                  placeholder="e.g. 250000"
                  required
                />
                <span style={styles.helper}>Annual income in ₹</span>
              </label>
            </div>

            {/* Added: document uploads; existing design is unchanged */}
            <h3 style={styles.sectionTitle}>Upload Document Proofs</h3>

            <p style={styles.formDescription}>
              Upload your documents in PDF, JPG, or PNG format.
            </p>

            <label style={styles.label}>
              College ID <span style={{ color: "#B42318" }}>*</span>
              <input
                style={styles.input}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                onChange={(event) =>
                  setCollegeId(event.target.files?.[0] || null)
                }
              />
            </label>

            <label style={styles.label}>
              Latest Marksheet <span style={{ color: "#B42318" }}>*</span>
              <input
                style={styles.input}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                onChange={(event) =>
                  setMarksheet(event.target.files?.[0] || null)
                }
              />
            </label>

            <label style={styles.label}>
              Income Certificate
              <input
                style={styles.input}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) =>
                  setIncomeCertificate(event.target.files?.[0] || null)
                }
              />
              <span style={styles.helper}>
                Optional, unless required for the scholarship.
              </span>
            </label>

            <button
              type="submit"
              style={styles.primaryButton}
            >
              Check My Eligibility <span>→</span>
            </button>
          </form>

          {result === "invalid" && (
            <div role="alert" style={styles.errorResult}>
              Please enter a valid course, CGPA from 0 to 10, and non-negative
              annual family income.
            </div>
          )}

          {result === "eligible" && (
            <div role="status" style={styles.successResult}>
              <div style={styles.resultIcon}>✓</div>

              <h3 style={styles.resultTitle}>
                You meet the sample criteria!
              </h3>

              <p style={styles.resultText}>
                Your entered CGPA and family income meet these demonstration
                requirements.
              </p>

              <button
                type="button"
                style={{
                  ...styles.submitButton,
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? "wait" : "pointer",
                }}
                onClick={submitApplication}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          )}

          {result === "not-eligible" && (
            <div role="status" style={styles.errorResult}>
              <strong>Criteria not met yet</strong>
              <p style={styles.resultText}>
                This sample requires a CGPA of at least {minCgpa}/10 and annual
                family income no greater than ₹
                {maxIncome.toLocaleString("en-IN")}.
              </p>
            </div>
          )}

          {submitError && (
            <div role="alert" style={styles.errorResult}>
              {submitError}
            </div>
          )}

          <div style={styles.footerNote}>
            <span>ℹ️</span>
            <p>
              Demo eligibility rules only. These are not official scholarship
              requirements. Confirm the real criteria with the scholarship
              provider. Applications are submitted to the portal backend.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(24, 20, 52, 0.68)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    overflowY: "auto",
  },

  modal: {
    background: "#ffffff",
    color: "#292747",
    width: "100%",
    maxWidth: 600,
    maxHeight: "94vh",
    overflowY: "auto",
    borderRadius: 22,
    boxShadow: "0 24px 80px rgba(20, 15, 60, 0.28)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  topBanner: {
    position: "relative",
    padding: "28px 28px 24px",
    background: "linear-gradient(135deg, #5145CD, #8774F5)",
    color: "#ffffff",
    borderRadius: "22px 22px 0 0",
  },

  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.14)",
    color: "#ffffff",
    fontSize: 17,
    cursor: "pointer",
  },

  topIcon: {
    width: 58,
    height: 58,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    background: "rgba(255,255,255,0.18)",
    fontSize: 30,
    marginBottom: 16,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.7,
    opacity: 0.85,
  },

  title: {
    fontSize: 27,
    lineHeight: 1.25,
    margin: "8px 0",
    paddingRight: 18,
    color: "#ffffff",
  },

  bannerText: {
    fontSize: 14,
    lineHeight: 1.6,
    margin: 0,
    color: "#F0EEFF",
  },

  content: {
    padding: "24px 28px 26px",
  },

  awardCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    background: "#F5F3FF",
    border: "1px solid #E8E3FF",
    borderRadius: 15,
    padding: 18,
  },

  muted: {
    fontSize: 12,
    color: "#77758D",
    marginBottom: 6,
  },

  amount: {
    fontSize: 26,
    fontWeight: 800,
    color: "#5548CB",
  },

  categoryBadge: {
    background: "#E5E1FF",
    color: "#5145CD",
    padding: "8px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },

  sectionTitle: {
    fontSize: 17,
    margin: "24px 0 12px",
    color: "#292747",
  },

  criteriaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },

  criteriaCard: {
    padding: 16,
    border: "1px solid #EAE9F2",
    borderRadius: 14,
    background: "#FFFFFF",
  },

  criteriaIcon: {
    fontSize: 22,
    marginBottom: 10,
  },

  criteriaValue: {
    display: "block",
    color: "#343052",
    fontSize: 17,
    overflowWrap: "anywhere",
  },

  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: 15,
    marginTop: 16,
    borderRadius: 13,
    background: "#F7F8FC",
    border: "1px solid #EBEDF5",
    fontSize: 13,
  },

  noticeText: {
    margin: "6px 0 0",
    lineHeight: 1.6,
    color: "#77758D",
  },

  formDescription: {
    margin: "-4px 0 18px",
    color: "#77758D",
    fontSize: 13,
    lineHeight: 1.6,
  },

  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: "#3D3A59",
    marginBottom: 16,
  },

  input: {
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    padding: "13px 14px",
    marginTop: 8,
    border: "1px solid #DEDFEA",
    borderRadius: 10,
    outlineColor: "#6558E8",
    background: "#FCFCFE",
    color: "#292747",
    fontSize: 14,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
  },

  helper: {
    display: "block",
    marginTop: 6,
    fontSize: 11,
    fontWeight: 400,
    color: "#85839A",
  },

  primaryButton: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 14,
    border: "none",
    borderRadius: 11,
    background: "linear-gradient(135deg, #5145CD, #7967EF)",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(91, 75, 210, 0.22)",
  },

  successResult: {
    marginTop: 18,
    padding: 18,
    borderRadius: 14,
    background: "#ECFDF3",
    border: "1px solid #B7EACB",
    color: "#176B3A",
    textAlign: "center",
  },

  resultIcon: {
    margin: "0 auto 10px",
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#C9F3D8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 800,
  },

  resultTitle: {
    fontSize: 17,
    margin: "8px 0",
  },

  resultText: {
    fontSize: 13,
    lineHeight: 1.6,
  },

  submitButton: {
    width: "100%",
    padding: 13,
    marginTop: 8,
    border: "none",
    borderRadius: 10,
    background: "#16834A",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },

  errorResult: {
    marginTop: 16,
    padding: 15,
    borderRadius: 12,
    background: "#FFF1F0",
    border: "1px solid #FFD3CF",
    color: "#B42318",
    fontSize: 13,
    lineHeight: 1.7,
  },

  footerNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 22,
    paddingTop: 15,
    borderTop: "1px solid #EEEEF4",
    color: "#85839A",
    fontSize: 11,
    lineHeight: 1.7,
  },
};
