const express = require('express');
const { body } = require('express-validator');
const boardController = require('../controllers/boardController');
const taskController = require('../controllers/taskController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', boardController.listBoards);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
  ],
  validate,
  boardController.createBoard
);

router.get('/:id', boardController.getBoard);

router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().isString(),
  ],
  validate,
  boardController.updateBoard
);

router.delete('/:id', boardController.deleteBoard);

router.post(
  '/:boardId/tasks',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('status')
      .optional()
      .isIn(['todo', 'in_progress', 'done'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'med', 'high'])
      .withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
    body('estimatedEffort').optional().isString(),
  ],
  validate,
  taskController.createTask
);

module.exports = router;
