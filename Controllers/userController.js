const User = require("../Models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// UTILS FUNCTIONS
const filterObj = (obj, ...allowedFileds) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFileds.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return next(
      new AppError(
        "The user with this ID does not exist!. Please check your ID.",
        500
      )
    );

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  // 2) Filtered Out unwanted fields names that are not allowed to edit
  const filteredBody = filterObj(
    req.body,
    "companyName",
    "Name",
    "companyAddress",
    "companyEmail"
  );

  // 3) update user account
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new AppError("There is no user with that ID"), 404);
  }

  res.status(204).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users: users,
    },
  });
});
