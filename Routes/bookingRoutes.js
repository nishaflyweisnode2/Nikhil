const express = require("express");
const Router = express.Router();
const bookingController = require("../Controllers/bookingController");
const authController = require("../Controllers/authContollers");

Router.post(
  "/checkout-session/:serviceID",
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = Router;
