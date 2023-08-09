const catchAsync = require('../utils/catchAsync');
const User = require('../models/users.model');
const Transfer = require('../models/transfer.model');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/jwt');
const AppError = require('../utils/appError');

exports.updateTransfer = catchAsync(async (req, res, next) => {
  const { senderAccountNumber, receiverAccountNumber, amount } = req.body;

  if (senderAccountNumber === receiverAccountNumber) {
    return next(new AppError('The accountNumber cannot be equals', 400));
  }

  const userSender = await User.findOne({
    where: {
      accountNumber: senderAccountNumber,
      status: 'active',
    },
  });

  if (!userSender) {
    return next(
      new AppError(
        `User with senderAccountNumber: ${senderAccountNumber} not found`,
        404
      )
    );
  }

  const userReceiver = await User.findOne({
    where: {
      accountNumber: receiverAccountNumber,
      status: 'active',
    },
  });

  if (!userReceiver) {
    return next(
      new AppError(
        `User with receiverAccountNumber: ${receiverAccountNumber} not found`,
        404
      )
    );
  }

  const amountUserSender = userSender.amount;

  if (amount > amountUserSender) {
    return next(
      new AppError(
        `the amount, ${amount}, you want to send is greater than your balance`,
        404
      )
    );
  }

  const newAmountUserSender = userSender.amount - amount;

  await userSender.update({
    amount: newAmountUserSender,
  });

  const newAmountUserReceiver = userReceiver.amount + amount;

  await userReceiver.update({
    amount: newAmountUserReceiver,
  });

  const userTransfer = await Transfer.create({
    senderUserId: userSender.id,
    receiverUserId: userReceiver.id,
    amount: amount,
  });

  return res.status(200).json({
    status: 'success',
    message: 'The transfer was successful',
    userReceiver: {
      id: userReceiver.id,
      name: userReceiver.name,
      accountNumber: userReceiver.accountNumber,
    },
    userSender: {
      id: userSender.id,
      name: userSender.name,
      accountNumber: userSender.accountNumber,
      currentAmount: userSender.amount,
    },

    Transfers: {
      id: userTransfer.id,
      senderUserId: userTransfer.senderUserId,
      senderAccountNumber: userSender.accountNumber,
      receiverUserId: userTransfer.receiverUserId,
      receiverAccountNumber: userReceiver.accountNumber,
      amount: userTransfer.amount,
    },
  });
});
