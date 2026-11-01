
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://smart-scholarship-portal.onrender.com";

const colors = {
  page: "#F5F6FC",
  purple: "#6D4AFF",
  text: "#20243A",
  muted: "#737B91",
  border: "#E8EAF2",
  white: "#FFFFFF",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    scholarshipCounts: [],
  });
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");

  const loadData = useCallback(async () => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin-login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsResponse, appsResponse] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers }),
        fetch(`${API}/api/admin/applications`, { headers }),
      ]);

      const statsData = await statsResponse.json();
      const appsData = await appsResponse.json();

      if (
        statsResponse.status === 401 ||
        statsResponse.status === 403 ||
        appsResponse.status === 401 ||
        appsResponse.status === 403
      ) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        navigate("/admin-login");
        return;
      }

      if (!statsResponse.ok) {
        throw new Error(statsData.message || "Could not load statistics.");
      }

      if (!appsResponse.ok) {
        throw new Error(appsData.message || "Could not load applications.");
      }

      setStats(statsData);
      setApplications(appsData.applications || []);
    } catch (err) {
      setError(err.message || "Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function changeStatus(id, status) {
    const token = localStorage.getItem("adminToken");
    setUpdating(id);
    setError("");

    try {
      const response = await fetch(
        `${API}/api/admin/applications/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update status.");
      }

      await loadData();
    } catch (err) {
      setError(err.message || "Status update failed.");
    } finally {
      setUpdating("");
    }
  }

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    navigate("/admin-login");
  }

  const visibleApplications = applications.filter((app) => {
    const matchesStatus =
      statusFilter === "All" || app.status === statusFilter;

    const student = app.student || {};
    const searchText = [
      student.name,
      student.email,
      student.college,
      app.scholarshipTitle,
    ]
      .join(" ")
      .toLowerCase();

    return matchesStatus && searchText.includes(search.toLowerCase());
  });

  const cards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: "👥",
      color: "#6D4AFF",
    },
    {
      label: "Applications",
      value: stats.totalApplications,
      icon: "📄",
      color: "#1689E8",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      icon: "⏳",
      color: "#D99013",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: "✅",
      color: "#169B70",
    },
  ];

  const pageStyle = {
    minHeight: "100vh",
    background: colors.page,
    color: colors.text,
    fontFamily: "Inter, Arial, sans-serif",
  };

  return (
    <div style={pageStyle}>
      <header
        style={{
          background: colors.white,
          borderBottom: `1px solid ${colors.border}`,
          padding: "18px 5%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: colors.purple,
              color: "white",
              padding: 12,
              borderRadius: 14,
              fontSize: 24,
            }}
          >
            🎓
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>ScholarConnect</h2>
            <span style={{ color: colors.muted, fontSize: 13 }}>
              Administration Portal
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={loadData} style={secondaryButton}>
            ↻ Refresh
          </button>
          <button onClick={logout} style={logoutButton}>
            Logout ↗
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: "auto", padding: "32px 5%" }}>
        <div
          style={{
            background:
              "linear-gradient(120deg, #5434D7 0%, #8565FF 65%, #A58BFF 100%)",
            borderRadius: 22,
            padding: "30px 28px",
            color: "white",
            marginBottom: 28,
            boxShadow: "0 12px 30px #6D4AFF20",
          }}
        >
          <p style={{ margin: "0 0 10px", opacity: 0.85 }}>
            SCHOLARSHIP MANAGEMENT
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(26px, 4vw, 36px)" }}>
            Welcome, Administrator! 👋
          </h1>
          <p style={{ margin: 0, lineHeight: 1.7, maxWidth: 680 }}>
            Review student applications, verify eligibility, and manage
            scholarship decisions from one place.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: "#FFF0F0",
              color: "#B42318",
              padding: 15,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 18,
            marginBottom: 30,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.label}
              style={{
                background: colors.white,
                border: `1px solid ${colors.border}`,
                borderRadius: 18,
                padding: 22,
                boxShadow: "0 5px 18px #20243A08",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: colors.muted, fontSize: 14 }}>
                  {card.label}
                </span>
                <span
                  style={{
                    background: `${card.color}18`,
                    padding: 10,
                    borderRadius: 12,
                    fontSize: 22,
                  }}
                >
                  {card.icon}
                </span>
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: card.color,
                  marginTop: 16,
                }}
              >
                {loading ? "…" : card.value}
              </div>
            </div>
          ))}
        </div>

        <section
          style={{
            background: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: 18,
            padding: 22,
            marginBottom: 28,
          }}
        >
          <h2 style={{ marginTop: 0 }}>📊 Scholarship Overview</h2>
          {stats.scholarshipCounts?.length ? (
            <div style={{ display: "grid", gap: 16 }}>
              {stats.scholarshipCounts.map((item) => {
                const maximum = Math.max(
                  ...stats.scholarshipCounts.map((x) => x.applicants),
                  1
                );

                return (
                  <div key={item._id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 7,
                        fontSize: 14,
                      }}
                    >
                      <span>{item._id}</span>
                      <strong>{item.applicants} applicants</strong>
                    </div>
                    <div
                      style={{
                        height: 9,
                        borderRadius: 20,
                        background: "#EEEAFD",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(item.applicants / maximum) * 100}%`,
                          height: "100%",
                          borderRadius: 20,
                          background: colors.purple,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: colors.muted }}>
              No scholarship applications have been submitted yet.
            </p>
          )}
        </section>

        <section
          style={{
            background: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 22,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 15,
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 6px" }}>Student Applications</h2>
              <p style={{ margin: 0, color: colors.muted, fontSize: 14 }}>
                Review applicant details and update application status.
              </p>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or scholarship..."
              style={{
                ...inputStyle,
                width: "min(100%, 300px)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ padding: "0 22px 20px" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["All", "Pending", "Approved", "Rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    ...filterButton,
                    background:
                      statusFilter === status ? colors.purple : "#F2F3F8",
                    color: statusFilter === status ? "white" : colors.muted,
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ padding: 25 }}>Loading applications...</p>
          ) : visibleApplications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "45px 20px" }}>
              <div style={{ fontSize: 42 }}>📭</div>
              <h3>No applications found</h3>
              <p style={{ color: colors.muted }}>
                Applications submitted and saved by students will appear here.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 1050,
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: "#F8F8FC", textAlign: "left" }}>
                    {[
                      "STUDENT",
                      "SCHOLARSHIP",
                      "COURSE",
                      "CGPA",
                      "FAMILY INCOME",
                      "ELIGIBILITY",
                      "STATUS",
                      "ACTION",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: 15,
                          color: colors.muted,
                          borderBottom: `1px solid ${colors.border}`,
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleApplications.map((app) => (
                    <tr key={app._id}>
                      <td style={cellStyle}>
                        <strong>{app.student?.name || "Unknown student"}</strong>
                        <div style={{ color: colors.muted, marginTop: 5 }}>
                          {app.student?.email || "No email"}
                        </div>
                        <div style={{ color: colors.muted, marginTop: 3 }}>
                          {app.student?.college || "No college"}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <strong>{app.scholarshipTitle}</strong>
                        <div style={{ color: colors.muted, marginTop: 5 }}>
                          {app.category}
                        </div>
                      </td>
                      <td style={cellStyle}>{app.course}</td>
                      <td style={cellStyle}>{app.cgpa}/10</td>
                      <td style={cellStyle}>
                        ₹{Number(app.annualFamilyIncome).toLocaleString("en-IN")}
                      </td>
                      <td style={cellStyle}>
                        <span
                          style={{
                            color: app.eligibility?.eligible
                              ? "#12805C"
                              : "#B42318",
                            fontWeight: 700,
                          }}
                        >
                          {app.eligibility?.eligible
                            ? "Eligible"
                            : "Not eligible"}
                        </span>
                        <div style={{ color: colors.muted, marginTop: 5 }}>
                          {app.eligibility?.reason || ""}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <span style={statusStyle(app.status)}>
                          {app.status}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            disabled={
                              updating === app._id || app.status === "Approved"
                            }
                            onClick={() => changeStatus(app._id, "Approved")}
                            style={approveButton}
                          >
                            Approve
                          </button>
                          <button
                            disabled={
                              updating === app._id || app.status === "Rejected"
                            }
                            onClick={() => changeStatus(app._id, "Rejected")}
                            style={rejectButton}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p
          style={{
            textAlign: "center",
            color: colors.muted,
            padding: "25px 0 10px",
            fontSize: 13,
          }}
        >
          © ScholarConnect · Scholarship Administration System
        </p>
      </main>
    </div>
  );
}

const secondaryButton = {
  border: "1px solid #E1E3ED",
  background: "white",
  borderRadius: 10,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 600,
};

const logoutButton = {
  border: "none",
  background: "#FFF0F0",
  color: "#B42318",
  borderRadius: 10,
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: 600,
};

const filterButton = {
  border: "none",
  borderRadius: 20,
  padding: "9px 16px",
  cursor: "pointer",
  fontWeight: 600,
};

const inputStyle = {
  padding: "12px 14px",
  border: "1px solid #E1E3ED",
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
};

const cellStyle = {
  padding: 15,
  borderBottom: "1px solid #ECEEF5",
  verticalAlign: "top",
};

const approveButton = {
  border: "none",
  borderRadius: 7,
  padding: "8px 10px",
  background: "#E6F7EF",
  color: "#12805C",
  cursor: "pointer",
  fontWeight: 600,
};

const rejectButton = {
  border: "none",
  borderRadius: 7,
  padding: "8px 10px",
  background: "#FFF0F0",
  color: "#B42318",
  cursor: "pointer",
  fontWeight: 600,
};

function statusStyle(status) {
  const styles = {
    Pending: { background: "#FFF4D6", color: "#946200" },
    Approved: { background: "#E2F7ED", color: "#12805C" },
    Rejected: { background: "#FFE8E8", color: "#B42318" },
  };

  return {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 12,
    ...(styles[status] || styles.Pending),
  };
}

export default AdminDashboard;
