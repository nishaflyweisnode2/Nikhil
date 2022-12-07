const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Service = require("../Models/serviceModel");
const Booking = require("../Models/bookingModel");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// console.log(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1. Get the currently Booked service
  const service = await Service.findById(req.params.serviceID);

  // 2. Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],

    success_url: `${req.protocol}://${req.get("host")}/?service=${
      req.params.serviceID
    }&user=${req.user.id}&price=${service.price}`,

    cancel_url: `${req.protocol}://${req.get("host")}/service/${service.slug}`,
    customer_email: req.user.companyEmail,
    client_reference_id: req.params.serviceID,

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${service.name}`,
          },
          unit_amount: `${service.price}`,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });
  // 3. Create Session as response
  // res.redirect(303,session.url);
  res.status(200).json({
    status: "success",
    session: session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //// ------------UNSECURE-------------
  const { service, user, price } = req.query;

  if (!service && !user && !price) return next();

  await Booking.create({
    service,
    user,
    price,
  });

  res.redirect(req.originalUrl.split("?")[0]);
});

//// -------RAZORPAY---------

// const instance = new razorpay({
//   key_id: "rzp_test_KeTUFQFwdPj4Gh",
//   key_secret: "Es03SvRO1CFmIHlMpVpFHGSX",
// });

// exports.createOrder = async (req, res) => {
//   const options = {
//     amount: req.body.amount,
//     currency: req.body.currency,
//     receipt: shortid.generate(),
//     payment_capture: 1,
//   };
//   try {
//     const response = await instance.orders.create(options);
//     res.status(200).json({
//       messsage: "order Created!",
//       orderId: response.id,
//       currency: response.currency,
//       amount: response.amount,
//       receipt: response.receipt,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       msg: "something went wrong!",
//       msg2: "unable to create order!",
//     });
//   }
// };

// exports.verification = (req, res) => {
//   const secret = "razorpaysecret";
//   console.log(req.body);

//   const shasum = crypto.createHmac("sha256", secret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");

//   console.log(digest, req.headers["x-razorpay-signature"]);

//   if (digest === req.headers["x-razorpay-signature"]) {
//     console.log("request is legit");
//     res.status(200).json({
//       message: "OK",
//     });
//   } else {
//     res.status(403).json({
//       message: "Invalid",
//     });
//   }
// };
