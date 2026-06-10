const Booking = require("../../models/booking.model");
const Floor = require("../../models/floor.model");
const Library = require("../../models/library.model");
const Seat = require("../../models/seat.model");
const TimeSlot = require("../../models/timeSlot.model");
const mongoose = require("mongoose");

const seatGrid = async (req, res) => {
  try {
    const { floorId } = req.params;
    const { slot, date } = req.query;

    // console.log(floorId, slot, date);

    // ------------------ Step 1 Validate Inputs -------------------
    if (!floorId || !slot) {
      return res.status(400).json({
        success: false,
        message: "FloorId and slot are required",
      });
    }

    // validate object id
    if (
      !mongoose.Types.ObjectId.isValid(floorId) ||
      !mongoose.Types.ObjectId.isValid(slot)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid FloorId or slot format",
      });
    }

    // validate date
    let queryDate = new Date();
    if (date) {
      queryDate = new Date(date);
      if (isNaN(queryDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }
    }

    //  Block Past Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (queryDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot view seats for past dates",
      });
    }

    // Verify librray ownership
    const library = await Library.findOne({
      ownerId: req.user._id,
    });

    if (!library) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Library not found or not owned by you",
      });
    }

    const floor = await Floor.findOne({
      _id: floorId,
      libraryId: library._id,
    })
      .lean()
      .select("name number totalSeats description");

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    // Verify time slot exists
    const timeSlot = await TimeSlot.findById(slot).lean();
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    // --------------- STEP 2: Create Date Range ------------------------
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // --------------------- STEP 3: GET ALL SEATS ----------------------
    const allSeats = await Seat.find({
      floorId,
    })
      .select("_id seatLabel seatType status")
      .lean();

    if (allSeats.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          floor: {
            id: floor._id,
            name: floor.name,
            number: floor.number,
          },
          slot: {
            id: timeSlot._id,
            name: timeSlot.name,
            startTime: timeSlot.startTimeDisplay,
            endTime: timeSlot.endTimeDisplay,
          },
          queryDate: queryDate.toISOString().split("T")[0],
          seats: [],
          summary: {
            total: 0,
            available: 0,
            booked: 0,
          },
        },
      });
    }

    const bookedSeat = await Promise.all(
      allSeats.map(async (seat) => {
        try {
          const booking = await Booking.findOne({
            seatId: seat._id,
            timeSlotId: slot,
            status: "active",
            startDate: { $lte: endOfDay },
            endDate: { $gte: startOfDay },
          })
            .populate("studentId", "firstName lastName email phone")
            .populate("timeSlotId", "name startTimeDisplay endTimeDisplay")
            .select(
              "-rejectedBy -rejectedAt -cancelledB -cancelledAt -cancelReason -createdAt -updatedAt -__v",
            );
          return booking;
        } catch (error) {
          console.log(error.message);
        }
      }),
    );

    const filterBookedSeat = {};
    bookedSeat.map((b) => {
      if (b) {
        filterBookedSeat[b.seatId._id.toString()] = b;
      }
    });

    let expiringSoon = 0;

    const result = allSeats.map((seat) => {
      const booked = filterBookedSeat[seat._id.toString()];
      let dayLeft = null;

      if (booked) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const end = new Date(booked.endDate);
        dayLeft = Math.ceil((end - startOfToday) / (1000 * 60 * 60 * 24));
      }

      let gridStatus = "available";

      if (seat.status === "disabled") {
        gridStatus = "disabled";
      } else if (booked) {
        dayLeft <= 7 && expiringSoon++;
        gridStatus = dayLeft <= 7 ? "expiring_soon" : "booked";
      } else if (seat.status === "active" && !booked) {
        gridStatus = "available";
      } else if (seat.status === "reserved") {
        gridStatus = "reserved";
      } else if (seat.status === "maintenance") {
        gridStatus = "maintenance";
      }

      return {
        gridStatus: gridStatus,
        dayLeft,
        seat,
        bookingDetails: booked ? booked : null,
      };
    });

    // --------------------- Make query Date -------------------------
    const year = startOfDay.getFullYear();
    const month = String(startOfDay.getMonth() + 1).padStart(2, "0");
    const day = String(startOfDay.getDate()).padStart(2, "0");
    const queryDateString = `${year}-${month}-${day}`;

    res.status(200).json({
      success: true,
      message: "Grid seat fetched successfully",
      data: {
        queryDate: queryDateString,
        summary: {
          total: result.length,
          available: result.filter((s) => s.gridStatus === "available").length,
          booked: result.filter((s) => s.gridStatus === "booked").length,
          maintenance: result.filter((s) => s.gridStatus === "maintenance")
            .length,
          reserved: result.filter((s) => s.gridStatus === "reserved").length,
          disabled: result.filter((s) => s.gridStatus === "disabled").length,
          expiringSoon,
        },
        floor: floor,
        slot: timeSlot,
        seats: result,
      },
    });
  } catch (error) {
    console.error("Seat grid error:", error);
    return res.status(500).json({
      message: "Failed to fetch seat grid",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = seatGrid;
