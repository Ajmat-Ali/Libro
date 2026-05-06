const mongoose = require("mongoose");
const validator = require("validator");

const librarySchema = new mongoose.Schema(
  {
    // ─── Owner Reference ──────────────────────────────────────────────────────
    // Which owner this library belongs to
    // unique: true → one owner = one library
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required"],
      unique: true,
    },

    // ─── Basic Information ────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Library name is required"],
      trim: true,
      minLength: [3, "Library name must be at least 3 characters"],
      maxLength: [100, "Library name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxLength: [500, "Description cannot exceed 500 characters"],
      default: null,
      // Optional — shown on student registration page
      // e.g. "Best library in Patna — open since 2010"
    },

    logo: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          // Only validate if logo exists (optional field)
          if (!value) return true;
          return validator.isURL(value) && value.includes("res.cloudinary.com");
        },
        message: "Invalid logo URL. Must be a valid Cloudinary URL",
      },
      // Format validation → handled in Multer middleware
      // Allowed formats → JPG, PNG only | Max size → 2MB
    },

    // ─── Address (Nested Object) ──────────────────────────────────────────────
    // Stored as structured object — not plain string
    // Reason → city/state needed separately in reports
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
        maxLength: [200, "Street cannot exceed 200 characters"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        maxLength: [50, "City cannot exceed 50 characters"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
        maxLength: [50, "State cannot exceed 50 characters"],
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
        validate: {
          validator: function (value) {
            // Indian pincode → exactly 6 digits, cannot start with 0
            return /^[1-9][0-9]{5}$/.test(value);
          },
          message: "Please enter a valid 6 digit Indian pincode",
        },
      },
    },

    // ─── Contact Information (Nested Object) ─────────────────────────────────
    contact: {
      phone: {
        type: String,
        required: [true, "Contact phone is required"],
        trim: true,
        validate: {
          validator: function (value) {
            return validator.isMobilePhone(value, "en-IN");
          },
          message: "Please enter a valid Indian mobile number",
        },
      },
      email: {
        type: String,
        required: [true, "Contact email is required"],
        trim: true,
        lowercase: true,
        validate: {
          validator: validator.isEmail,
          message: "Please enter a valid email address",
        },
      },
      website: {
        type: String,
        trim: true,
        default: null,
        validate: {
          validator: function (value) {
            // Only validate if website provided (optional)
            if (!value) return true;
            return validator.isURL(value);
          },
          message: "Please enter a valid website URL",
        },
      },
    },

    // ─── Timings (Nested Object) ──────────────────────────────────────────────
    // openingTime/closingTime → HH:MM string (for display)
    // openingTimeMinutes/closingTimeMinutes → for slot validation
    //
    // WHY store both?
    // → Display → use HH:MM string directly ✅
    // → Slot validation → use minutes for comparison ✅
    // → Avoid converting on every request ✅
    //
    // Controller calculates minutes before saving:
    // "06:00" → 6 × 60 = 360 minutes
    // "05:00" next day → 300 + 1440 = 1740 minutes
    timings: {
      openingTime: {
        type: String,
        required: [true, "Opening time is required"],
        validate: {
          validator: function (value) {
            // Must be HH:MM 24hr format
            return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
          },
          message: "Opening time must be in HH:MM format (e.g. 06:00)",
        },
      },
      closingTime: {
        type: String,
        required: [true, "Closing time is required"],
        validate: {
          validator: function (value) {
            return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
          },
          message: "Closing time must be in HH:MM format (e.g. 22:00)",
        },
      },
      openingTimeMinutes: {
        type: Number,
        required: [true, "Opening time in minutes is required"],
        min: [0, "Opening time cannot be negative"],
        max: [1439, "Opening time cannot exceed 23:59"],
        // Auto calculated in controller — never entered manually
        // e.g. "06:00" → 6 × 60 = 360
      },
      closingTimeMinutes: {
        type: Number,
        required: [true, "Closing time in minutes is required"],
        min: [1, "Closing time cannot be zero"],
        // No max → closing time can cross midnight
        // e.g. "05:00" next day → 300 + 1440 = 1740
        // Controller calculates this automatically
      },
    },

    // ─── Working Days (Array of Strings) ─────────────────────────────────────
    // Only store days that are OPEN
    // Missing day = closed that day
    // e.g. Sunday missing = Sunday closed
    workingDays: {
      type: [String],
      enum: {
        values: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        message: "{VALUE} is not a valid day",
      },
      default: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      validate: {
        validator: function (value) {
          // Library must be open at least 1 day
          return value.length > 0;
        },
        message: "Library must be open on at least 1 day",
      },
    },

    // ─── Holidays (Array of Subdocuments) ────────────────────────────────────
    // Specific one-time dates when library is closed
    // Different from workingDays:
    // workingDays → repeats every week
    // holidays    → specific one-time dates only
    holidays: [
      {
        date: {
          type: Date,
          required: [true, "Holiday date is required"],
        },
        reason: {
          type: String,
          required: [true, "Holiday reason is required"],
          trim: true,
          maxLength: [100, "Reason cannot exceed 100 characters"],
        },
      },
    ],

    // ─── Hourly Rates Per Seat Type ───────────────────────────────────────────
    // Owner sets price per hour for each seat type
    // System uses these rates to AUTO CREATE plans when:
    // → New time slot is created
    // → New seat type is added
    // → Owner updates any rate
    //
    // Formula → calculatedPrice = hourlyRate × (slotDurationMinutes / 60)
    // e.g. General(₹20) + 6hr slot → 20 × 6 = ₹120/month
    //
    // When rate updated:
    // → All plans for that seat type recalculated ✅
    // → Existing bookings untouched ✅ (price snapshot on booking)
    // → New bookings use new price ✅
    hourlyRates: {
      general: {
        type: Number,
        default: 0,
        min: [0, "Hourly rate cannot be negative"],
      },
      vip: {
        type: Number,
        default: 0,
        min: [0, "Hourly rate cannot be negative"],
      },
      window: {
        type: Number,
        default: 0,
        min: [0, "Hourly rate cannot be negative"],
      },
      cabin: {
        type: Number,
        default: 0,
        min: [0, "Hourly rate cannot be negative"],
      },
    },

    // ─── Library Status ───────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
      // false → library temporarily shut down
      // All bookings/logins blocked when false
    },
  },
  { timestamps: true },
);

const Library = mongoose.model("Library", librarySchema);
module.exports = Library;
