const Service = require("../Models/serviceModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findOne({ slug: req.params.slug });

  if (!service) {
    return next(new AppError("There is no tour with that name."), 404);
  }

  res.status(200).json({
    status: "success",
    service,
  });
});

exports.homepage = catchAsync(async (req, res, next) => {
  res.status(200).json({
    message: "This will be homepage!",
  });
});
