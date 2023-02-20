const { Course } = require("../model/courseModel");
const { User } = require("../model/userModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Moment = require("moment");
const MomentRange = require("moment-range");
const moment = MomentRange.extendMoment(Moment);

exports.index = (req, res) => {
  const fromDate = moment();
  const toDate = moment().add(10, "years");
  const range = moment().range(fromDate, toDate);

  const years = Array.from(range.by("year")).map((m) => m.year());
  const months = moment.monthsShort();

  return res.render("index", { months, years, message: req.flash() });
};

exports.payment = async (req, res) => {
  const token = await createToken(req.body);
  if (token.error) {
    //req.flash("danger", token.error);
    return res.redirect("/");
  }
  if (!token.id) {
    // req.flash("danger", "Payment failed.");
    return res.redirect("/");
  }

  const charge = await createCharge(token.id, 2000);
  if (charge && charge.status == "succeeded") {
    // req.flash("success", "Payment completed.");
    console.log("line36");
  } else {
    // req.flash("danger", "Payment failed.");
    console.log("line38");
  }
  return res.redirect("/");
};

const createToken = async (cardData) => {
  let token = {};
  try {
    token = await stripe.tokens.create({
      card: {
        number: cardData.cardNumber,
        exp_month: cardData.month,
        exp_year: cardData.year,
        cvc: cardData.cvv,
      },
    });
  } catch (error) {
    switch (error.type) {
      case "StripeCardError":
        token.error = error.message;
        break;
      default:
        token.error = error.message;
        break;
    }
  }
  return token;
};

const createCharge = async (tokenId, amount) => {
  let charge = {};
  try {
    charge = await stripe.me.create({
      amount: amount,
      currency: "inr",
      source: tokenId,
      description: "My first payment",
    });
  } catch (error) {
    charge.error = error.message;
  }
  return charge;
};
exports.checkoutSessions = async (req, res, next) => {
  try {
    console.log("line68");
    const course = await Course.findById(req.params.courseId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.name,
            },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/course/${req.params.courseId}`,
      cancel_url: `${process.env.FRONTEND_URL}`,
    });
    res.json({ url: session.url });
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err,
    });
  }
};

exports.createBookingCheckout = async (req, res, next) => {
  //req.user.id = userId.
  //req.params.courseId = courseId

  let b = await User.findById(req.user.id);
  let a = b.courses;
  b.courses = [...a, req.params.courseId];
  let tour = await User.findByIdAndUpdate(req.user.id, b, {
    new: true,
    runValidators: true,
  });

  console.log(tour);
  next();
};
