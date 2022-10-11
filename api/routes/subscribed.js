// Require Modules
const express = require('express') ;
const router  = express.Router();
const mongoose = require('mongoose');
const { json } = require('body-parser');
const fs = require('fs');

// Require Files
const checkAuth = require('../middleware/check-auth');
const cloudinary = require('../utils/cloudinary');  
const upload = require('../utils/multer');
const subscribed = require('../models/subscribed');

// Require System
function base64Encode(file) {
    var body = fs.readFileSync(file);
    return body.toString("base64");
  }

router.get('/',checkAuth,(req,res,next)=>{
    subscribed.find()
    .select()
    .exec()
    .then(data => {
        if(data){
            const respose ={
                message: 'Data Fetched successfully', 
                count: data.length,
                data: data,
                
            };
            res.status(200).json(respose);
        }else{
            res.status(404).json({message: 'Subcription not found'});
        }
    })
    .catch(err => {
        res.status(500).json(err);
    })
    // res.status(200).json({message: 'Product not found'});
});

router.post('/',checkAuth, (req,res,next)=>{
    const row = new subscribed(
        {
            _id: new mongoose.Types.ObjectId(),
            courseId: req.body.courseId,
            userId: req.body.userId,
            transactionId: req.body.transactionId,
            amount: req.body.amount,
            timeStamp: new Date()
        }
    );
    row.save().then(result=>{
        console.log(result);
        res.status(200).json({
            status: true,
            message: 'Course is Subscribed successfully.',
            createdCourse: result,
                });
    }).catch(error=>{
        console.log(error);
        res.status(500).json(error);
    });
});

router.post('/byid/',checkAuth,(req,res,next)=>{
    const id = req.body.id;
    subscribed.findById(id)
    .exec()
    .then(doc => {
        console.log("Data From Database"+doc);
        if(doc){
            res.status(200).json(doc);
        }else{
            res.status(404).json({message: "Item Not Found"});
        }
    })
    .catch(error => {
            console.log(error);
            res.status(500).json(error);
        });
});


router.post('/uid/',checkAuth,(req,res,next)=>{
    const id = req.body.userId;
    subscribed.find({userId:id})
    .select()
    .exec()
    .then(data => {
        // console.log("Data From Database"+data);
        if(data){
            res.status(200).json({data});
        }else{
            res.status(404).json({message: "Item Not Found"});
        }
    })
    .catch(error => {
            console.log(error);
            res.status(500).json(error);
        });
  });
router.post('/cid/',checkAuth,(req,res,next)=>{
    const id = req.body.courseId;
    subscribed.find({courseId:id})
    .select()
    .exec()
    .then(data => {
        // console.log("Data From Database"+data);
        if(data){
            res.status(200).json({data});
        }else{
            res.status(404).json({message: "Item Not Found"});
        }
    })
    .catch(error => {
            console.log(error);
            res.status(500).json(error);
        });
  });
  
module.exports = router;

