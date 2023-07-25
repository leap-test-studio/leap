import React from "react";
import Centered from "./Centered";

const SvgRenderer = ({ title, children, fill = "#1b5593" }) => {
  return (
    <Centered>
      {children}
      <h6 style={{ color: fill }} className="select-none mt-1">
        {title}
      </h6>
    </Centered>
  );
};

export default SvgRenderer;
