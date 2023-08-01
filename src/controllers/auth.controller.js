const catchAsync = require('../utils/catchAsync');
const User = require('./../models/user.model');
const bcrypt = require('bcryptjs');
const generateJWT = require('./../utils/jwt');
const AppError = require('../utils/appError');

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, description } = req.body;

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password: encryptedPassword,
    description,
  });

  const token = await generateJWT(user.id);

  res.status(200).json({
    status: 'success',
    message: 'The user has been created',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      description: user.description,
      profileImgUrl: user.profileImgUrl,
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  //1. traernos la informacion de la req.body
  const { email, password } = req.body;

  //2. buscar el usuario y revisar si existe en la base de datos
  const user = await User.findOne({
    where: {
      email: email.toLowerCase().trim(),
      status: 'active',
    },
  });

  if (!user) {
    //chequea si trago al usuario o no
    return next(new AppError(`User with email: ${email} not found`, 404));
  }
  //3. validar si la contraseña es correcta
  if (!(await bcrypt.compare(password, user.password))) {
    //En la libreria bcrypt viene un metodo para comparar la contrasena encriptada con la contrase;a que esta poniendo ahora, bcrypt.compare()
    return next(new AppError('Incorrect email or password', 401));
  }

  //4. generar el token
  const token = await generateJWT(user.id);

  res.status(200).json({
    status: 'success',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      description: user.description,
      profileImgUrl: user.profileImgUrl,
    },
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. traerme el usuario que viene de la req, del midleware
  const { user } = req;

  //2. traerme los datos de la req.body
  const { currentPassword, newPassword } = req.body;

  //3. validar si la contraseña actual y la nueva son iguales enviar un error
  if (currentPassword === newPassword) {
    return next(new AppError('The password cannot be equals', 400));
  }

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
  });
});
