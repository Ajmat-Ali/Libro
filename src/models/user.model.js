const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minLength: [2, "First name must be at least 2 characters"],
      maxLength: [20, "First name cannot exceed 20 characters"],
    },

    lastName: {
      type: String,
      trim: true,
      maxLength: [20, "Last name cannot exceed 20 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email address",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      // ⚠️ NO isStrongPassword validator here
      // Reason: Pre-save bcrypt hook converts plain text → hash before saving.
      // If document is saved again later (e.g. updating any other field),
      // Mongoose would run isStrongPassword on the HASH — not original password
      // → completely wrong behavior.
      // ✅ Password strength is validated in validators/ layer instead.
      // That layer runs BEFORE data reaches schema — clean separation.
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          // Only validate if phone is provided (optional field)
          if (!value) return true;
          return validator.isMobilePhone(value, "en-IN");
        },
        message: "Please enter a valid Indian mobile number",
      },
    },

    role: {
      type: String,
      default: "student",
      enum: {
        values: ["owner", "guard", "student"],
        message: "{VALUE} is not a valid role",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    refreshTokens: {
      type: [String],
      default: [],
      // Array → supports multiple devices
      // Logout current → remove one token
      // Logout all → clear entire array
    },

    passwordResetOtp: {
      code: { type: String, default: null },
      expiresAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

// ─── Pre-save hook for bcrypt password hashing ────────────────────────────────
// Written during Auth development (Step 5), NOT here.
// Reason: Schema defines structure only.
// Hashing logic belongs in the auth layer.
// userSchema.pre("save", async function (next) { ... }) ← comes later
// ─────────────────────────────────────────────────────────────────────────────

const User = mongoose.model("User", userSchema);
module.exports = User;
