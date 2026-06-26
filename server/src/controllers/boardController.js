const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.listBoards = asyncHandler(async (req, res) => {
  const boards = await prisma.board.findMany({
    where: { ownerId: req.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { tasks: true } } },
  });

  res.json({ success: true, data: { boards } });
});

exports.createBoard = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const board = await prisma.board.create({
    data: {
      title,
      description: description || null,
      ownerId: req.user.id,
    },
  });

  res.status(201).json({ success: true, data: { board } });
});

exports.getBoard = asyncHandler(async (req, res) => {
  const board = await prisma.board.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
    include: {
      tasks: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!board) {
    throw new ApiError(404, 'Board not found');
  }

  res.json({ success: true, data: { board } });
});

exports.updateBoard = asyncHandler(async (req, res) => {
  const board = await prisma.board.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!board) {
    throw new ApiError(404, 'Board not found');
  }

  const { title, description } = req.body;
  const updated = await prisma.board.update({
    where: { id: board.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    },
  });

  res.json({ success: true, data: { board: updated } });
});

exports.deleteBoard = asyncHandler(async (req, res) => {
  const board = await prisma.board.findFirst({
    where: { id: req.params.id, ownerId: req.user.id },
  });

  if (!board) {
    throw new ApiError(404, 'Board not found');
  }

  await prisma.board.delete({ where: { id: board.id } });

  res.json({ success: true, data: { message: 'Board deleted' } });
});
