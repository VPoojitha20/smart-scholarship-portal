const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// Accept PDF, JPG and PNG files, up to 2 MB each.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only PDF, JPG, and PNG files are allowed."));
  },
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: "Upload failed. Each document must be 2 MB or smaller.",
    });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  college: { type: String, required: true },
  password: { type: String, required: true },
});

const documentSchema = new mongoose.Schema(
  {
    originalName: String,
    contentType: String,
    data: Buffer,
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    scholarshipTitle: { type: String, required: true },
    category: { type: String, default: "" },
    course: { type: String, required: true },
    cgpa: { type: Number, required: true },
    annualFamilyIncome: { type: Number, required: true },
    eligibility: {
      eligible: { type: Boolean, required: true },
      reason: { type: String, default: "" },
      conditions: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    documents: {
      collegeId: documentSchema,
      marksheet: documentSchema,
      incomeCertificate: documentSchema,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Student =
  mongoose.models.Student ||
  mongoose.model("Student", studentSchema);

const Application =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

app.get("/", (req, res) => {
  res.json({ message: "Scholarship Portal Backend is working!" });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend API is working!" });
});

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

function requireStudent(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : "";

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "student") {
      return res.status(403).json({ message: "Student access required." });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Please log in again." });
  }
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7)
    : "";

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    next();
  } catch {
    return res.status(401).json({ message: "Admin login required." });
  }
}

// Student registration
app.post("/api/students/register", async (req, res) => {
  try {
    const { name, email, college, password } = req.body;

    if (!name || !email || !college || !password) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Student.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(409).json({
        message: "Email already registered. Please log in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name: name.trim(),
      email: cleanEmail,
      college: college.trim(),
      password: hashedPassword,
    });

    const token = createToken({
      id: student._id.toString(),
      role: "student",
    });

    res.status(201).json({
      message: "Account created successfully!",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        college: student.college,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed." });
  }
});

// Student login
app.post("/api/students/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Enter your email and password.",
      });
    }

    const student = await Student.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!student || !(await bcrypt.compare(password, student.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken({
      id: student._id.toString(),
      role: "student",
    });

    res.json({
      message: "Login successful!",
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        college: student.college,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed." });
  }
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD ||
    !JWT_SECRET
  ) {
    return res.status(500).json({
      message: "Admin credentials or JWT_SECRET are not configured.",
    });
  }

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.trim().toLowerCase() !==
      process.env.ADMIN_EMAIL.trim().toLowerCase() ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      message: "Invalid admin email or password.",
    });
  }

  const token = createToken({ role: "admin" });

  res.json({
    message: "Admin login successful!",
    token,
    admin: { email: process.env.ADMIN_EMAIL },
  });
});

// Student submits an application with uploaded proof documents.
app.post(
  "/api/applications",
  requireStudent,
  upload.fields([
    { name: "collegeId", maxCount: 1 },
    { name: "marksheet", maxCount: 1 },
    { name: "incomeCertificate", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        scholarshipTitle,
        category,
        course,
        cgpa,
        annualFamilyIncome,
      } = req.body;

      let eligibility;

      try {
        eligibility = JSON.parse(req.body.eligibility || "{}");
      } catch {
        return res.status(400).json({
          message: "Invalid eligibility information.",
        });
      }

      if (
        !scholarshipTitle ||
        !course ||
        cgpa === undefined ||
        annualFamilyIncome === undefined ||
        typeof eligibility.eligible !== "boolean"
      ) {
        return res.status(400).json({
          message: "Please provide all application and eligibility details.",
        });
      }

      const files = req.files || {};

      if (!files.collegeId?.[0] || !files.marksheet?.[0]) {
        return res.status(400).json({
          message: "College ID and latest marksheet are required.",
        });
      }

      const numericCgpa = Number(cgpa);
      const numericIncome = Number(annualFamilyIncome);

      if (
        !Number.isFinite(numericCgpa) ||
        numericCgpa < 0 ||
        numericCgpa > 10 ||
        !Number.isFinite(numericIncome) ||
        numericIncome < 0
      ) {
        return res.status(400).json({
          message: "Enter a valid CGPA (0–10) and family income.",
        });
      }

      function saveDocument(file) {
        if (!file) return undefined;

        return {
          originalName: file.originalname,
          contentType: file.mimetype,
          data: file.buffer,
        };
      }

      const application = await Application.create({
        student: req.user.id,
        scholarshipTitle: String(scholarshipTitle).trim(),
        category: category || "",
        course: String(course).trim(),
        cgpa: numericCgpa,
        annualFamilyIncome: numericIncome,
        eligibility,
        documents: {
          collegeId: saveDocument(files.collegeId[0]),
          marksheet: saveDocument(files.marksheet[0]),
          incomeCertificate: saveDocument(
            files.incomeCertificate?.[0]
          ),
        },
        status: "Pending",
      });

      res.status(201).json({
        message: "Application and documents submitted successfully!",
        application: {
          _id: application._id,
          scholarshipTitle: application.scholarshipTitle,
          status: application.status,
        },
      });
    } catch (error) {
      console.error("Application submission error:", error);
      res.status(500).json({
        message: "Could not submit application.",
      });
    }
  }
);

