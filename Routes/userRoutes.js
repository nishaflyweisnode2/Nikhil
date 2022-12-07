const express = require("express");
const Router = express.Router();
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authContollers");

Router.route("/send-otp").post(authController.sendOTP);
Router.route("/verify-otp").post(authController.verifyOTP);
Router.route("/register").post(authController.register);
Router.route("/login").post(authController.login);
Router.route("/logout").get(authController.logout);
Router.route("/forgotPassword").post(authController.forgotPassword);
Router.route("/resetPassword/:token").patch(authController.resetPassword);

// PROTECT all routes below it.
Router.use(authController.protect);
Router.route("/me").get(userController.getMe, userController.getUser);
Router.route("/:id").get(userController.getUser);
Router.route("/updateMe").patch(userController.updateMe);
Router.route("/deleteMe").delete(userController.deleteMe);
Router.route("/").get(userController.getAllUsers);

module.exports = Router;
