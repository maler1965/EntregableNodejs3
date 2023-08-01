const AppError = require('../utils/appError');
const User = require('../models/users.model');
const catchAsync = require('../utils/catchAsync');

exports.validUser = catchAsync(async (req, res, next) => {
  //1. traer el id de la req.params, este es el id del usuario
  const { id } = req.params;

  //2. buscar el usuario con status active y el id recibido
  const user = await User.findOne({
    where: {
      id,
      status: 'active',
    },
  });

  //3. valido que si no existe envio el error
  if (!user) {
    return next(new AppError(`User with id: ${id} not found`, 404));
  }
  //4. adjunto el usuario por la req, y le doy paso para que avance con el next
  req.user = user;
  next();
});
