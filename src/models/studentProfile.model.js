const mongoose = require("mongoose");
const validator = require("validator");

const studentProfileSchema = new mongoose.Schema(
  {
    // ─── Link To User Collection ─────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },

    // ─── Membership ID (Human Readable) ──────────────────────────────────────
    // Auto generated when owner approves student
    // Format → LIB-2024-001
    // Generated in controller — not here
    membershipId: {
      type: String,
      unique: true,
      sparse: true, // ← allows multiple null values (before approval)
    },

    // ─── Personal Details ────────────────────────────────────────────────────
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isMobilePhone(value, "en-IN");
        },
        message: "Please enter a valid Indian mobile number",
      },
    },

    address: {
      type: String,
      trim: true,
      maxLength: [200, "Address cannot exceed 200 characters"],
    },

    // ─── File Uploads (Cloudinary URLs) ──────────────────────────────────────
    // Multer → Cloudinary → save URL here
    // Never store actual file in MongoDB — only URL
    photo: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          // Only validate if value exists (field is optional)
          if (!value) return true;

          // Check 1 → must be valid URL
          // Check 2 → must be from Cloudinary only
          return validator.isURL(value) && value.includes("res.cloudinary.com");
        },
        message: "Invalid photo URL. Must be a valid Cloudinary URL",
      },
      // Format validation → handled in Multer middleware
      // Allowed formats → JPG, PNG only | Max size → 2MB
    },

    idProof: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return validator.isURL(value) && value.includes("res.cloudinary.com");
        },
        message: "Invalid ID proof URL. Must be a valid Cloudinary URL",
      },
      // Format validation → handled in Multer middleware
      // Allowed formats → JPG, PNG, PDF only | Max size → 2MB
    },

    // ─── Approval System ─────────────────────────────────────────────────────
    approvalStatus: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{VALUE} is not a valid approval status",
      },
    },

    // ─── Audit Trail (Who Reviewed + When + Why Rejected) ────────────────────
    // reviewedBy covers BOTH approve and reject actions
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // Only filled when approvalStatus = "rejected"
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    // ─── Email Verification (Ready For Future) ───────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
module.exports = StudentProfile;
