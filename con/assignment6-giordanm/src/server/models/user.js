/* Copyright G. Hemingway, @2018 */
"use strict";

let crypto = require("crypto"),
  mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/***************** User Model *******************/

// const makeSalt = () => Math.round(new Date().valueOf() * Math.random()) + "";
//
// const encryptPassword = (salt, password) =>
//   crypto
//     .createHmac("sha512", salt)
//     .update(password)
//     .digest("hex");

let User = new Schema({
    /*** Add details here ***/
    username: {
        type: String,
        required: true,
        unique: true,
        length: {
            min: 3,
            max: 15
        },
        test: /^[a-z0-9]+$/gi
    },
    publicKey: { type: String, required: true },
    nonce: {type: String, require: true},
    hash: { type: String, required: false },
    date_reg: { type: Date, required: false },
    hash_status: { type: String, required: false }
});

User.pre("save", function(next) {
  /*** Add details here ***/
  this.username = this.username.replace(/<(?:.|\n)*?>/gm, '');
  next();
});

/***************** Registration *******************/

module.exports = mongoose.model("User", User);
