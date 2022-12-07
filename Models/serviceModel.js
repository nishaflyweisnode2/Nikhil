const mongoose = require("mongoose");
const slugify = require("slugify");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please include the service name"],
    unique: true,
    trim: true,
  },
  slug: String,
  price: {
    type: Number,
    required: [true, "Please include the service price."],
  },
  summary: {
    type: String,
    trim: true,
    required: [true, "Service must have a summary Field"],
  },
  description: {
    type: String,
    trim: true,
    required: [true, "Please include the description."],
  },
  images: [String],
});

serviceSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
