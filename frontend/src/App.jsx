
import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

const scholarships = [
  { title: "Merit Excellence Award", category: "Merit-Based", icon: "🏆", amount: "₹25,000", eligibility: "Students with strong academic performance", level: "UG / PG", color: "gold" },
  { title: "Student Financial Support", category: "Need-Based", icon: "🤝", amount: "₹20,000", eligibility: "Students needing financial assistance", level: "Undergraduate", color: "blue" },
  { title: "Government Education Aid", category: "Government", icon: "🏛️", amount: "Varies", eligibility: "Eligible students meeting scheme rules", level: "UG / PG", color: "green" },
  { title: "Women in STEM Award", category: "Women in STEM", icon: "👩‍💻", amount: "₹30,000", eligibility: "Women studying science or technology", level: "UG / PG", color: "pink" },
  { title: "Engineering Talent Award", category: "Engineering", icon: "⚙️", amount: "₹15,000", eligibility: "Eligible engineering students", level: "B.Tech / M.Tech", color: "purple" },
  { title: "First-Generation Learner", category: "Need-Based", icon: "📚", amount: "₹18,000", eligibility: "First-generation learners who meet criteria", level: "Undergraduate", color: "orange" },
  { title: "Research Future Fellowship", category: "Research", icon: "🔬", amount: "₹40,000", eligibility: "Students involved in eligible research projects", level: "PG / Research", color: "teal" },
  { title: "Academic Achievement Award", category: "Merit-Based", icon: "🌟", amount: "₹12,000", eligibility: "Students demonstrating academic excellence", level: "UG / PG", color: "gold" },
  { title: "Inclusive Education Support", category: "Special Support", icon: "💙", amount: "Varies", eligibility: "Students meeting applicable support criteria", level: "UG / PG", color: "blue" },
];

const categories = [
  "All",
  "Merit-Based",
  "Need-Based",
  "Government",
  "Women in STEM",
  "Engineering",
  "Research",
  "Special Support",
];

function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const filteredScholarships = scholarships.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.eligibility.toLowerCase().includes(search.toLowerCase());

    return (
      matchesSearch &&
      (category === "All" || item.category === category)
    );
  });

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">
          Scholar<span>Connect</span>
        </Link>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#scholarships">Scholarships</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">Login</Link>
          <Link to="/register" className="register-btn">Get Started</Link>
          <Link to="/dashboard" className="login-btn">Dashboard</Link>
          <Link to="/admin-login" className="login-btn">Admin</Link>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">YOUR FUTURE STARTS HERE</p>
          <h1>
            Your Dreams.<br />
            Your Education.<br />
            <span>Your Scholarship.</span>
          </h1>

          <p className="hero-text">
            Discover financial support for your education. Explore opportunities,
            understand eligibility, and take the next step toward your future.
          </p>

          <div className="hero-buttons">
            <a href="#scholarships" className="primary-btn">
              Explore Scholarships →
            </a>
            <Link to="/register" className="secondary-btn">
              Create Free Account
            </Link>
          </div>

          <div className="hero-stats">
            <div><strong>9+</strong><p>Example Opportunities</p></div>
            <div><strong>8</strong><p>Categories</p></div>
            <div><strong>1</strong><p>Student Portal</p></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-emoji">🎓</div>
          <div className="floating-card">
            <span>✨</span>
            <div>
              <strong>Your future matters</strong>
              <p>Find an opportunity that fits you</p>
            </div>
          </div>
          <div className="hero-circle circle-one"></div>
          <div className="hero-circle circle-two"></div>
        </div>
      </section>

      <section className="scholarships" id="scholarships">
        <div className="section-heading">
          <p className="tagline">EXPLORE YOUR OPTIONS</p>
          <h2>Find Your Perfect Scholarship</h2>
          <p className="section-text">
            Explore opportunities that match your education and goals.
          </p>
        </div>

        <div className="scholarship-tools">
          <div className="search-box">
            <span>🔎</span>
            <input
              type="text"
              placeholder="Search scholarships or eligibility..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search scholarships"
            />
          </div>

          <div className="category-filters">
            {categories.map((item) => (
              <button
                key={item}
                className={`filter-btn ${category === item ? "active" : ""}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="results-count">
          Showing <strong>{filteredScholarships.length}</strong> opportunities
        </div>

        <div className="scholarship-grid">
          {filteredScholarships.map((item) => (
            <article className="scholarship-card" key={item.title}>
              <div className={`card-icon ${item.color}`}>{item.icon}</div>
              <span className="category-label">{item.category}</span>
              <h3>{item.title}</h3>
              <p className="card-description">{item.eligibility}</p>

              <div className="scholarship-meta">
                <div>
                  <span>Example award</span>
                  <strong>{item.amount}</strong>
                </div>
                <div>
                  <span>Education</span>
                  <strong>{item.level}</strong>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="details-btn"
                  onClick={() => setSelected(item)}
                >
                  View Details
                </button>
                <Link to="/register" className="apply-btn">
                  Apply Now →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredScholarships.length === 0 && (
          <div className="empty-results">
            <span>🔍</span>
            <h3>No scholarships found</h3>
            <p>Try another search term or choose a different category.</p>
            <button
              className="details-btn"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        <p className="demo-note">
          Scholarship names and award amounts are illustrative examples.
          Verify official schemes, eligibility, amounts, and deadlines before applying.
        </p>
      </section>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div
            className="scholarship-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close details"
            >
              ×
            </button>

            <div className={`card-icon ${selected.color}`}>
              {selected.icon}
            </div>
            <span className="category-label">{selected.category}</span>
            <h2 id="modal-title">{selected.title}</h2>
            <p>{selected.eligibility}</p>

            <div className="modal-info">
              <p><strong>Example award:</strong> {selected.amount}</p>
              <p><strong>Education level:</strong> {selected.level}</p>
              <p><strong>Deadline:</strong> To be announced</p>
            </div>

            <p className="demo-note">
              This is a demonstration listing. Official details have not yet been verified.
            </p>

            <Link to="/register" className="apply-btn modal-apply">
              Create Account to Continue →
            </Link>
          </div>
        </div>
      )}

      <section className="about" id="about">
        <p className="tagline">SIMPLE. SMART. STUDENT-FRIENDLY.</p>
        <h2>One Portal. More Possibilities.</h2>
        <p>
          ScholarConnect helps students discover scholarship opportunities in one place
          and organize their scholarship journey.
        </p>
        <Link to="/register" className="primary-btn">
          Start Your Journey →
        </Link>
      </section>

      <footer className="footer">
        <h3>Scholar<span>Connect</span></h3>
        <p>Supporting students. Empowering futures.</p>
        <p>© 2026 ScholarConnect. College project demonstration.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin routes added; existing routes preserved */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
