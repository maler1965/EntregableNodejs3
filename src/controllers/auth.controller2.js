const catchAsync = require('../utils/catchAsync');
const User = require('./../models/users.model');
const Transfer = require('./../models/transfer.model');
const bcrypt = require('bcryptjs');
const generateJWT = require('./../utils/jwt');
const AppError = require('../utils/appError');

const checkAmount = (amount) => {
  if (parseFloat(amount) < 1000) {
    throw new Error(
      'The initial amount must be equal to or greater than $1000'
    );
  }
  return amount;
};

function generateRandomNumber(n) {
  const maxNumber = Math.pow(10, n - 1) * 9;
  const randomNumber =
    Math.floor(Math.random() * maxNumber) + Math.pow(10, n - 1);
  return randomNumber;
}

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, password, amount } = req.body;

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.toLowerCase().trim(),
    accountNumber: generateRandomNumber(7),
    password: encryptedPassword,
    amount: checkAmount(amount),
  });

  const token = await generateJWT(user.id);

  res.status(200).json({
    status: 'success',
    message: 'The user has been created',
    token,
    user: {
      id: user.id,
      name: user.name,
      accountNumber: user.accountNumber,
      amount: user.amount,
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { accountNumber, password } = req.body;

  const user = await User.findOne({
    where: {
      accountNumber: accountNumber,
      status: 'active',
    },
  });

  if (!user) {
    return next(
      new AppError(`User with accountNumber: ${accountNumber} not found`, 404)
    );
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect accountNumber or password', 401));
  }

  const token = await generateJWT(user.id);

  res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      accountNumber: user.accountNumber,
      amount: user.amount,
    },
  });
});

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

  const usersAccountNumber = users[0].accountNumber;

  const transferAllReceiver = await Transfer.findAll({
    where: {
      receiverUserId: usersAccountNumber,
    },
  });

  const transferAllSender = await Transfer.findAll({
    where: {
      senderUserId: usersAccountNumber,
    },
  });

  return res.status(200).json({
    status: 'success',
    transferAllReceiver,
    transferAllSender,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { senderUserId, receiverUserId, amount } = req.body;

  if (senderUserId === receiverUserId) {
    return next(new AppError('The accountNumber cannot be equals', 400));
  }

  const userSender = await User.findOne({
    where: {
      accountNumber: senderUserId,
      status: 'active',
    },
  });

  if (!userSender) {
    return next(
      new AppError(`User with senderUserId: ${senderUserId} not found`, 404)
    );
  }

  const userReceiver = await User.findOne({
    where: {
      accountNumber: receiverUserId,
      status: 'active',
    },
  });

  if (!userReceiver) {
    return next(
      new AppError(`User with receiverUserId: ${receiverUserId} not found`, 404)
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
    senderUserId: senderUserId,
    receiverUserId: receiverUserId,
    amount: amount,
  });

  return res.status(200).json({
    status: 'success',
    message: 'The transfer was successful',
    userReceiver: {
      id: userReceiver.id,
      name: userReceiver.name,
      accountNumber: userReceiver.accountNumber,
      amount: userReceiver.amount,
    },
    userSender: {
      id: userSender.id,
      name: userSender.name,
      accountNumber: userSender.accountNumber,
      amount: userSender.amount,
    },

    Transfers: {
      id: userTransfer.id,
      userSender: userTransfer.senderUserId,
      userReceiverr: userTransfer.receiverUserId,
      amount: userTransfer.amount,
    },
  });
});
