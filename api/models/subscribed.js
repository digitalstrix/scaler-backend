const mongoose = require('mongoose');
const course = require('./subcription');
const users = require('./users');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        courseId: {
            type: String,
            required: true,
            ref: course
        },
        userId: {
            type: String,
            required: true,
            ref: users
        },
        timeStamp: {
            type: String,
            required: true,
        },
        amount: {
            type: String,
            required: true,
        },
        transactionId: {
            type: String,
            required: true,
        }
    }
);
module.exports = mongoose.model('Subscribed', salesofferScheme); 