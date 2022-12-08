const express = require("express");
const app = express();
const globalErrorHandler = require("./Controllers/errorController");
const viewRouter = require("./Routes/viewRoutes");
const bookingRouter = require("./Routes/bookingRoutes");
const userRouter = require("./Routes/userRoutes");
const staticRouter = require("./Routes/staticRoutes");
const serviceRouter = require("./Routes/serviceRoutes");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require('cors')

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser());
app.use(cors())
// 1. MIDDLEWARES

// For middleware pathway
app.use((req, res, next) => {
  console.log("Middleware!");
  next();
});

app.use(compression());

// 2) ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/payment", bookingRouter);
app.use("/api/v1/service", serviceRouter);
app.use("/api/v1", staticRouter);
app.use("/", viewRouter);

// Exception Route Handler
app.all("*", (req, res, next) => {
  res.send("This Route is not registered!! ❗");
});

app.use(globalErrorHandler);
module.exports = app;
