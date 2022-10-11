const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb+srv://scaler:'+process.env.MONGO_ATLAS_PW+'@scaler.zwveofg.mongodb.net/?retryWrites=true&w=majority',{
    useNewUrlParser: true, 
useUnifiedTopology: true
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// API Routes ........................................................
const salesofferRoute = require('./api/routes/subscription');
const usersRoute = require('./api/routes/users');
const subscribeRoute = require('./api/routes/subscribed');

// End API Routes ....................................................
app.use('/course', salesofferRoute);
app.use('/user', usersRoute);
app.use('/subscribe', subscribeRoute);

// No Route Error Handler
app.use((req,res,next) => {
    const error = new Error('Uri Not Found');
    error.status = 404;
    next(error);
});

// Global Route Error Handler
app.use((error,req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,   
        }
    });
    });
module.exports = app;