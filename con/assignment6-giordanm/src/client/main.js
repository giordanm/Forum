/* Copyright G. Hemingway, @2018 */
"use strict";

// Necessary modules
import React, { Component } from "react";
import { render } from "react-dom";
import { BrowserRouter, Route, Redirect } from "react-router-dom";
import styled from "styled-components";
import { Header } from "./components/header";
import { Landing } from "./components/landing";
import { Register } from "./components/register";
import { Status } from "./components/status";

/*************************************************************************/

const defaultUser = {
  username: "",
  first_name: "",
  last_name: "",
  primary_email: "",
  city: "",
  balance: 0
};

const GridBase = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "hd"
    "main"
    "ft";

  @media (min-width: 500px) {
    grid-template-columns: 40px 50px 1fr 50px 40px;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      "hd hd hd hd hd"
      "sb sb main main main"
      "ft ft ft ft ft";
  }
`;

class MyApp extends Component {
  constructor(props) {
    super(props);
    // If the user has logged in, grab info from _PRELOADED_STATE_
    this.state = window.__PRELOADED_STATE__
      ? window.__PRELOADED_STATE__
      : defaultUser;
    // Bind all instance methods
    // this.loggedIn = this.loggedIn.bind(this);
    // this.logIn = this.logIn.bind(this);
    // this.logOut = this.logOut.bind(this);
    // this.updateBalance = this.updateBalance.bind(this);
  }

  render() {
    return (
      <BrowserRouter ref={obj => (this.router = obj)}>
        <GridBase>
          <Header user={this.state.username} email={this.state.primary_email} />
          <Route exact path="/" component={Landing} />
          <Route
            path="/register"
            render={props => {
              return (<Register {...props} />
              );
            }}
          />
            <Route
                path="/status"
                render={props => (
                    <Status
                        {...props}
                    />
                )}
            />
        </GridBase>
      </BrowserRouter>
    );
  }
}
// We need the router in the base component
render(<MyApp />, document.getElementById("mainDiv"));
