/* Copyright G. Hemingway, @2018 */
"use strict";

let path = require("path"),
  fs = require("fs"),
  http = require("http"),
  https = require("https"),
  express = require("express"),
  bodyParser = require("body-parser"),
  logger = require("morgan"),
  session = require("express-session"),
  mongoose = require("mongoose"),
  envConfig = require("simple-env-config");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "dev";

/**********************************************************************************************************/

const setupServer = async () => {
  // Get the app config
  const conf = await envConfig("./config/config.json", env);
  const port = process.env.PORT ? process.env.PORT : conf.port;

  // Setup our Express pipeline
  let app = express();
  if (env !== "test") app.use(logger("dev"));
  app.engine("pug", require("pug").__express);
  app.set("views", __dirname);
  app.use(express.static(path.join(__dirname, "../../public")));
  // Setup pipeline session support
  app.store = session({
    name: "session",
    secret: "grahamcoinrules",
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/"
    }
  });
  app.use(app.store);
  // Finish with the body parser
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Connect to MongoDB
  try {
    await mongoose.connect(conf.mongodb);
    console.log(`MongoDB connected: ${conf.mongodb}`);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }

  // Import our Data Models
  app.models = {
    User: require("./models/user")
  };

  // Import our routes
  require("./api")(app);

  // Give them the SPA base page
  app.get("*", (req, res) => {
    let preloadedState = {};
    preloadedState = JSON.stringify(preloadedState).replace(/</g, "\\u003c");
    res.render("base.pug", {
      state: preloadedState
    });
  });

  // Run the server itself
  let server = app.listen(port, () => {
    console.log(`Assignment 6 ${env} listening on: ${server.address().port}`);
  });
};

/**********************************************************************************************************/

// Run the server
setupServer();
