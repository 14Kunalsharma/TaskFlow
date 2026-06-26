const { suggestEstimate } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');

exports.suggestEstimate = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const result = await suggestEstimate(title, description);

  res.json({
    success: true,
    data: result,
  });
});
