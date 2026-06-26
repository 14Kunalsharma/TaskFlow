const express = require('express');
const { body } = require('express-validator');
const aiController = require('../controllers/aiController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post(
  '/suggest-estimate',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
  ],
  validate,
  aiController.suggestEstimate
);

module.exports = router;
