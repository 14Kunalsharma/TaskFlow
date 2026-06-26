const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const verifyBoardOwnership = async (boardId, userId) => {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
  });
  if (!board) {
    throw new ApiError(404, 'Board not found');
  }
  return board;
};

exports.createTask = asyncHandler(async (req, res) => {
  await verifyBoardOwnership(req.params.boardId, req.user.id);

  const { title, description, status, priority, dueDate, estimatedEffort } =
    req.body;

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'med',
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedEffort: estimatedEffort || null,
      boardId: req.params.boardId,
      ownerId: req.user.id,
    },
  });

  res.status(201).json({ success: true, data: { task } });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const { title, description, status, priority, dueDate, estimatedEffort } =
    req.body;

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && {
        dueDate: dueDate ? new Date(dueDate) : null,
      }),
      ...(estimatedEffort !== undefined && { estimatedEffort }),
    },
  });

  res.json({ success: true, data: { task: updated } });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  await prisma.task.delete({ where: { id: task.id } });

  res.json({ success: true, data: { message: 'Task deleted' } });
});
