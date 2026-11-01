
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError(false);

    if (password !== confirmPassword) {
      setError(true);
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError(true);
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://smart-scholarship-portal.onrender.com/api/students/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            college: college.trim(),
            password,
          }),
        }
      );

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Backend returned a non-JSON response:", responseText);

        throw new Error(
          "The backend returned a webpage instead of JSON. Please try again."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setMessage("Account created successfully! Opening Login...");
      setError(false);

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(true);

      if (err instanceof TypeError) {
        setMessage(
          "Cannot connect to the deployed backend. Please try again."
        );
      } else {
        setMessage(err.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page register-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <Link to="/" className="auth-brand">
        Scholar<span>Connect</span>
      </Link>

      <div className="auth-layout register-layout">
        <section className="auth-welcome">
          <div className="auth-welcome-icon">🚀</div>
          <p className="tagline">YOUR NEXT CHAPTER STARTS HERE</p>
          <h1>Big dreams deserve great opportunities.</h1>
          <p>
            Create your student account and start exploring scholarship
            opportunities for your education.
          </p>

          <div className="register-highlight">
            <span>✨</span>
            <div>
              <strong>Your journey, your future</strong>
              <p>Explore opportunities in one student-friendly portal.</p>
            </div>
          </div>

          <div className="auth-benefit">
            <span>✓</span> Simple student registration
          </div>
          <div className="auth-benefit">
            <span>✓</span> Explore different scholarship categories
          </div>
          <div className="auth-benefit">
            <span>✓</span> Take a step toward your goals
          </div>
        </section>

        <section className="auth-card register-card">
          <div className="auth-card-icon">✨</div>
          <p className="auth-eyebrow">JOIN SCHOLARCONNECT</p>
          <h2>Create your account</h2>
          <p className="auth-subtitle">
            Fill in your details to get started.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />

            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="register-college">College name</label>
            <input
              id="register-college"
              type="text"
              placeholder="Enter your college name"
              value={college}
              onChange={(event) => setCollege(event.target.value)}
              autoComplete="organization"
              required
            />

            <label htmlFor="register-password">Password</label>
            <div className="auth-password-wrap">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="auth-show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label htmlFor="register-confirm-password">
              Confirm password
            </label>
            <input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />

            {message && (
              <p
                role="alert"
                style={{
                  color: error ? "#c62828" : "#218739",
                  margin: "10px 0",
                  overflowWrap: "anywhere",
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create My Account"}
              {!loading && <span> →</span>}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <Link to="/" className="auth-back-home">
            ← Back to homepage
          </Link>
        </section>
      </div>

      <p className="auth-footer">
        © 2026 ScholarConnect · Supporting students, empowering futures
      </p>
    </main>
  );
}

export default Register;
