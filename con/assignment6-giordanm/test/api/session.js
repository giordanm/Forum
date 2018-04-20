/* Copyright G. Hemingway, 2017 - All rights reserved */
"use strict";

let request = require("superagent"),
  harness = require("./harness"),
  envConfig = require("simple-env-config"),
  data = require("./data"),
  users = data.users,
  config,
  url;

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "test";

/**************************************************************************/

describe("Session:", () => {
  let primaryAgent = request.agent(),
    anonAgent = request.agent();

  before(async () => {
    config = await envConfig("./config/config.json", env);
    url = `${config.url}:${config.port}${config.api_version}`;
    await harness.setup(`${config.mongodb}`);
    return harness.createUser(url, users.primary);
  });
  after(() => harness.shutdown());

  describe("Log in:", () => {
    it("Failure - missing username", done => {
      primaryAgent
        .post(`${url}/session`)
        .send({
          password: "whattheduck"
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(`"username" is required`);
          done();
        });
    });
    it("Failure - missing password", done => {
      primaryAgent
        .post(`${url}/session`)
        .send({
          username: "whattheduck"
        })
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(`"password" is required`);
          done();
        });
    });
    it("Failure - unknown user", done => {
      primaryAgent
        .post(`${url}/session`)
        .send({
          username: "whattheduck",
          password: users.primary.password
        })
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.error.should.equal(`Unauthorized - Please try again.`);
          done();
        });
    });
    it("Failure - wrong password", done => {
      primaryAgent
        .post(`${url}/session`)
        .send({
          username: users.primary.username,
          password: "whattheduck"
        })
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.error.should.equal(`Unauthorized - Please try again.`);
          done();
        });
    });
    it("Success - log in user", done => {
      primaryAgent
        .post(`${url}/session`)
        .send({
          username: users.primary.username,
          password: users.primary.password
        })
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.username.should.equal(users.primary.username);
          res.body.primary_email.should.equal(users.primary.primary_email);
          done();
        });
    });
  });

  describe("Log out:", () => {
    it("Success - log out logged in user", done => {
      primaryAgent.del(`${url}/session`).end((err, res) => {
        res.status.should.equal(204);
        done();
      });
    });
    it("Success - call logout on not logged in user", done => {
      anonAgent.del(`${url}/session`).end((err, res) => {
        res.status.should.equal(200);
        done();
      });
    });
  });
});
