/* Copyright G. Hemingway, @2018 */
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import {
    ErrorMessage,
    FormBase,
    FormInput,
    FormLabel,
    FormButton,
    ModalNotify
} from "./shared";

/*************************************************************************/
const validUsername = username => {
    if (!username || username.length <= 2 || username.length >= 16) {
        return { error: "Username length must be > 2 and < 16" };
    } else if (!username.match(/^[a-z0-9]+$/i)) {
        return { error: "Username must be alphanumeric" };
    }
    return undefined;
};

export class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      error: ""
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(ev) {
    // Update from form and clear errors
    this.setState({ [ev.target.name]: ev.target.value, error: "" });
    // Make sure the username is valid
    if (ev.target.name === "username") {
      let usernameInvalid = validUsername(ev.target.value);
      if (usernameInvalid)
        this.setState({ error: `Error: ${usernameInvalid.error}` });
    }
  }


  onSubmit(ev) {
    ev.preventDefault();
    // Only proceed if there are no errors
    if (!this.state.hasOwnProperty("error") || this.state.error !== "") return;
    fetch("/v1/user/"+this.state.username, {
      method: "POST",
      body: JSON.stringify(this.state),
      credentials: "include",
      headers: {
        "content-type": "application/json"
      }
    })
      .then(res => {
        if (res.ok) {
            this.props.history.push("/status");
            console.log("SUCCESS: REGISTERED");
        } else res.json().then(error => this.setState(error));
      })
      .catch(err => console.log(err));
  }

  componentDidMount() {
    document.getElementById("username").focus();
  }

  render() {
    return (
      <div style={{ gridArea: "main" }}>
        {this.state.notify ? (
          <ModalNotify
            msg={this.state.notify}
            onAccept={this.onAcceptRegister}
          />
        ) : null}
        <ErrorMessage msg={this.state.error} />
        <FormBase>
          <FormLabel htmlFor="username">Username:</FormLabel>
          <FormInput
            id="username"
            name="username"
            placeholder="Username"
            onChange={this.onChange}
            value={this.state.username}
          />
          <FormButton onClick={this.onSubmit}>Register</FormButton>
        </FormBase>
      </div>
    );
  }
}


