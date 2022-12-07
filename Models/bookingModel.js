const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.ObjectId,
    ref: "Service",
    required: [true, "Booking must belong to a Service!"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a user!"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price!"],
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate("user").populate({
    path: "service",
    select: "name",
  });
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
