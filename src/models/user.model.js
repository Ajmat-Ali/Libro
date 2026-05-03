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
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
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
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
