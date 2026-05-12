# Libro

-- TOday built---

- CRUD Floors --**\*\*\*\***\*\***\*\*\*\***\_**\*\*\*\***\*\***\*\*\*\*** Pushed on githun
- CRUD seats **\*\*\*\***\*\*\*\***\*\*\*\***\_\_\_**\*\*\*\***\*\*\*\***\*\*\*\*** NEED to test APIs on postman

<!-- ------------- syncPlansForLibrary  -->

``

1. check Library exist
   - existingLibrary

2. Find seat types that ACTUALLY EXIST in this library
   Seat.distinct("seatType", { libraryId }); (if length ===0 return)

3. FInd all slots that presents
   Slots.find() (if slots.length===0 return)

4)  run loop over slots and
    - Inner loop on seatType.

    for(let slot of slots){
    const durationHr= timeSlot.durationMinutes / 60

         for(let seatType of existingSeatTypes){

             const rate = existingLibrary.horlyRates[seatType]
             if(!rate || rate===0) continue

             const totalPrice = rate * durationHr

             update await Plan.findOneAndUpdate({
                 libraryId:existingLibrary._id,
                 timeSlotId:slot._id,
                 seatType
             },{
                name:`${seatType} - ${slot.name}`,
                durationType:"monthly",
                calculatedPrice:totalPrice,
                isActive:true
             },{{ upsert: true, new: true }})
         }

    }

``

> 11-05-2026| 8:16PM

Member API

# > 12-05-2026 | Booking

### config

- razorpay

### Controller

- ownerBooking
- studentBooking
- payment (Continue) tomorrow

### utils

- checkOverlap
- generateQR.js

### validator

- booking.validator.js