// Student views their own saved applications.
app.get("/api/applications/my", requireStudent, async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user.id,
    })
      .select("-documents.collegeId.data -documents.marksheet.data -documents.incomeCertificate.data")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error("Fetch student applications error:", error);
    res.status(500).json({ message: "Could not load applications." });
  }
});

// Admin dashboard statistics
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const [totalApplications, pending, approved, rejected, totalStudents] =
      await Promise.all([
        Application.countDocuments(),
        Application.countDocuments({ status: "Pending" }),
        Application.countDocuments({ status: "Approved" }),
        Application.countDocuments({ status: "Rejected" }),
        Student.countDocuments(),
      ]);

    const scholarshipCounts = await Application.aggregate([
      {
        $group: {
          _id: "$scholarshipTitle",
          applicants: { $sum: 1 },
        },
      },
      { $sort: { applicants: -1 } },
    ]);

    res.json({
      totalStudents,
      totalApplications,
      pending,
      approved,
      rejected,
      scholarshipCounts,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Could not load admin statistics." });
  }
});

// Admin views applications and student details.
app.get("/api/admin/applications", requireAdmin, async (req, res) => {
  try {
    const filter = {};

    if (["Pending", "Approved", "Rejected"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.scholarship) {
      filter.scholarshipTitle = req.query.scholarship;
    }

    const applications = await Application.find(filter)
      .select("-documents.collegeId.data -documents.marksheet.data -documents.incomeCertificate.data")
      .populate("student", "name email college")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error("Admin applications error:", error);
    res.status(500).json({ message: "Could not load applications." });
  }
});

// Admin views an uploaded document.
app.get(
  "/api/admin/applications/:id/documents/:documentType",
  requireAdmin,
  async (req, res) => {
    try {
      const allowedDocuments = [
        "collegeId",
        "marksheet",
        "incomeCertificate",
      ];

      const { id, documentType } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid application ID.",
        });
      }

      if (!allowedDocuments.includes(documentType)) {
        return res.status(400).json({
          message: "Invalid document type.",
        });
      }

      const application = await Application.findById(id).select(
        `documents.${documentType}`
      );

      if (!application) {
        return res.status(404).json({
          message: "Application not found.",
        });
      }

      const document = application.documents?.[documentType];

      if (!document?.data || !document.contentType) {
        return res.status(404).json({
          message: "This document has not been uploaded.",
        });
      }

      res.setHeader("Content-Type", document.contentType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${String(document.originalName || "document").replace(/["\\\r\n]/g, "_")}"`
      );
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "no-store");

      res.send(document.data);
    } catch (error) {
      console.error("View document error:", error);
      res.status(500).json({
        message: "Could not open the document.",
      });
    }
  }
);

// Admin approves or rejects an application.
app.patch(
  "/api/admin/applications/:id/status",
  requireAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["Pending", "Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          message: "Status must be Pending, Approved, or Rejected.",
        });
      }

      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      )
        .select("-documents.collegeId.data -documents.marksheet.data -documents.incomeCertificate.data")
        .populate("student", "name email college");

      if (!application) {
        return res.status(404).json({
          message: "Application not found.",
        });
      }

      res.json({
        message: "Application status updated.",
        application,
      });
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({
        message: "Could not update application status.",
      });
    }
  }
);

// Start backend server
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    // Render supplies its own port; locally this uses port 5000.
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
  }
}

startServer();