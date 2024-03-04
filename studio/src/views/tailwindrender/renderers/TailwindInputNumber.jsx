import React from "react";

import TailwindNumeric from "./common/TailwindNumeric";

const TailwindInputNumber = React.memo((props) => {
  return <TailwindNumeric step={0.1} {...props} />;
});

export default TailwindInputNumber;
