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
  const maxNumber = Math.pow(10, n - 1) * 9; // El máximo número posible de n dígitos sin ceros al inicio
  const randomNumber =
    Math.floor(Math.random() * maxNumber) + Math.pow(10, n - 1); // Generar el número aleatorio
  return randomNumber;
}

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, password, amount } = req.body;

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.toLowerCase().trim(),
    accountNumber: generateRandomNumber(7), //escogo la cantidad de digitos que quiero que tenga el numero de cuenta
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
  //1. traernos la informacion de la req.body
  const { accountNumber, password } = req.body;

  //2. buscar el usuario y revisar si existe en la base de datos
  const user = await User.findOne({
    where: {
      accountNumber: accountNumber,
      status: 'active',
    },
  });

  if (!user) {
    //chequea si trago al usuario o no
    return next(
      new AppError(`User with accountNumber: ${accountNumber} not found`, 404)
    );
  }

  //3. validar si la contraseña es correcta
  if (!(await bcrypt.compare(password, user.password))) {
    //En la libreria bcrypt viene un metodo para comparar la contrasena encriptada con la contrase;a que esta poniendo ahora, bcrypt.compare()
    return next(new AppError('Incorrect accountNumber or password', 401));
  }

  //4. generar el token
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

exports.findAllUsers = catchAsync(async (req, res, next) => {
  const { sessionUser } = req; //  user  sessionUser

  const users = await User.findAll({
    where: {
      id: sessionUser.id, //sessionUser
      status: 'active', //id
    },
  });

  if (!users) {
    //chequea si trago al usuario o no
    return next(
      new AppError(`User with receiverUserId: ${users} not found`, 404)
    );
  }

  const usersAccountNumber = users[0].accountNumber;

  const transferAllReceiver = await Transfer.findAll({
    where: {
      //senderUserId: usersAccountNumber,
      receiverUserId: usersAccountNumber, //id
    },
  });

  const transferAllSender = await Transfer.findAll({
    where: {
      senderUserId: usersAccountNumber,
      //receiverUserId: usersAccountNumber, //id
    },
  });
  /*
   */

  return res.status(200).json({
    status: 'success',
    transferAllReceiver,
    //users: users[0].accountNumber,
    //usersAccountNumber,
    transferAllSender,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. traerme el usuario que viene de la req, del midleware
  //const { user } = req;

  //2. traerme los datos de la req.body
  const { senderUserId, receiverUserId, amount } = req.body;

  console.log({ senderUserId }, 'Pedro');
  //3. validar si la contraseña actual y la nueva son iguales enviar un error
  if (senderUserId === receiverUserId) {
    return next(new AppError('The accountNumber cannot be equals', 400));
  }

  //2. buscar el usuario y revisar si existe en la base de datos, si existe lo trae con todos los datos
  const userSender = await User.findOne({
    where: {
      accountNumber: senderUserId,
      status: 'active',
    },
  });

  if (!userSender) {
    //chequea si trago al usuario o no
    return next(
      new AppError(`User with senderUserId: ${senderUserId} not found`, 404)
    );
  }

  //2. buscar el usuario y revisar si existe en la base de datos
  const userReceiver = await User.findOne({
    where: {
      accountNumber: receiverUserId,
      status: 'active',
    },
  });

  if (!userReceiver) {
    //chequea si trago al usuario o no
    return next(
      new AppError(`User with receiverUserId: ${receiverUserId} not found`, 404)
    );
  }

  //     const checkAmountReceiver =
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

  //6. actualizar el usuario que viene de la req
  await userSender.update({
    amount: newAmountUserSender,
  });

  const newAmountUserReceiver = userReceiver.amount + amount;

  //6. actualizar el usuario que viene de la req
  await userReceiver.update({
    amount: newAmountUserReceiver,
  });

  console.log({ userReceiver }, 'Pedro 2');
  //senderUserId, receiverUserId, amount
  /*
   error: null value in column "id" of relation "usersTransfers" violates not-null constraint
  */
  const userTransfer = await Transfer.create({
    senderUserId: senderUserId,
    receiverUserId: receiverUserId,
    amount: amount,
  });

  console.log({ userTransfer }, 'Pedro 3');
  //7. enviar el mensaje al cliente
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
    /**/
    Transfers: {
      id: userTransfer.id,
      userSender: userTransfer.senderUserId,
      userReceiverr: userTransfer.receiverUserId,
      amount: userTransfer.amount,
    },
  });

  /*


  //4. validar si la contraseña actual es igual a la contraseña en bd, que esta en la base de datos.
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }

  //5. encriptar la nueva contraseña
  const salt = await bcrypt.genSalt(12); //es cuantas veces se encripta
  const encryptedPassword = await bcrypt.hash(newPassword, salt);

  //6. actualizar el usuario que viene de la req
  await user.update({
    password: encryptedPassword,
    passwordChangedAt: new Date(), //se cambio la fecha en que se guardo la contrasena
  });

  //7. enviar el mensaje al cliente
  return res.status(200).json({
    status: 'success',
    message: 'The user password was updated successfully',
  });*/
});
