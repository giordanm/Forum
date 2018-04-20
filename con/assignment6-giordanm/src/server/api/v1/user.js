/* Copyright G. Hemingway, @2018 */
"use strict";

let Joi = require("joi");
let User = require('../../models/user.js');

const crypto = require("crypto");

/* Helper since we sha256 a lot
 * @param buffer : Buffer - A Buffer of data to be hashed
 * @return Buffer - The hashed value
 */
const sha256 = buffer => {
    let f = crypto.createHash("SHA256");
    let h = f.update(buffer);
    return h.digest();
};


/* Convert a JS Number into an 8bit buffer
 * @param n : Number
 * @return Buffer
 */
const numberToUInt8 = n => {
    let buffer = new Buffer(1);
    buffer.writeUInt8(n, 0);
    return buffer;
};

/* Convert a user structure to a binary buffer
 * @param user.username : String - User's name
 * @param user.publickKey : Buffer - User's public key
 * @param user.nonce : Buffer - nonce for hashing
 * @return Buffer - The binary version of the user
 */
const toBuffer = user => {
    let buffers = [];
    buffers.push(numberToUInt8(user.username.length));
    buffers.push(Buffer.from(user.username, "utf8"));
    buffers.push(user.publicKey);
    //buffers.push(user.nonce);  //i removed this
    buffers.push(numberToUInt8(user.nonce.length)); //i added this
    buffers.push(Buffer.from(user.nonce, "utf8")); //i added this
    return Buffer.concat(buffers);
};

/* Convert a user with binary elements to strictly JSON
 * @param user.username : String
 * @param user.publickey : Buffer
 * @param user.nonce : Buffer
 * @param user.hash : Buffer
 * @return {user} as pure JSON
 */
const toJSON = user => ({
    username: user.username,
    publicKey: user.publicKey.toString("hex"),
    nonce: user.nonce.toString("hex"),
    hash: user.hash.toString("hex")
});

/* Convert a user in strictly JSON format to one with binary elements
 * @param user.username : String
 * @param user.publicKey : String (hex)
 * @param user.nonce : String (hex)
 * @param user.hash : String (hex)
 * @return {user} with Buffers
 */
const fromJSON = user => ({
    username: user.username,
    publicKey: Buffer.from(user.publicKey, "hex"),
    nonce: Buffer.from(user.nonce, "hex"),
    hash: Buffer.from(user.hash, "hex")
});

/* Verify that a user's hash is valid
 * @param user : Object - User object with binary elements
 * @return true (user is valid) | false (user is not valid)
 */
const verify = user => {
    if (!user.hash) return false;
    // Verify user hash
    const bytes = toBuffer(user);
    const hash = sha256(bytes);
    return hash.equals(user.hash);
};

/* Find a nonce that results in a hash of the appropriate
 * level of difficulty
 * @param user.username : String
 * @param user.publicKey : Buffer
 * @param user.nonce : Buffer
 * @param difficulty : Number - Number of leading zero bits needed
 * @param nonceLength : Number - Size in bytes of the nonce
 * @return {hash, nonce}
 */
const hash = (user, difficulty, nonceLength = 4) => {
    /*** You code goes here ***/
    //create a promise
    //create a hashing function that if hash is good, resolves by sending back hash and nonce, else, hash again
    //call hashing function
    return new Promise((resolve, reject) => {
        const doTheHash = () => {
            user.nonce=generateNonce(nonceLength);
            let buffedUser= toBuffer(user);
            //hash buffer
            let hashedVal= sha256(buffedUser);
            let hashHexString=hashedVal.toString('hex');
            let hashHexSubstring=hashHexString.substring(0,difficulty);
            if (/^0*$/.test(hashHexSubstring)) {
                console.log("found it.");
                resolve({
                    hash: hashHexString,
                    nonce: user.nonce
                });
            } else {
                setImmediate(doTheHash);
            }
        };
        doTheHash();
    });
};

// const doTheHash = (user, difficulty, nonceLength) => {
//     user.nonce=generateNonce(nonceLength);
//     let buffedUser= toBuffer(user);
//     //hash buffer
//     let hashedVal= sha256(buffedUser);
//     //let hashByteString=hashedVal.toString('binary');
//     //console.log("hashByteString: +"+hashByteString);
//     //let hashByteSubstring=hashByteString.substring(0,difficulty);
//     let hashHexString=hashedVal.toString('hex');
//     let hashHexSubstring=hashHexString.substring(0,difficulty);
//     //console.log("hashHexSubstring: "+ hashHexSubstring);
//     if (/^0*$/.test(hashHexSubstring)) {
//         console.log("found it.");
//         return [hashHexString, user.nonce]
//     } else {
//         return ["wrong", "wrong"]
//     }
// };


