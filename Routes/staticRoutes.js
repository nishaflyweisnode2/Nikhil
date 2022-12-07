const express = require("express");
const Router = express.Router();
const staticController = require("../Controllers/staticController");

Router.route("/about").get(staticController.Aboutus);
Router.route("/privacy").get(staticController.privacyPolicy);

module.exports = Router;
