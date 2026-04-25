const mongoose = require("mongoose");
const validator = require("validator");

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },

    membershipId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

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

    photo: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          if (!value) return true;

          return validator.isURL(value) && value.includes("res.cloudinary.com");
        },
        message: "Invalid photo URL. Must be a valid Cloudinary URL",
      },
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
    },

    approvalStatus: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{VALUE} is not a valid approval status",
      },
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
module.exports = StudentProfile;
