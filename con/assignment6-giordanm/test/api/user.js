/* Copyright G. Hemingway, 2017 - All rights reserved */
"use strict";

let _ = require("lodash"),
  request = require("superagent"),
  harness = require("./harness"),
  envConfig = require("simple-env-config"),
  data = require("./data"),
  users = data.users,
  config,
  url;

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "test";

/**************************************************************************/

describe("User:", () => {
  let primaryAgent = request.agent(),
    anonAgent = request.agent();

  before(async () => {
    config = await envConfig("./config/config.json", env);
    url = `${config.url}:${config.port}${config.api_version}`;
    return harness.setup(`${config.mongodb}`);
  });
  after(() => harness.shutdown());

  describe("Create:", () => {
    it("Failure - missing required username", done => {
      primaryAgent
        .post(`${url}/user`)
        .send(_.pick(users.primary, "first_name", "last_name"))
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal('"username" is required');
          done();
        });
    });
    it("Failure - missing required address", done => {
      primaryAgent
        .post(`${url}/user`)
        .send(
          _.pick(
            users.primary,
            "first_name",
            "last_name",
            "username",
            "password"
          )
        )
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal('"primary_email" is required');
          done();
        });
    });
    it("Failure - missing required password", done => {
      primaryAgent
        .post(`${url}/user`)
        .send(
          _.pick(
            users.primary,
            "first_name",
            "last_name",
            "username",
            "primary_email"
          )
        )
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal('"password" is required');
          done();
        });
    });
    it("Failure - malformed username -- bad chars", done => {
      let data = _.clone(users.primary);
      data.username = "@yys7! foobar";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            '"username" must only contain alpha-numeric characters'
          );
          done();
        });
    });
    it("Failure - malformed username -- reserved word", done => {
      let data = _.clone(users.primary);
      data.username = "password";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal("Invalid username.");
          done();
        });
    });
    it("Failure - malformed address", done => {
      let data = _.clone(users.primary);
      data.primary_email = "not.a.real.address-com";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal('"primary_email" must be a valid email');
          done();
        });
    });
    it("Failure - malformed password -- too short", done => {
      let data = _.clone(users.primary);
      data.password = "1234567";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            '"password" length must be at least 8 characters long'
          );
          done();
        });
    });
    it("Failure - malformed password -- need at least one uppercase", done => {
      let data = _.clone(users.primary);
      data.password = "!1234asdf";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            "Password must contain an uppercase letter"
          );
          done();
        });
    });
    it("Failure - malformed password -- need at least one lowercase", done => {
      let data = _.clone(users.primary);
      data.password = "!1234ASDF";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            "Password must contain a lowercase letter"
          );
          done();
        });
    });
    it("Failure - malformed password -- need at least one number", done => {
      let data = _.clone(users.primary);
      data.password = "!ASDFasdf";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal("Password must contain a number");
          done();
        });
    });
    it("Failure - malformed password -- need at least one symbol", done => {
      let data = _.clone(users.primary);
      data.password = "1234Asdf";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal(
            "Password must contain @, !, #, $, % or ^"
          );
          done();
        });
    });
    it("Success - return 201 and username and ...", done => {
      primaryAgent
        .post(`${url}/user`)
        .send(users.primary)
        .end((err, res) => {
          res.status.should.equal(201);
          res.body.username.should.equal(users.primary.username);
          res.body.primary_email.should.equal(users.primary.primary_email);
          // Save the user info
          setTimeout(done, harness.timeout);
        });
    });
    it("Failure - already used username", done => {
      let data = _.clone(users.primary);
      data.primary_email = "randomemailname@randomaddress.com";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal("Username already in use.");
          done();
        });
    });
    it("Failure - case insensitivity", done => {
      let data = _.clone(users.primary);
      data.username = data.username.toUpperCase();
      data.primary_email = "goo@bar.com";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal("Username already in use.");
          done();
        });
    });
    it("Failure - already used email address", done => {
      let data = _.clone(users.primary);
      data.username = "randomusername";
      primaryAgent
        .post(`${url}/user`)
        .send(data)
        .end((err, res) => {
          res.status.should.equal(400);
          res.body.error.should.equal("Email address already in use.");
          done();
        });
    });
  });

  describe("Exists:", () => {
    it("Failure - unknown user", done => {
      primaryAgent.head(`${url}/user/fakeusername`).end((err, res) => {
        res.status.should.equal(404);
        done();
      });
    });
    it("Success - read existing user profile", done => {
      primaryAgent
        .head(`${url}/user/${users.primary.username}`)
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });
    it("Success - read existing user profile - case insensitive", done => {
      primaryAgent
        .head(`${url}/user/${users.primary.username.toUpperCase()}`)
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });
  });

  describe("Read:", () => {
    it("Success - read existing user profile", done => {
      primaryAgent
        .get(`${url}/user/${users.primary.username}`)
        .end((err, res) => {
          res.status.should.equal(200);
          res.body.username.should.equal(users.primary.username);
          res.body.primary_email.should.equal(users.primary.primary_email);
          res.body.first_name.should.equal(users.primary.first_name);
          res.body.last_name.should.equal(users.primary.last_name);
          res.body.city.should.equal(users.primary.city);
          res.body.transactions.should.be
            .instanceof(Array)
            .and.have.lengthOf(0);
          done();
        });
    });
    it("Failure - read non-existent user profile", done => {
      primaryAgent.get(`${url}/user/foobar`).end((err, res) => {
        res.status.should.equal(404);
        res.body.error.should.equal("Unknown user: foobar.");
        done();
      });
    });
  });

  describe("Update:", () => {
    before(() => harness.login(url, primaryAgent, users.primary));
    after(() => harness.logout(url, primaryAgent));

    it("Success - update first and last name - return 204", done => {
      primaryAgent
        .put(`${url}/user`)
        .send({ first_name: "foo2", last_name: "bar2" })
        .end((err, res) => {
          res.status.should.equal(204);
          users.primary.first_name = "foo2";
          users.primary.last_name = "bar2";
          done();
        });
    });
    it("Success - send nothing - return 204", done => {
      primaryAgent.put(`${url}/user`).end((err, res) => {
        res.status.should.equal(204);
        done();
      });
    });
    it("Success - can not change username, primary_email or non-standard fields - return 204", done => {
      primaryAgent
        .put(`${url}/user`)
        .send({
          username: "newname",
          primary_email: "something@new.com",
          admin: true
        })
        .end((err, res) => {
          res.status.should.equal(204);
          done();
        });
    });
    it("Failure - not logged in", done => {
      anonAgent
        .put(`${url}/user`)
        .send({ first_name: "foo2", last_name: "bar2" })
        .end((err, res) => {
          res.status.should.equal(401);
          res.body.error.should.equal("unauthorized");
          done();
        });
    });
  });
});
