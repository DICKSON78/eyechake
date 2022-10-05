import React from "react";
import { createSvgIcon } from "@mui/material";

const Done = createSvgIcon(
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline
      points="464 128 240 384 144 288"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    />
    <line
      x1="144"
      y1="384"
      x2="48"
      y2="288"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    />
    <line
      x1="368"
      y1="128"
      x2="232"
      y2="284"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="32"
    />
  </svg>,
  "Done"
);

export default Done;
