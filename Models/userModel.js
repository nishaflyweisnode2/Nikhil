const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, "A User must have a name"],
  },

  companyName: {
    type: String,
    required: [true, "Company Name is required!"],
  },

  phoneNumber: {
    type: Number,
    required: [true, "Phone Number is required!"],
    unique: true,
  },

  companyEmail: {
    type: String,
    required: [true, "Company Email is required"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address!"],
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  photo: String,

  companyAddress: {
    type: String,
    required: [true, "Company Address is required!"],
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Hash the password at the cost of 12.
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || !this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
