const bcrypt = require('bcrypt-nodejs');
var constant = require('./constant');
var config = require('../config/config');
const client = require('twilio')(config.twilio.sid, config.twilio.auth_token);
const _ = require('lodash');
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: config.cloud.cloud_name,
    api_key: config.cloud.api_key,
    api_secret: config.cloud.api_secret
});

let response = (res, code, msg, result)=>{
    
    return res.json({
        responseCode:code,
        responseMessage:msg,
        result:result
    })
}

let checkKeyExist = (req, arr)=>{
    return new Promise((resolve, reject)=>{
        var array = [];
		_.map(arr, (item) => {
			if(req.hasOwnProperty(item)) {
				var value = req[item];
				if( value == '' || value == undefined ){ 
					array.push(item+" can not be empty");
				}
				resolve(array);
			} else {
				array.push(item+" key is missing");
				resolve(array);
			}
		});
    })
}


let createHash = (password, cb)=>{
    
    bcrypt.hash(password, null, null, (err, hash)=>{
        if(err)
            cb(err)
        else
            cb(null, hash)
    });
}

let compareHash = (password, hash, cb)=>{
    
    bcrypt.compare(password, hash, (err, res)=>{
        if(res)
            cb(null, res)
        else
            cb(err)
    });
}

let sendOTP = (verification_code, countryCode, sendTo)=>{

    client.messages.create({
        to:  countryCode+sendTo,
        from: config.twilio.number,
        body: 'Your one-time password is ' + verification_code,
    })
    .then((message) => {
        console.log("message sent successfully. ",message.sid)
    }, (err) => {
            console.log(err);
    });
}

let imageUploadToCoudinary = (base64, cb)=>{
    if(base64){
        cloudinary.uploader.upload(base64, (result)=>{ 
            if(result)
                cb(null, result.url);
            else
                cb('err'); 
        })
    }
    else
        cb(null, "");
}

module.exports = {

    checkKeyExist,
    response,
    createHash,
    compareHash,
    sendOTP,
    imageUploadToCoudinary
}