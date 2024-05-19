import React from "react";

const CircularProgress = ({ className }) => (
  <div className={`loader loading ${className}`}>
    <img src="/assets/images/minanft.svg" alt="loader" />
  </div>
);
export default CircularProgress;
