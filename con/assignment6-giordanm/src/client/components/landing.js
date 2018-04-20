/* Copyright G. Hemingway, @2018 */
"use strict";

import React from "react";
import styled from "styled-components";

/*************************************************************************/

const LandingBase = styled.div`
  display: flex;
  justify-content: center;
`;

export const Landing = () => (
  <LandingBase style={{ gridArea: "main" }}>
    <h1>This is my landing page!</h1>
  </LandingBase>
);
