import React from "react";

import TailwindNumeric from "./common/TailwindNumeric";

const TailwindInputInteger = React.memo((props) => {
  return <TailwindNumeric {...props} />;
});

export default TailwindInputInteger;
