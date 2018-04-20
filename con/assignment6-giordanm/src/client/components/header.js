/* Copyright G. Hemingway, @2018 */
"use strict";

import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styled from "styled-components";
import md5 from "md5";

/*************************************************************************/

export function GravHash(email, size) {
  let hash = email && email.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
  hash = hash && hash.toLowerCase();
  hash = hash && md5(hash);
  return `https://www.gravatar.com/avatar/${hash}?size=${size}`;
}

const fontColor = "#c4a1a1";

const HeaderLeftBase = styled.div`
  flex-grow: 1;
  font-style: italic;
  & > h2 {
    color: ${fontColor};
    margin: 0.75em 0 0.75em 0.5em;
  }
  & > a {
    text-decoration: none;
    & > h2 {
      color: ${fontColor};
      margin: 0.75em 0 0.75em 0.5em;
    }
  }
`;

const HeaderLeft = ({ user }) => {
  return (
    <HeaderLeftBase>
        <h2>bunnymoney</h2>
    </HeaderLeftBase>
  );
};

HeaderLeft.propTypes = {
  user: PropTypes.string
};

/*******************************************************************/

const HeaderRightBase = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding-right: 0.5em;
  & > a {
    color: ${fontColor};
    padding-right: 0;
  }
`;

const HeaderRight = () => {
  return (
    <HeaderRightBase>
        <Fragment>
          <Link to="/status">Status</Link>
          <Link to="/register">Register</Link>
        </Fragment>
    </HeaderRightBase>
  );
};

HeaderRight.propTypes = {
  user: PropTypes.string,
  email: PropTypes.string
};

/*******************************************************************/

const HeaderBase = styled.div`
  grid-area: hd;
  display: flex;
  background: #303038;
`;

export const Header = () => (
  <HeaderBase>
    <HeaderLeft />
    <HeaderRight />
  </HeaderBase>
);

Header.propTypes = {
  user: PropTypes.string,
  email: PropTypes.string
};
