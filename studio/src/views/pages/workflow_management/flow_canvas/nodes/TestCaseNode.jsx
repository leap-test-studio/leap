import React from "react";

import BaseNode from "./BaseNode";
import TestCaseDetails from "./TestCaseDetails";

const TestCaseNode = (props) => <BaseNode {...props} customLabel={<TestCaseDetails id={props.data.testCase} showDetails={true} />} />;

export default TestCaseNode;
