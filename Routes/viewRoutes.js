const express = require("express");
const viewController = require("../Controllers/viewController");
const bookingController = require("../Controllers/bookingController");
const Router = express.Router();

Router.route("/").get(
  bookingController.createBookingCheckout,
  viewController.homepage
);

Router.route("/service/:slug").get(viewController.getService);

module.exports = Router;
