const express = require("express");
const Router = express.Router();
const serviceController = require("../Controllers/serviceController");
const authController = require("../Controllers/authContollers");

Router.route("/")
  .get(serviceController.getAllServices)
  .post(authController.protect, serviceController.createService);

Router.route("/:id")
  .get(serviceController.getService)
  .patch(authController.protect, serviceController.editService)
  .delete(authController.protect, serviceController.deleteService);

module.exports = Router;
