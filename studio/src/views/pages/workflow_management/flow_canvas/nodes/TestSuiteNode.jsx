import React, { useCallback } from "react";
import { useSelector } from "react-redux";

import BaseNode from "./BaseNode";
import TestCaseDetails from "./TestCaseDetails";

const TestSuiteNode = (props) => {
  const getDetails = useCallback(() => {
    const { testsuites } = useSelector((state) => state.project);
    const ts = testsuites[props.data.testSuite];
    if (!ts) return <div className="text-[10px] text-color-label">Not Selected</div>;
    if (ts.TestCases?.length > 0)
      return (
        <div className="flex flex-col mt-2">
          <span className="text-xs">Test Sequence</span>
          {ts.TestCases?.map((tc, key) => (
            <TestCaseDetails key={key} id={tc.id} showDetails={false} />
          ))}
        </div>
      );
  }, [props.data.testSuite]);

  return <BaseNode {...props} customLabel={<>{getDetails()}</>} />;
};

export default TestSuiteNode;
