const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const { promisify } = require('util');

exports.protect = catchAsync(async (req, res, next) => {
  //1. Extract token from header
  let token; //primero se declara la variable pero no se le pone valor

  if (
    req.headers.authorization && //si el front end envia por el header el token, verifica
    req.headers.authorization.startsWith('Bearer') //verifica que comienze con la palabra Bearer
  ) {
    token = req.headers.authorization.split(' ')[1]; // como por el header viene dos palabras, una es Bearer y la otra es el token que quiero obtener, lo separo en el espacio entre los dos y formo un array y tomo el elemento de indice 1 que es el token
  }

  //2. validar si el token existe, pero aqui solo se ve que envian algo como si fuera token pero podrian enviar cualquier cosa y pasaria, por eso el siguiente paso lo valida, despues de este paso, en el paso 3
  if (!token) {
    return next(
      new AppError(
        'You are not logged in!, Please log in to get access, PedroControl',
        401
      )
    );
  }

  //3. decodificar el token jwt
  const decoded = await promisify(jwt.verify)(
    //con promisify() se convierte algo en una promesa
    token,
    process.env.SECRET_JWT_SEED //si no funciona la variable de entorno, entonces importarla arriba, cualquier funcion que recive un callback se puede convertir en promesas.
  );

  //4. buscar el usuario con el id que salio del token que nos enviaron y validar si existe, para mas seguridad
  const user = await User.findOne({
    where: {
      id: decoded.id,
      status: 'active',
    },
  });

  if (!user) {
    return next(
      new AppError('The owner of this token is not longer available', 401)
    );
  }

  //5. validar el tiempo en el que se cambio la contraseña, para saber si el token
  //generado fue generado despues del cambio de contraseña. Esto sucede solo si se ha cambiando la contrasena.
  if (user.passwordChangedAt) {
    //si viene algo, comparamos el tiempo de creacion del token con el tiempo de creacion de la nueva contrasena
    //en passwordChangedAt viene la fecha, para sacar el tiempo hay que hacer lo de abajo
    const changedTimeStamp = parseInt(
      user.passwordChangedAt.getTime() / 1000, //con passwordChangedAt.getTime() se saca el tiempo desde que se cambio la contrasena
      10 //el tiempo que esta en milisegundo se lo pasa a segundos, y se aclara que la divicion es en base 10
    );

    if (decoded.iat < changedTimeStamp) {
      //con decoded.iat se saca el tiempo en que se creo la contrasena, aqui se compara el tiempo
      return next(
        //si el tiempo de creacion de la contrasena es menor que el tiempo de cambio de contrasena, da error
        new AppError('User recently changed password! please login again.', 401)
      );
    }
  }

  //6. Adjuntar el usuario en session
  req.sessionUser = user;
  next();
});

exports.protectAccountOwner = (req, res, next) => {
  //para que otro usuario logiado no pueda cambiar la contrasena de otro usuario
  const { user, sessionUser } = req;

  if (user.id !== sessionUser.id) {
    //compara el id del usuario que se valido en validUser que saco  usando el token y compara con el id que viene en la ruta que es del usuario al que se va a cambiar
    return next(new AppError('You do not own this account.', 401));
  }

  next();
};
/*
exports.restrictTo = (...roles) => {
  //con esta funcion no tenemos que estar haciendo una funcion para cada tipo de roles, sirve para todos.
  return (req, res, next) => {
    if (!roles.includes(req.sessionUser.role)) {
      //si en los roles permitidos no incluye los roles validados del usuario, dr error.
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};
*/
