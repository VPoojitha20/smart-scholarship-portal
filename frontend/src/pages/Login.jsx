
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch(
        "https://smart-scholarship-portal.onrender.com/api/students/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        await response.text();

        throw new Error(
          "The backend did not return JSON. Please check the backend deployment."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.student) {
        throw new Error(
          "Student details were not returned by the backend."
        );
      }

      if (!data.token) {
        throw new Error(
          "Login response has no token. Please check the backend login response."
        );
      }

      localStorage.setItem("studentToken", data.token);
      localStorage.setItem(
        "student",
        JSON.stringify(data.student)
      );

      navigate("/dashboard");
    } catch (err) {
      setError(true);

      setMessage(
        err instanceof TypeError
          ? "Cannot connect to the backend. Please check your internet connection or backend server."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link to="/" className="auth-brand">
        Scholar<span>Connect</span>
      </Link>

      <div className="auth-layout">
        <section className="auth-welcome">
          <div className="auth-welcome-icon">🎓</div>
          <p className="tagline">WELCOME BACK</p>
          <h1>Your future is worth investing in.</h1>
          <p>
            Sign in to explore scholarships and manage your
            applications in one place.
          </p>
        </section>

        <section className="auth-card">
          <div className="auth-card-icon">👋</div>
          <p className="auth-eyebrow">STUDENT PORTAL</p>
          <h2>Welcome back!</h2>
          <p className="auth-subtitle">
            Enter your registered email and password.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="login-password">
              Password
            </label>

            <div className="auth-password-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="auth-show-password"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {message && (
              <p
                role="alert"
                style={{
                  color: error ? "#c62828" : "#218739",
                  margin: "10px 0",
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
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">
              Create an account
            </Link>
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

export default Login;
