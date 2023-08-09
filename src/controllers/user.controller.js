const catchAsync = require('../utils/catchAsync');
const User = require('../models/users.model');
const Transfer = require('../models/transfer.model');
const AppError = require('../utils/appError');

exports.findAllTransfers = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const users = await User.findAll({
    where: {
      id: sessionUser.id,
      status: 'active',
    },
  });

  if (!users) {
    return next(
      new AppError(`User with receiverUserId: ${users} not found`, 404)
    );
  }

  const transferAllReceiver = await Transfer.findAll({
    where: {
      receiverUserId: sessionUser.id,
    },
  });

  const transferAllSender = await Transfer.findAll({
    where: {
      senderUserId: sessionUser.id,
    },
  });

  return res.status(200).json({
    status: 'success',
    transferAllReceiver,
    transferAllSender,
  });
});
