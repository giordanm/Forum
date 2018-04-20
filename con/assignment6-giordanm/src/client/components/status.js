/* Copyright G. Hemingway, @2018 */
"use strict";

import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { GravHash } from "./header";
import { StatusList } from "./status-list";
import {Register} from "./register";
import $ from "jQuery";

export class Status extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: [],
            user: [],
            interval: 0,
            tempUser: {}
        };
        this.componentDidMount= this.componentDidMount.bind(this);
        this.updateHashes= this.updateHashes.bind(this);
        this.componentWillUnmount=this.componentWillUnmount.bind(this);

    }

    updateHashes() {
        let array=this.state.userInfo;
        let i;
        for (i=0; i < array.length; i++) {
            this.setState({tempUser: array[i]});
     //       console.log(this.state.tempUser);
            if (array[i].hash_status==="IN PROCESS")
            {
                $.ajax({ //check if done hashing
                    type: "HEAD",
                    async: true,
                    url: '/v1/user/' + array[i].username + '/hashstatus',
                    statusCode: {
                        204: () => {
                            console.log("DONE HASHING!!!!!");
                            fetch('/v1/user/' + this.state.tempUser.username)
                                .then(res => res.json())
                                .then(data => {
                                    console.log("DATA");
                                    console.log(data);
                                    this.setState({tempUser: data});
                                })
                                .catch(err => console.log(err));
                        },
                        404: () => {
                            console.log("user not known.");
                        },
                        400: () => {
                            console.log("still hashing.");
                            console.log(this.state.tempUser.username);
                        }
                    }
                });
            }
            array[i]=this.state.tempUser;
        }
        this.setState({userInfo: array});
    }
    componentDidMount() {
        // Call this function so that it fetch first time right after mounting the component
        //******
        this.updateHashes();
        this.interval = setInterval(this.updateHashes, 3000);

        console.log("Component did mount.");
        console.log(this.props);
        fetch(`/v1/users`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                this.setState({userInfo: data});
            })
            .catch(err => console.log(err));
        //this.updateHashes(); //this seems to be executing before this.setState() is completed above
        //this.fetchUser("usera"); //testing this.fetchUser
        // fetch(`/v1/userT`)
        //     .then(res => res.json())
        //     .then(data => {
        //         console.log(data);
        //         this.setState({user: data});
        //     })
        //     .catch(err => console.log(err));
        //******
    }

    // *******
    componentWillUnmount() {
        // Clear the interval right before component unmount
        clearInterval(this.interval);
    }

    render() {
        return (
            <Fragment>
            <StatusList
                allusers={this.state.userInfo}
            />
            {/*<div>{"User:"+ this.state.user} </div>*/}
            </Fragment>
        );
    }
}

Status.propTypes = {
    history: PropTypes.object.isRequired
};