const Service = require("../Models/serviceModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { toUSVString } = require("util");

exports.getAllServices = catchAsync(async (req, res) => {
  const services = await Service.find();

  res.status(200).json({
    status: "success",
    results: services.length,
    data: {
      services: services,
    },
  });
});

exports.createService = catchAsync(async (req, res, next) => {
  const newService = await Service.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      data: newService,
    },
  });
});

exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  res.status(200).json({
    status: "success",
    results: service.length,
    data: {
      service,
    },
  });
});

exports.editService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(req.params.id, {
    new: true,
    runValidators: true,
  });

  if (!service) {
    return next(new AppError("No service document with that Id"), 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      service,
    },
  });
});

exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) {
    return next(new AppError("No service document with that Id"), 404);
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
