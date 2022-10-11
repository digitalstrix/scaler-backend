const mongoose = require('mongoose');
const salesofferScheme = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        courseName: {
            type: String,
            required: true,
        },
        courseTitle: {
            type: String,
            required: true,
        },
        timeStamp: {
            type: String,
            required: true,
        },
        courseDescription: {
            type: String,
            required: true,
        },
        courseAmount: {
            type: String,
            required: true,
        },
        courseImageImage: {
            type: String,
            required: true,
        }
    }
);
module.exports = mongoose.model('Jobapply', salesofferScheme); 