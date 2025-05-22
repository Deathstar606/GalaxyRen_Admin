var express = require('express');
var path = require('path');
var logger = require('morgan');
var passport = require('passport');
var bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const connectToDatabase = require('./utils/db');
const mongoose = require('mongoose');

// Optional but recommended
mongoose.set('useCreateIndex', true);
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false); // 💡 prevent buffering when disconnected

var index = require('./routes/index');
var users = require('./routes/users');
var services = require('./routes/serviceRouter');
var tools = require('./routes/toolsRouter');
var rents = require('./routes/rentRouter');
var contact = require('./routes/contactRouter');
var mailRouter = require('./routes/mailRouter');

const allowedOrigins = [
  'https://deathstar606.github.io',
  'http://localhost:3000',
  undefined,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || origin === "null") {
      callback(null, true);
    } else {
      console.log("the Origin Denied: ", origin)
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 
};

var app = express();
app.use(cors(corsOptions));

/* app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + 3443 + req.url);
  }
}); */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

// ✅ Ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Error connecting to DB:', err);
    res.status(500).json({ error: 'Database connection error' });
  }
});

app.use('/', index);
app.use('/users', users);
//app.use('/reservation', reservations);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/services', services);
app.use('/tools', tools);
app.use('/rents', rents);
app.use('/contact', contact);
app.use('/mail', mailRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500);
    res.render('error', {
        title: 'Error', // Ensure 'title' is defined
        message: err.message,
        error: err
    });
});

const http = require('http');
const server = http.createServer(app);
server.setTimeout(10000); // 10 seconds
server.listen(process.env.PORT || 9000, () => {
  console.log('Server listening on port', process.env.PORT || 9000);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;