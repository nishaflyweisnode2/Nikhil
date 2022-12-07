const accountSid = "ACb21a2250e0bae3a0e1c15eddd3c370ed";
const authToken = "2a04b800999f898232197a811f68f90b";
const verifySid = "VA84bc752a91abcf7df9f31c76832bafff";
const client = require("twilio")(accountSid, authToken);
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sendMail = (user, resetToken) => {
  const msg = {
    to: user.companyEmail, // Change to your recipient
    from: "node2@flyweis.technology", // Change to your verified sender
    subject: "Flyweis : Your password Reset Token",
    text: "Enter your password rest token to reset your password (valid for only 10 minutes)",
    html: `Enter your password rest token to reset your password (valid for only 10 minutes)<br></strong>${resetToken}</strong>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.sendOTP = async (req, res) => {
  await client.verify
    .services(verifySid)
    .verifications.create({
      to: `+${req.body.countryCode}${req.body.phoneNumber}`,
      channel: "sms",
    })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.verifyOTP = async (req, res) => {
  await client.verify
    .services(verifySid)
    .verificationChecks.create({
      to: `+${req.body.countryCode}${req.body.phoneNumber}`,
      code: req.body.otp,
    })
    .then((data) => {
      res.status(200).send({
        status: data.status,
      });
      console.log("verified! 👍");
    })
    .catch((err) => {
      res.status(404).send({
        message: "Wrong OTP entered!",
      });
      console("wrong OTP !!");
    });
};

exports.register = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    Name: req.body.Name,
    phoneNumber: req.body.phoneNumber,
    companyName: req.body.companyName,
    companyAddress: req.body.companyAddress,
    companyEmail: req.body.companyEmail,
    password: req.body.Password,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;

  // await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

const sendMessage = () => {
  client.messages
    .create({
      body: "Hello from Node",
      to: "+919318385934",
      from: "+18622821099",
    })
    .then((message) => console.log(message))
    // here you can implement your fallback code
    .catch((error) => console.log(error));
};

exports.login = catchAsync(async (req, res, next) => {
  const { phoneNumber, password } = req.body;

  // 1.) Check if email and password exists
  if (!phoneNumber || !password) {
    return next(new AppError("Please provide Phone Number and password!", 404));
  }

  // 2.) Check if the user exists && password is correct
  const user = await User.findOne({ phoneNumber: phoneNumber }).select(
    "+password"
  );

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Wrong Phone Number or Password!", 401));
  }

  // 3.) If everything ok, send token to client
  createSendToken(user, 200, res);
  // console.log("Login => " + req.cookies, req.cookie);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1.) Getting Token & check if its there!
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please login to get access.")
    );
  }

  // 2. verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists!", 401)
    );
  }

  // 4) Check if user changed password after the token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  // 1.) Getting Token & check if its there!
  let token;
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;
      // 2) verification of Token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // 3. Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 4) check if user changed password after the token was issued.
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you do not have permission for this operation!", 404)
      );
    }
    next();
  };
};

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(
      new AppError("There is no user with this E-mail address!", 404)
    );
  }
  // 2) Check if POSTed current password is correct.
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("The password is incorrect!", 401));
  }

  // 3) If so, Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ companyEmail: req.body.email });
  if (!user) {
    return next(new AppError("there is no user with this email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(user);
  // 3) Send it to user's email
  try {
    // const resetURL = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/v1/users/resetPassword/${resetToken}`;
    sendMail(user, resetToken);

    res.status(200).json({
      status: "success",
      message: "Token send to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the E-mail. Try again Later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token.
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token is not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // DONE IN THE USER MODEL.
  // 4) Log the user in, send JWT.
  createSendToken(user, 200, res);
});
