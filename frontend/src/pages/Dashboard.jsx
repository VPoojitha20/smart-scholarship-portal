
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import ScholarshipDetails from "./ScholarshipDetails.jsx";
import "../App.css";

const API = "http://localhost:5000";

const scholarships = [
  { id: 1, title: "Merit Excellence Award", amount: "₹25,000", category: "Merit-Based", icon: "🏆" },
  { id: 2, title: "Women in STEM Award", amount: "₹30,000", category: "Women in STEM", icon: "👩‍💻" },
  { id: 3, title: "Engineering Talent Award", amount: "₹15,000", category: "Engineering", icon: "⚙️" },
  { id: 4, title: "Student Financial Support", amount: "₹20,000", category: "Need-Based", icon: "🤝" },
  { id: 5, title: "Government Education Aid", amount: "Varies", category: "Government", icon: "🏛️" },
  { id: 6, title: "First-Generation Learner Grant", amount: "₹18,000", category: "Need-Based", icon: "📚" },
  { id: 7, title: "Research Future Fellowship", amount: "₹40,000", category: "Research", icon: "🔬" },
  { id: 8, title: "Academic Achievement Award", amount: "₹12,000", category: "Merit-Based", icon: "🌟" },
  { id: 9, title: "Inclusive Education Support", amount: "Varies", category: "Special Support", icon: "💙" },
  { id: 10, title: "Digital Skills Scholarship", amount: "₹10,000", category: "Technology", icon: "💻" },
  { id: 11, title: "Future Leaders Scholarship", amount: "₹22,000", category: "Leadership", icon: "🚀" },
  { id: 12, title: "Rural Student Education Grant", amount: "₹15,000", category: "Special Support", icon: "🌱" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  let student = null;

  try {
    student = JSON.parse(localStorage.getItem("student") || "null");
  } catch {
    student = null;
  }

  const loadApplications = useCallback(async () => {
    const token = localStorage.getItem("studentToken");

    if (!token) {
      setApplications([]);
      setMessage("Please log in to view your applications.");
      return false;
    }

    try {
      const response = await fetch(`${API}/api/applications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (response.status === 401 || response.status === 403
              ? "Your login session is invalid or expired. Please log in again."
              : "Could not load applications.")
        );
      }

      setApplications(
        (data.applications || []).map((app) => {
          const matchingScholarship = scholarships.find(
            (s) => s.title === app.scholarshipTitle
          );

          return {
            ...app,
            id: app._id,
            title: app.scholarshipTitle,
            amount: matchingScholarship?.amount || "",
            icon: matchingScholarship?.icon || "🎓",
          };
        })
      );

      return true;
    } catch (error) {
      console.error("Load applications error:", error);
      setMessage(error.message || "Could not load applications.");
      return false;
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  async function applyScholarship(formData) {
    const token = localStorage.getItem("studentToken");

    if (!token) {
      setMessage("Please log in before submitting an application.");
      return;
    }

    const scholarship = formData?.scholarship;

    if (!scholarship) {
      setMessage("Application details are missing. Please reopen the scholarship.");
      return;
    }

    if (
      !formData.course?.trim() ||
      !Number.isFinite(Number(formData.cgpa)) ||
      !Number.isFinite(Number(formData.annualFamilyIncome)) ||
      formData.eligibility?.eligible !== true
    ) {
      setMessage("Please enter valid details and check your eligibility first.");
      return;
    }

    const alreadyApplied = applications.some(
      (app) => app.scholarshipTitle === scholarship.title
    );

    if (alreadyApplied) {
      setMessage("You have already applied for this scholarship.");
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      setMessage("");

      const documents = formData.documents || {};

      if (!documents.collegeId || !documents.marksheet) {
        setMessage("Please upload your College ID and marksheet.");
        return;
      }

      const applicationData = new FormData();

      applicationData.append("scholarshipTitle", scholarship.title);
      applicationData.append("category", scholarship.category || "");
      applicationData.append("course", formData.course.trim());
      applicationData.append("cgpa", String(Number(formData.cgpa)));
      applicationData.append(
        "annualFamilyIncome",
        String(Number(formData.annualFamilyIncome))
      );

      applicationData.append(
        "eligibility",
        JSON.stringify(formData.eligibility)
      );

      applicationData.append("collegeId", documents.collegeId);
      applicationData.append("marksheet", documents.marksheet);

      if (documents.incomeCertificate) {
        applicationData.append(
          "incomeCertificate",
          documents.incomeCertificate
        );
      }

      const response = await fetch(`${API}/api/applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: applicationData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setMessage("Your session has expired. Please log in again.");
          return;
        }

        throw new Error(data.message || "Application could not be saved.");
      }

      const refreshed = await loadApplications();

      if (refreshed) {
        setMessage("Application submitted successfully! Status: Pending.");
      } else {
        setMessage(
          "Application submitted successfully. Refresh the page to see it."
        );
      }
    } catch (error) {
      console.error("Submit application error:", error);
      setMessage(error.message || "Could not connect to the backend.");
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("student");
    setApplications([]);
    navigate("/login");
  }

  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <Link to="/" className="logo">
          Scholar<span>Connect</span>
        </Link>

        <div className="nav-buttons">
          <Link to="/" className="login-btn">Home</Link>
          <button className="register-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-container">
        <section className="dashboard-welcome">
          <p className="tagline">STUDENT DASHBOARD</p>
          <h1>Welcome, {student?.name || "Student"}! 🎓</h1>
          <p>Manage your profile and explore scholarship opportunities from one place.</p>
        </section>

        <section className="dashboard-profile">
          <h2>My Profile</h2>
          <div className="profile-details">
            <p><strong>Name:</strong> {student?.name || "Not provided"}</p>
            <p><strong>Email:</strong> {student?.email || "Not provided"}</p>
            <p><strong>College:</strong> {student?.college || "Not provided"}</p>
          </div>
        </section>

        {message && (
          <p
            role="status"
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "#F0EDFF",
            }}
          >
            {message}
          </p>
        )}

        <section className="dashboard-stats">
          <div className="dashboard-stat-card">
            <span>🎓</span>
            <h3>{scholarships.length}</h3>
            <p>Available Scholarships</p>
          </div>

          <div className="dashboard-stat-card">
            <span>📝</span>
            <h3>{applications.length}</h3>
            <p>My Applications</p>
          </div>

          <div className="dashboard-stat-card">
            <span>👤</span>
            <h3>{student ? "Registered" : "Guest"}</h3>
            <p>Account Status</p>
          </div>
        </section>

        <section className="dashboard-scholarships">
          <div className="dashboard-section-heading">
            <div>
              <p className="tagline">OPPORTUNITIES FOR YOU</p>
              <h2>Explore Scholarships</h2>
            </div>
            <Link to="/" className="login-btn">View Home Page</Link>
          </div>

          <div className="dashboard-scholarship-grid">
            {scholarships.map((scholarship) => {
              const isSelected = applications.some(
                (app) => app.scholarshipTitle === scholarship.title
              );

              return (
                <article
                  className="dashboard-scholarship-card"
                  key={scholarship.id}
                >
                  <div className="dashboard-scholarship-icon">
                    {scholarship.icon}
                  </div>

                  <span className="category-label">
                    {scholarship.category}
                  </span>

                  <h3>{scholarship.title}</h3>

                  <p className="dashboard-award">
                    Example award: {scholarship.amount}
                  </p>

                  <button
                    className="apply-btn"
                    onClick={() => {
                      setMessage("");
                      setSelectedScholarship(scholarship);
                    }}
                    disabled={isSelected}
                  >
                    {isSelected ? "Applied ✓" : "View Details & Apply"}
                  </button>
                </article>
              );
            })}
          </div>

          <p className="demo-note">
            These are sample scholarships for demonstration. Eligibility criteria
            are examples; confirm actual rules with the provider.
          </p>
        </section>

        <section className="dashboard-my-selections">
          <h2>My Applications</h2>

          {applications.length === 0 ? (
            <p>
              You have not applied for any scholarships yet. Choose a scholarship
              above to view its details and check eligibility.
            </p>
          ) : (
            <ul>
              {applications.map((item) => (
                <li key={item._id || item.id}>
                  {item.icon || "🎓"} <strong>{item.title}</strong>
                  {item.amount ? ` — ${item.amount}` : ""}
                  {" | Status: "}
                  {item.status}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <ScholarshipDetails
        scholarship={selectedScholarship}
        onClose={() => setSelectedScholarship(null)}
        onApply={applyScholarship}
      />
    </div>
  );
}
