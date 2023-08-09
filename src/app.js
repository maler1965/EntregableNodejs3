const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const AppError = require('./utils/appError');

const globalErrorHander = require('./controllers/error.controller');

const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const transfersRouter = require('./routes/transfer.route');

const app = express();

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transfers', transfersRouter);

app.all('*', (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
  );
});

app.use(globalErrorHander);

module.exports = app;
