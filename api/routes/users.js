const express = require('express') ;
const router  = express.Router();
const User = require('../models/users');
const mongoose = require('mongoose');
const { json } = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const users = require('../models/users');
const nodemail = require('../utils/nodemailer');
const checkAuth = require('../middleware/check-auth');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const fs = require('fs');
function makeid(length){
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

function base64Encode(file) {
  var body = fs.readFileSync(file);
  return body.toString("base64");
}

router.get('/',checkAuth,(req,res,next)=>{
  users.find()
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
          res.status(404).json({message: 'Users not found'});
      }
  })
  .catch(err => {
      res.status(500).json(err);
  })
  // res.status(200).json({message: 'Product not found'});
});


router.post("/signup",(req, res, next) => {
  console.log(req.body);
  console.log(req.body.email);
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length >= 1) {
          return res.status(409).json({
            message: "Mail exists"
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err
              });
            } else {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                name: req.body.name,
                mobile: req.body.mobile,
                userType: req.body.userType,
                password: hash
              });
              user
                .save()
                .then(result => {
                  console.log(result);
                  res.status(201).json({
                    message: "User created",
                    user: result
                  });
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    error: err
                  });
                });
            }
          });
        }
      });
  });

  

//   router.delete("/:userId", (req, res, next) => {
//     User.remove({ _id: req.params.userId })
//       .exec()
//       .then(result => {
//         res.status(200).json({
//           message: "User deleted"
//         });
//       })
//       .catch(err => {
//         console.log(err);
//         res.status(500).json({
//           error: err
//         });
//       });
//   });

  router.post("/login", (req, res, next) => {
    User.find({
      email: req.body.email,
      isActive: true,
      userType: req.body.userType,
     })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                userId: user[0]._id
              },
              process.env.JWT_KEY
            );
            return res.status(200).json({
              message: "Auth successful",
              user: user,
              token: token
            });
          }
          res.status(401).json({
            message: "Auth failed"
          });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

  router.patch('/:id',(req,res,next)=>{
    const id = req.params.id;
    const updateOPs = {};
    for (const ops of req.body){
        updateOPs[ops.propName] = ops.value
    }
    Product.update({_id:id},{$set:updateOPs})
    .exec()
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
});

router.post('/resetToken', (req,res,next)=>{
  users.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(409).json({
          message: "Your Email is not registered with us."
        });
      }else{
        const token = makeid(8) ;
users.update({email:req.body.email},{ 
  resetToken: token,
}).then(result=>{
    let mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: req.body.email,
      subject: 'Shop AD Password Reset',
      text: 'Hi, Your Forgot Token is '+token+' . Please enter this is your app. Don not share with others.'
    };
    nodemail.sendMail(mailOptions, function(err, data) {
      if (err) {
        console.log("Error " + err);
      } else {
        console.log("Email sent successfully");
      }
    });
      console.log(result);
      res.status(200).json({
          status: true,
          message: 'Email sent successfully.',
          update_status: result,
              });
  }).catch(error=>{
      console.log(error);
      res.status(500).json(error);
  });
}});

});

router.post("/setpassword", (req, res, next) => {
  User.find({
    email: req.body.email,
    resetToken: req.body.resetToken,
   })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(409).json({
          message: "Mail Does not exist or Token is invalid"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            users.update({email:req.body.email},{ 
              resetToken: null,
              password: hash
            })
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User Updated",
                  user: result
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post("/update",checkAuth, upload.single('Image'), async (req, res, next) => {
  try {
    var base64String = base64Encode(req.file.path);
    const uploadString = "data:image/jpeg;base64," + base64String;
    const uploadResponse = await cloudinary.uploader.upload(uploadString, {
      overwrite: true,
      invalidate: true,
      crop: "fill",
    });
 var url =  uploadResponse.secure_url;
  } catch (e) {
    console.log(e);
  }
  User.find({ email: req.body.email, _id: req.body.uid})
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(409).json({
          message: "User Not Exist"
        });
      } else {    
        User.update({_id: req.body.uid, email: req.body.email},{
          name: req.body.name,
          mobile: req.body.mobile,
          userType: req.body.userType,
          userProfile: url,
        }).exec()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User Updated",
                  user: result
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
      }
    });
});

router.post('/active',checkAuth, (req,res,next)=>{
  const id = req.body.id;
  User.update({_id:id},{isActive:true})
  .exec()
  .then(data => res.status(200).json({message: "User Activated"}))
  .catch(err => res.status(500).json(err));
});

router.post('/inactive',checkAuth, (req,res,next)=>{
  const id = req.body.id;
  User.update({_id:id},{isActive:false})
  .exec()
  .then(data => res.status(200).json({message: "User Inactivated"}))
  .catch(err => res.status(500).json(err));
});

router.post('/uid/',checkAuth,(req,res,next)=>{
  const id = req.body.id;
  users.find({_id: req.body.id})
  .select()
  .exec()
  .then(data => {
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

