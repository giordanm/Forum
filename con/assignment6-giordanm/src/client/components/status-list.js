/* Copyright G. Hemingway, @2018 */
"use strict";

import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { GravHash } from "./header";

/*************************************************************************/

const StatusBlockBase = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
  grid-template-areas: "pic" "profile";
  padding: 1em;

  @media (min-width: 500px) {
    grid-template-columns: auto 1fr;
    grid-template-areas: "pic profile";
    padding: 2em;
  }
`;

const StatusTable = styled.table`
  width: 100%;
  text-align: center;
  @media (max-width: 499px) {
    & > tbody > tr > td:nth-of-type(2),
    & > thead > tr > th:nth-of-type(2) {
      display: none;
    }
  }
`;

/*************************************************************************/

// const EditLinkBase = styled.div`
//   grid-area: sb;
//   display: none;
//   & > a {
//     cursor: not-allowed;
//   }
//   @media (min-width: 500px) {
//     display: inherit;
//   }
// `;

const UserItem = ({ user }) => {
    return !user.city ?
        (
            <tr>
                <td> {user.username} </td>
                <td> {user.publicKey} </td>
                <td> {user.date_reg}</td>
                <td> {user.hash_status} </td>
                <td> {user.nonce} </td>
                <td> {user.hash}</td>
            </tr>
        ) :
        ( //this is filler data since I don't know how to delete entries in database
            <tr>
                <td> {user.username} </td>
                <td> {user.username} </td>
                <td> {user.username}</td>
                <td> {user.username} </td>
                <td> {user.username} </td>
                <td> {user.username} </td>
            </tr>
        );
};

UserItem.propTypes = {
    user: PropTypes.object.isRequired
};


export const StatusList = ({allusers}) => {
        // build an array of users
        // console.log(props.allusers);
        //console.log(allusers.userArray);
        //let thearray=allusers.userArray;
        let users = allusers.map((user, index) => (
            <UserItem key={index} user={user} />
        ));
        console.log(users);
        return (
            <StatusTable>
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Public Key</th>
                    <th>Date Registered</th>
                    <th>Hashing Status</th>
                    <th>Nonce</th>
                    <th>Hash</th>
                </tr>
                </thead>
                <tbody>{users}</tbody>
            </StatusTable>
        );
        // return (
        //     <h>Hi!</h>
        // );
};
StatusList.propTypes = {
    // history: PropTypes.object.isRequired,
    gridPlacement: PropTypes.string,
};
