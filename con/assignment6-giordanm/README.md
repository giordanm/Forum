# CS 4288: Web-based System Architecture 
## Programming Assignment 6

## Overview

This assignment is going to be quite different.  You are to build your own full-stack app, and I am not going to give you much starter code.  We are going to approximate proof-of-work for user registration.  We discussed the general outline of this idea in class, but please closely review the requirements below.

You must build a full-stack (client and server) app that meets the following requirements:


1. SPA Client "Registration Page"
    1. Prompts user for "username"
        1. Client-side validation:
            * Min length 3
            * Max length 15
            * Alphanumeric only (no whitespace or special characters)
    2. Allows user to submit valid username to server
        1. REST endpoint must be ```POST /v1/user/:username``` (no body data)
        2. The server should respond quickly - on 201 from server, route the client to the Status Page
    3. Have a link on this page to the "Status" page (See below)

2. SPA Client "Status Page"
    1. The server is going to take a while to hash things - Make this page pretty
    2. The Status Page should list all "registered" users and show some info on each:
        * Username
        * Public key (as a long hex string)
        * Date of registration
        * Hashing status (done or in process)
        * Hash and nonce (if done - as a long hex string)
    3. Get the list of registered users from ```GET /v1/users```
        * Response should include all of the above (as applicable)
    4. Every 3s check for the status of the hashing jobs.
        1. REST endpoint must be ```HEAD /v1/user/:username/hashstatus``` - No body
        2. The server should respond quickly (204 for done, 400 for still hashing, 404 for user not known)
        3. Make a separate request for each user that is still hashing (don't hit /v1/users every time)
        4. Once an individual user's hash is ready, call to ```GET /v1/user/:username``` (no body) to fetch the user's full information, and update the status page.  Do not call to get the full list of users.
    5. Have a link back to the "registration" page so more usernames can be registered

3. General Client Requirements
    1. Must be a React-based, Webpack-built SPA.  No user actions should take them outside of the SPA.  So, the only HTML to get loaded will be off of the initial HTTP request.
    2. It should be composed of small granular React components - I don't want one mono component for the whole page
    3. You may or may not use Redux for data management - this is your choice
    4. You may use any 3rd party libraries that you want - except jQuery.  You can't use jQuery.

    
2. NodeJS Server
    1. Listen for requests to ```POST /v1/user/:username```
        1. Upon receiving a request to the above endpoint:
            1. Generate a pair of Secp256k1 compatible keys (private, public)
                * See: [NodeJS crypto::createECDH()](https://nodejs.org/api/crypto.html)
            2. Create the appropriate User JSON structure:

            ```
                { "username": "fooman",
                  "publicKey": "0481385932b5ecd9422b8...c57826bbaab9e5b89aa68c919b525e0245af93b1ce",
                  "nonce": "00000000"
                }
            ```
            3. Persist the user information to whatever datastore you choose
            4. Respond with a status code of 201 - Response body of { username: username }

        2. In the background, find a winning hash for the user (see section below)
            1. Use the supplied code in ```./src/server/user.js``` to translate the strictly JSON structure to one with binary Buffers.
            2. Find a nonce that results in a winning hash

    2.  Listen for requests to ```GET /v1/users```
        1. Return an array of all user's registration information (username, public key, registration date, nonce and hash - if done hashing)
        2. You don't need to worry about pagination or limiting the number of
        3. You don't need to worry about sorting the returned array in any particular order

    3. Listen for requests to ```HEAD /v1/user/:username/hashstatus```
        1. Return 404 with no body if the user doesn't exist
        2. Return 400 with no body if the user is still being hashed
        3. Return 204 with no body if the user is done
        
    4. Listen for requests to ```GET /v1/user/:username```
        1. If the user is unknown return 404 { error: "Unknown user" }
        2. Otherwise, send 200 and a JSON with all of the user's registration information (username, public key, registration date, nonce and hash - if done hashing)
        
3. General Server-Side Considerations
    1. You must build your own ExpressJS-based server - but you can pull from any of the code we have used or discussed in class.
    2. 3rd party libraries are allowed
    3. Multiple clients should be able to execute the above process at the same time
        1. Initiation can happen at any time
        2. Each client should get it's own status and data
        3. Your server must not become non-responsive if the number of requests grows large 

### Proof-of-Work Algorithm

We are essentially conducting [proof-of-work](https://en.wikipedia.org/wiki/Proof-of-work_system) on our user.  The idea is that we translate the user JSON into a binary byte array and then add a random nonce to the end of the array.  We hash the byte array with SHA256.  A hash is successful if value is lower than some target value.`

So, first the target.  We are going to use some really large numbers.  We want to set our target to be: '0000000000000000000011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'.  Thats 236 1's.  Wow!  In other words, this is a 256-bit number (at first all ones) shifted right 20 digits.


    1. Generate random 4-byte nonce
    2. Set nonce bytes in the user's binary array
    3. SHA256 hash the binary array
    4. Compare hash to target - if hash is lower, we're done!  This requires some big integer math or a bit of bit-wise fun.

### General Notes

On the Derby Day your application will be evaluated by a number of other students in class. Your application will earn points based on its capabilities (see below).

 * 30% of your grade will be awarded based on a manual code review by the instructor
 
 * 70+% of your grade will be based on the Derby Day peer review
 
 * It is possible to earn more than 100% of the points
 
 * You are free to change, add or remove any code within your application. All reused code (not recorded into package.json) must be attributed
 
 * This app is completely separate from all of our previous work.  But you are welcome to use anything from the class.
    
 * Sessions are not really necessary as there is no client-related state we need to remember - but you can use sessions for some fanciness if you want.
    
 * You do not necessarily have to use Mongo/Mongoose for this assignment.  You need to decided how to persist user information, but it does need to survive the server being rebooted.
 
 * There are no Travis requirements or automated tests for this assignment.  It pretty much all comes down to the Derby.

### Grading - How Its Going to Happen

1. Your peers will grade the majority of this assignment for you

2. You must have your app ready for class on Friday, April 20th.  No app, no points!!!

#### Points will be awarded as follows:

1. (30pts - mandatory) Instructor code review. Is it clean, well-structured, modular code.  Use Prettier to format your code.

2. (20pts - mandatory) You need to securely deploy to a cloud
    * It must be publicly available on the general internet (not just on Vandy campus). 
    * The IP address must not change for the 3 days prior to the Derby and during the entire Derby Day. 
    * While AWS is an excellent option, but not the only one.
    * You must employ HTTPS with a CA issued certificate. Must not pop any warnings or errors on users' Chrome browser.

3. (Up to 25 points - mandatory) Specification must be met. You have to implement all of the capabilities described at the top of this document.  The student evaluator has discretion of how close you get.

4. (25pts) Hash on the client-side instead of on the server.  
    * All hashing must take place on the client-machine that is attempting to register the username.
    * Give the user a nice status page while they wait for a successful hash
    * Navigating away from the waiting page will stop the hashing
    * Once a successful hash has been found, it is sent to the server via ```POST /v1/user/:username``` in the body of the request.
    * The server validates the hash is correct and adds to the list of registered users
    * Navigate the user to the ```/status``` page after the server has validated the provided nonce and hash.

5. (25pts) Use of websockets to push hashing status to clients instead of long-polling from the client.
    * Use of websockets must fully replace the calls to ```HEAD /v1/user/:username/hashstatus``` and also to ```GET /v1/user/:username```.
    * The initial call to ```GET /v1/users``` can remain a RESTful call or may also be replaced with a websocket interaction.

7. (25 points) Register user via Github.
    * Offer users the ability to click one button on the Register page and register using the Github OAuth mechanism discussed in class.
    * You must never directly ask the user for their username, password, or any other information. It must all be pulled from Github.
    * You must still offer the default registration path - don't go all in on Github only

8. (-10 points) Console is spewing any errors or warnings. I like it clean people!  404 errors are fine - we can't avoid those.


### Super Bonus Points

* 20pts - Best looking site - by class vote
* 20pts - Lowest hash value found during the Derby
* 20pts - Smallest client bundle (including all vendor code)
* 20pts - Fastest hasher - via single elimination hash-off competition

### Submission:

You must still commit your code to your repo by the start of class on Derby Day. Failure to do so will result in the loss of the 30 points from code review. Failure to publicly host the application during the Derby will result in the loss of 70+% of your points. You have to make this happen.