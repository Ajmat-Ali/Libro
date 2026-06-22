const mongoose = require("mongoose");
const validator = require("validator");

const librarySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required"],
      unique: true,
    },

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
    },

    logo: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return validator.isURL(value) && value.includes("res.cloudinary.com");
        },
        message: "Invalid logo URL. Must be a valid Cloudinary URL",
      },
    },

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
            return /^[1-9][0-9]{5}$/.test(value);
          },
          message: "Please enter a valid 6 digit Indian pincode",
        },
      },
    },

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
            if (!value) return true;
            return validator.isURL(value);
          },
          message: "Please enter a valid website URL",
        },
      },
    },

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
      },
      closingTimeMinutes: {
        type: Number,
        required: [true, "Closing time in minutes is required"],
        min: [1, "Closing time cannot be zero"],
      },
    },

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

    // -----------  Holidays (Array of Subdocuments) -----------------------
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Library = mongoose.model("Library", librarySchema);
module.exports = Library;