const generateNonce = length => {
    let text = "";
    let possible = "0123456789";
    for(let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

module.exports = { //is it bad that I have two of these
    toBuffer: toBuffer,
    toJSON: toJSON,
    fromJSON: fromJSON,
    verify: verify,
    hash: hash
};

module.exports = app => {

    /*
     * Fetch user information
     *
     * @param {req.params.username} Username of the user to query for
     */
    // GET /v1/user/:username
    //
    // If the user is unknown return 404 { error: "Unknown user" }
    // Otherwise, send 200 and a JSON with all of the user's registration information (username, public key,
    // registration date, nonce and hash - if done hashing)
    app.get(`/v1/user/:username`, (req, res) => {
        User.findOne({username: req.params.username}, function(err, user) { //fetch all user information for all users
            if (err) {
                console.log('error in app.get User.find');
                res.status(500).end(); //is this the right error code?
            }
            if (!user) {
                console.log("no users in database.");
                res.status(404).send({error: "Unknown user"});
            }
            else {
                console.log("THE USER IS: " + user);
                res.status(200).send(user); //what is the format of info I should send? I'm sending hash_status too
            }
        })
    });

    // HEAD /v1/user/:username/hashstatus
    //
    // Return 404 with no body if the user doesn't exist
    // Return 400 with no body if the user is still being hashed - if hash is nothing? or hash_status is something
    // Return 204 with no body if the user is done - if we have a hash. or if hash_status is something
    app.head("/v1/user/:username/hashstatus", async (req, res) => {
        User.findOne({username: req.params.username}, function(err, user) { //fetch all user information for all users
            if (err) {
                console.log('error in app.get User.findOne for user: '+ req.params.username);
                res.status(500).end(); //is this the right error code?
            }
            if (!user) {
                console.log("no users in database.");
                res.status(404).end();
            }
            else if (!user.hash) {
                // console.log("still hashing");
                res.status(400).end(); //still hashing
            }
            else {
                res.status(204).end(); //user is done hashing
            }
        })
    });

    //Fetch array of users and all of their registration info
    app.get("/v1/users", async (req, res) => {
        User.find({}, function(err, users) { //fetch all user information for all users
            if (err) {
                console.log('error in app.get User.find');
                res.status(500).end(); //is this the right error code?
            }
            if (!users) {
                console.log("no users in database.");
            }
            else {
                res.status(200).send(users); //what is the format of info I should send?
            }
        })
    });

    // Begin process to register new user
    // Generate a pair of Secp256k1 compatible keys (private, public)
    // See: NodeJS crypto::createECDH()
    // Create the appropriate User JSON structure:
    // { "username": "fooman",
    //     "publicKey": "0481385932b5ecd9422b8...c57826bbaab9e5b89aa68c919b525e0245af93b1ce",
    //     "nonce": "00000000"
    // }
    // Persist the user information to MongoDB
    // Respond with a status code of 201 - Response body of { username: username }
    app.post("/v1/user/:username", async (req, res) => {
        let keys=crypto.createECDH('secp256k1');
        keys.generateKeys();
        let public_key= keys.getPublicKey();
        console.log(public_key);
        console.log(sha256(public_key));
        console.log(public_key.toString('hex'));
        let nonceBuffed= numberToUInt8(4);
        console.log(nonceBuffed);

        let userJSON= {
            username: req.params.username,
            publicKey: public_key,
            nonce:"00000000", //this is arbitrary... going to generate a new nonce of length=4 anyway
        };
        //persist data - not sure exactly what fields to use and how to fill them yet
        let user = new app.models.User({ //i think I can just out userJSON
            username: req.params.username,
            publicKey: public_key.toString('hex'), //virtual User method will hash this
            date_reg: Date.now(),
            hash_status:"IN PROCESS",
            nonce:"00000000",
        });
        await user.save();
        res.status(201).send({username: req.params.username});

        //now in the background, hash
        // assign a promise, and in that promise execute a function that
        // tries to create the hash, and if the hash is successful, resolve.
        // other wise set an immediate execution of hash again
        let data = await hash(userJSON, 2);
        console.log(data.hash);
        console.log(data.nonce);
        //now that hash function has returned, add hash and nonce to database
        console.log(req.params.username);
        app.models.User.findOneAndUpdate(
            {username:req.params.username},
            {
                $set: {
                    nonce: data.nonce,
                    hash_status: "DONE"
                },
                $push: {
                    hash: data.hash
                }
            },
            {new: true},
            function(err, user) {
                if (err) {
                    console.log("Something wrong when updating data!");
                }
                if (!user) {
                    console.log("Couldn't find user.")
                } else {
                    console.log("Updated user: "+ user);
                }
            }
        );
        // app.models.User.findOne({'username': req.params.username}, function(err, user) { //fetch all user information for all users
        //     if (err) {
        //         console.log('error in app.get User.find');
        //         res.status(500).end(); //is this the right error code?
        //     }
        //     if (!user) {
        //         console.log("no users in database.");
        //         res.status(404).send({error: "Unknown user"});
        //     }
        //     else {
        //         console.log("user: "+ user);
        //     }
        // });
        //res.status(201).send({username: req.params.username});

    });
};
