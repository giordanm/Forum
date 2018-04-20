/* Copyright G. Hemingway, 2017 - All rights reserved */
"use strict";

let _ = require("lodash"),
  async = require("async"),
  should = require("should"),
  assert = require("assert"),
  request = require("superagent"),
  mongoose = require("mongoose"),
  Models = {};

let timeout = (module.exports.timeout = 100);

/**************************************************************************/

let defaultCollections = [
  { name: "users", path: "../../src/server/models/user" },
  { name: "block", path: "../../src/server/models/block" }
];

module.exports.setup = mongoURL =>
  new Promise((resolve, reject) => {
    let collections = defaultCollections;
    // In our tests we use the test db
    mongoose.connect(mongoURL, async err => {
      if (err) {
        console.log(`Mongo connection error: ${err}`);
        reject(`Mongo connection error: ${err}`);
      } else {
        // Setup all of the models
        _.each(collections, collection => {
          Models[collection.name] = require(collection.path);
        });
        if (collections !== []) {
          await cleanup(collections);
          resolve();
        }
      }
    });
  });

let cleanup = (module.exports.cleanup = collections =>
  new Promise((resolve, reject) => {
    async.eachSeries(
      collections,
      (collection, cb) => {
        try {
          Models[collection.name].remove({}, () => {
            console.log(`    Collection ${collection.name} dropped.`);
            cb();
          });
        } catch (ex) {
          console.log(`Cleanup error on: ${collection.name}`);
          console.log(ex);
          cb();
        }
      },
      err => {
        if (err) reject(err);
        else {
          resolve();
        }
      }
    );
  }));

module.exports.shutdown = () =>
  new Promise(async resolve => {
    // No need to drop anything here
    let collections = []; //defaultCollections;
    await cleanup(collections);
    mongoose.connection.close();
    resolve();
  });

module.exports.login = (url, agent, user) =>
  new Promise(resolve => {
    // Ok, now login with user
    agent
      .post(`${url}/session`)
      .send({ username: user.username, password: user.password })
      .end((req, res) => {
        res.status.should.equal(200);
        res.body.username.should.equal(user.username);
        res.body.primary_email.should.equal(user.primary_email);
        resolve();
      });
  });

module.exports.logout = (url, agent) =>
  new Promise(resolve => {
    agent.del(`${url}/session`).end((req, res) => {
      res.status.should.equal(204);
      resolve();
    });
  });

module.exports.createUser = (url, user) =>
  new Promise(resolve => {
    // Create a user for general context of the tests
    request
      .post(`${url}/user`)
      .send(user)
      .end((req, res) => {
        res.status.should.equal(201);
        setTimeout(resolve, timeout);
      });
  });
