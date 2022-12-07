const catchAsync = require("../utils/catchAsync");

exports.Aboutus = catchAsync(async (req, res, next) => {
  await res.status(201).json({
    status: "success",
    message:
      "loMollit eu velit fugiat pariatur consequat minim voluptate quis excepteur id adipisicing id nostrud. Ipsum esse esse qui non qui. Consequat ad ea consectetur aliqua minim incididunt cillum occaecat quis reprehenderit laboris in minim. Est proident aliqua eu aliquip sint dolor minim sunt elit non do commodo eiusmod et. Fugiat velit elit quis mollit voluptate irure adipisicing tempor sunt deserunt. Eiusmod anim labore culpa nisi veniam commodo anim fugiat.",
  });
});

exports.privacyPolicy = catchAsync(async (req, res, next) => {
  await res.status(201).json({
    status: "success",
    message:
      "Aliquip voluptate elit in sint. Qui adipisicing aliqua aliquip elit est exercitation cillum nostrud pariatur deserunt. Sit tempor nostrud duis cillum irure aliquip cupidatat enim id laborum.",
  });
});
