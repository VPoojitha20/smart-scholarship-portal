
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Backend returned an invalid response. Restart your backend."
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed.");
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.decorationOne} />
      <div style={styles.decorationTwo} />

      <div style={styles.layout}>
        <section style={styles.intro}>
          <div style={styles.brandIcon}>🎓</div>
          <p style={styles.eyebrow}>SCHOLARCONNECT</p>
          <h1 style={styles.heroTitle}>
            Empowering
            <br />
            Every Student's
            <br />
            <span style={{ color: "#C5B5FF" }}>Dream.</span>
          </h1>
          <p style={styles.heroText}>
            A smarter way to manage scholarship applications, verify
            eligibility, and support students on their educational journey.
          </p>

          <div style={styles.feature}>
            <span style={styles.check}>✓</span>
            Centralized application management
          </div>
          <div style={styles.feature}>
            <span style={styles.check}>✓</span>
            Simple approval and rejection workflow
          </div>
          <div style={styles.feature}>
            <span style={styles.check}>✓</span>
            Track applications in one place
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.adminIcon}>♙</div>
          <p style={styles.smallTitle}>ADMINISTRATOR ACCESS</p>
          <h2 style={styles.title}>Welcome back!</h2>
          <p style={styles.subtitle}>
            Sign in to manage your scholarship portal.
          </p>

          <form onSubmit={handleLogin}>
            <label style={styles.label}>Admin email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your admin email"
              autoComplete="username"
              required
              style={styles.input}
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              style={styles.input}
            />

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Signing in..." : "Sign in to Admin →"}
            </button>
          </form>

          <div style={styles.divider}>
            <span>STUDENT ACCESS</span>
          </div>

          <Link to="/login" style={styles.studentLink}>
            Go to Student Login
          </Link>

          <p style={styles.security}>
            🔒 Secure administrator access
          </p>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    boxSizing: "border-box",
    padding: "50px 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #F2EEFF, #F8FAFF 55%, #E6FAF6)",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  decorationOne: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background: "#DCD1FF",
    opacity: 0.45,
    top: -140,
    right: -60,
  },
  decorationTwo: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: "50%",
    background: "#BDEFE5",
    opacity: 0.45,
    bottom: -130,
    left: -70,
  },
  layout: {
    width: "100%",
    maxWidth: 1120,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: 45,
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  intro: {
    color: "#211A49",
    padding: "15px 0",
  },
  brandIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    background: "#6D4AFF",
    display: "grid",
    placeItems: "center",
    fontSize: 31,
    boxShadow: "0 12px 25px #6D4AFF35",
  },
  eyebrow: {
    letterSpacing: 3,
    fontWeight: 800,
    fontSize: 12,
    color: "#6D4AFF",
    marginTop: 25,
  },
  heroTitle: {
    fontSize: "clamp(36px, 5vw, 57px)",
    lineHeight: 1.12,
    letterSpacing: -1.5,
    margin: "16px 0",
  },
  heroText: {
    maxWidth: 440,
    color: "#686780",
    lineHeight: 1.9,
    fontSize: 16,
    marginBottom: 28,
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "15px 0",
    color: "#45405F",
    fontSize: 14,
  },
  check: {
    background: "#E1D9FF",
    color: "#5D3DE5",
    borderRadius: "50%",
    width: 25,
    height: 25,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #FFFFFF",
    borderRadius: 26,
    padding: "clamp(24px, 4vw, 42px)",
    boxShadow: "0 25px 70px #3D287D15",
    boxSizing: "border-box",
    width: "100%",
  },
  adminIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    background: "#F0EBFF",
    color: "#6D4AFF",
    display: "grid",
    placeItems: "center",
    fontSize: 30,
    marginBottom: 20,
  },
  smallTitle: {
    color: "#7558EA",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 800,
    marginBottom: 10,
  },
  title: {
    color: "#211A49",
    fontSize: 31,
    margin: "0 0 9px",
  },
  subtitle: {
    color: "#77768B",
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 28,
  },
  label: {
    display: "block",
    color: "#302B4B",
    fontWeight: 700,
    fontSize: 13,
    margin: "19px 0 9px",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #E3E0EE",
    borderRadius: 11,
    outlineColor: "#7A5AFF",
    fontSize: 14,
    background: "#FCFBFF",
  },
  button: {
    width: "100%",
    padding: 15,
    marginTop: 25,
    border: "none",
    borderRadius: 11,
    background: "linear-gradient(100deg, #6742ED, #8969FF)",
    color: "white",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 9px 20px #7955F52D",
  },
  error: {
    marginTop: 14,
    background: "#FFF0F0",
    color: "#B42318",
    borderRadius: 9,
    padding: 12,
    fontSize: 13,
    lineHeight: 1.5,
  },
  divider: {
    borderTop: "1px solid #ECEAF3",
    textAlign: "center",
    marginTop: 27,
    paddingTop: 20,
    color: "#9390A5",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 700,
  },
  studentLink: {
    display: "block",
    textAlign: "center",
    color: "#6742ED",
    textDecoration: "none",
    fontWeight: 700,
    marginTop: 16,
    fontSize: 14,
  },
  security: {
    textAlign: "center",
    color: "#9290A2",
    fontSize: 11,
    margin: "25px 0 0",
  },
};

export default AdminLogin;
