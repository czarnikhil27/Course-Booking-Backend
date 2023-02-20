const { Review } = require("../model/reviewModel");
async function getAllReview(req, res, next) {
  let filter = ''
  if(req.params.tourId) filter= {tour:req.params.tourId}
  const reviews = await Review.find(filter)
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
}

async function createReview(req, res, next) {
  const review = await Review.create(req.body);
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
}
module.exports = { getAllReview, createReview };