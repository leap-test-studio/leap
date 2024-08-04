import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import isEmpty from "lodash/isEmpty";

import TailwindSelectRenderer from "../tailwindrender/renderers/TailwindSelectRenderer";
import { IconButton, Tooltip, NewlineText, EmptyIconRenderer } from "../utilities";
import { getBuildReports, getBuildDetails } from "../../redux/actions/DashboardActions";
import LabelRenderer from "../tailwindrender/renderers/common/LabelRenderer";
import { fetchProjectList } from "../../redux/actions/ProjectActions";
import { PageHeader, Page, PageActions, PageBody, PageTitle } from "./common/PageLayoutComponents";
import { fetchTestScenarioList } from "../../redux/actions/TestScenarioActions";

const BuildTypes = ["P", "TC", "TS"];

const TestStatus = Object.freeze({
  0: "Draft",
  1: "Running",
  2: "Pass",
  3: "Fail",
  4: "Unknown",
  5: "Skipped",
  6: "Aborted",
  999: "Invalid Testcase"
});

const TestTypeMapping = Object.freeze({
  4: 2,
  5: 3,
  6: 5,
  7: 1
});

const Types = ["Definition", "REST API", "Web", "SSH"];

let interval;
export default function TestReports({ project: selectedPrject, product, changeTestScenario }) {
  const { buildReports, buildDetails } = useSelector((state) => state.dashboard);
  const { projects } = useSelector((state) => state.project);

  const dispatch = useDispatch();
  const reportRef = useRef(null);

  const [buildNo, setBuildNo] = useState(null);
  const [testType, setTestType] = useState(-1);
  const [project, setProject] = useState(selectedPrject);

  if (buildNo) {
    const arr = buildNo.split("-");
    var buildType = Number(arr[0]);
    var buildNumber = arr[1];
  }
  useEffect(() => {
    dispatch(fetchProjectList());
  }, []);

  useEffect(() => {
    if (project?.id) {
      dispatch(getBuildReports(project.id));
      dispatch(fetchTestScenarioList(project.id));
    }
  }, [project]);

  const exportReport2PDF = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Test Automation Report-${project?.name != null ? project.name + "-" : ""}${BuildTypes[buildType]}${buildNumber}`
  });

  const [windowDimenion, detectHW] = useState({
    winWidth: window.innerWidth,
    winHeight: window.innerHeight
  });

  const detectSize = () => {
    detectHW({
      winWidth: window.innerWidth,
      winHeight: window.innerHeight
    });
  };

  useEffect(() => {
    window.addEventListener("resize", detectSize);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", detectSize);
    };
  }, [windowDimenion]);

  const handleBuildChange = (_, ev) => {
    clearInterval(interval);
    if (project?.id) {
      setBuildNo(ev);
      dispatch(getBuildDetails(project?.id, ev));
      interval = setInterval(() => {
        dispatch(getBuildDetails(project?.id, ev));
      }, 10000);
    }
  };

  if (!buildReports || !buildDetails) return null;

  const completionRate = toNumber(buildDetails.completion);

  const buildInfo = buildReports.find((item) => item.type === buildType && item.buildNo === Number(buildNumber));
  if (buildDetails) {
    data[0].value = completionRate + "%";
    data[1].value = buildDetails.scenarios?.length;
    data[2].value = buildDetails.total;
    data[3].value = buildDetails.steps;
    data[4].value = buildDetails.passed;
    data[5].value = buildDetails.failed;
    data[6].value = buildDetails.skipped;
    data[7].value = buildDetails.running;
  }

  const handleFilter = (index) => {
    setTestType(TestTypeMapping[index] || -1);
  };

  const buildList = buildReports
    .map((item) => {
      const buildNo = String(item.buildNo).padStart(4, "0");
      return { type: item.type, value: item.type + "-" + buildNo, label: BuildTypes[item.type] + "-" + buildNo };
    })
    .sort((a, b) => a.label.localeCompare(b.type) && b.label.localeCompare(a.label));

  useEffect(() => {
    if (!buildNo && buildList?.length > 0) {
      handleBuildChange(null, buildList[0].value);
    }
  }, [buildReports, buildList, handleBuildChange]);

  const buildSelected = buildNo && buildInfo && buildDetails;

  return (
    <Page>
      <PageHeader>
        <PageTitle>Test Automation Report</PageTitle>
        <PageActions>
          {isEmpty(selectedPrject) && (
            <div className="inline-flex px-2">
              <LabelRenderer path="" label="Project" />
              <TailwindSelectRenderer
                options={projects.map((item) => {
                  return { value: item.id, label: item.name };
                })}
                data={project?.id}
                handleChange={(_, id) => setProject(projects.find((p) => p.id === id))}
              />
            </div>
          )}
          <div className="inline-flex px-2">
            <LabelRenderer path="" label="Build No." />
            <div className="w-32">
              <TailwindSelectRenderer options={buildList} data={buildNo} handleChange={handleBuildChange} enabled={project != null} />
            </div>
          </div>

          <Tooltip title="Download PDF format">
            <IconButton title="PDF Export" icon="PictureAsPdf" onClick={exportReport2PDF} disabled={!buildSelected} />
          </Tooltip>
        </PageActions>
      </PageHeader>
      <PageBody>
        {buildSelected ? (
          <div id="BuildReport" ref={reportRef} className="p-4 rounded-lg bg-white">
            <div className="grid grid-cols-4 items-start justify-between w-full transition-all duration-500">
              <BuildDetails project={project} buildInfo={buildInfo} {...buildDetails} buildNo={`${BuildTypes[buildType]}-${buildNumber}`} />
              {!isEmpty(buildDetails?.options) && (
                <div className="col-span-2">
                  <BuildEnvironmentVariables options={buildDetails.options} />
                </div>
              )}
              {completionRate == 100 && <TestExecutionResults rate={toNumber(buildDetails.successRate)} />}
            </div>
            <BuildSummary data={data} onClick={handleFilter} testType={testType} />
            <ReportTable {...buildDetails} testType={testType} product={product} changeTestScenario={changeTestScenario} />
          </div>
        ) : (
          <EmptyIconRenderer title="Report Not Found" />
        )}
      </PageBody>
    </Page>
  );
}

function toNumber(num) {
  return Math.trunc(+num);
}

function BuildDetails({ project, status, buildInfo, buildNo }) {
  const isRunning = TestStatus[status] === "Running";
  const report = TestStatus[status];
  return (
    <div className="border-r p-1">
      <p className="select-all font-medium text-base">Build Details</p>
      <table className="table-auto w-full text-xs">
        <tbody>
          <tr>
            <td>Project Name</td>
            <td>{project?.name}</td>
          </tr>
          <tr>
            <td>Build No</td>
            <td>{buildNo}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>
              <div
                className={`rounded text-xs text-center font-medium w-24 py-0.5 ${
                  isRunning
                    ? "bg-cds-blue-0600 animate-pulse"
                    : report === "Pass"
                      ? "bg-cds-green-0600"
                      : report === "Fail" || report === "Aborted"
                        ? "bg-red-500"
                        : "bg-material-yellow-600"
                } text-white select-none`}
              >
                {report}
              </div>
            </td>
          </tr>

          {!isRunning && buildInfo.startTime && buildInfo.endTime && (
            <tr>
              <td>Duration</td>
              <td className="inline-flex items-center">
                <i className="text-indigo-700 fad fa-solid fa-clock w-6 text-center" />
                <label>{convertDatesToHM(buildInfo.startTime, buildInfo.endTime)}</label>
              </td>
            </tr>
          )}
          {buildInfo.startTime && (
            <tr>
              <td>Started</td>
              <td className="inline-flex items-center">
                <i className="text-purple-700 fad fa-solid fa-calendar w-6 text-center" />
                <label>{buildInfo.startTime}</label>
              </td>
            </tr>
          )}
          {!isRunning && buildInfo.endTime && (
            <tr>
              <td>Ended</td>
              <td className="inline-flex items-center">
                <i className="text-purple-700 fad fa-solid fa-calendar w-6 text-center" />
                <label>{buildInfo.endTime}</label>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function BuildEnvironmentVariables({ options }) {
  return (
    <div className="border-r p-2">
      <p className="select-all font-medium text-base">Environment Variables</p>
      <table className="table-auto w-full text-xs">
        <tbody>
          {Object.entries(options).map(([key, value], i) =>
            Object.entries(value).map(([key1, value1], j) => (
              <tr key={key1 + i + j}>
                <td>{key + " " + key1}</td>
                <td>{value1}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const SECONDS = 60;

function convertDatesToHM(startTime, endTime) {
  return convertMsToHM(new Date(endTime).getTime() - new Date(startTime).getTime());
}

function convertMsToHM(milliseconds = 0) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / SECONDS);
  let hours = Math.floor(minutes / SECONDS);

  seconds = seconds % SECONDS;
  minutes = seconds >= SECONDS ? minutes + 1 : minutes;
  minutes = minutes % SECONDS;
  hours = hours % 24;
  let result = "";
  if (hours > 0) {
    result += hours + " " + (hours > 1 ? "hours" : "hour");
    result += " ";
  }
  if (minutes > 0) {
    result += minutes + " " + (minutes > 1 ? "minutes" : "minute");
    result += " ";
  }
  if (seconds > 0) {
    result += seconds + " " + (seconds > 1 ? "seconds" : "second");
  }
  return result;
}

function BuildSummary({ data, onClick, testType }) {
  let key = Object.keys(TestTypeMapping).find((k) => TestTypeMapping[k] === testType);
  return (
    <div className="border-y pb-2 mb-3">
      <p className="font-medium text-base mt-1">Summary</p>
      <div className="grid grid-cols-8">
        {data.map((d, index) => (
          <SummaryCard key={index} {...d} onClick={() => onClick(index)} selected={key > 0 && key == index} />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, className, onClick, selected }) {
  return (
    <div
      className={`card rounder-t pb-2 cursor-pointer hover:bg-color-0050 border-r border-color-0100 ${selected ? "bg-color-0300" : ""} ${
        className != null ? className : ""
      }`}
      onClick={onClick}
    >
      <p className="font-normal text-2xl text-center">{value}</p>
      <p className="text-sm text-center">{title}</p>
    </div>
  );
}

function TestExecutionResults({ rate }) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${rate < 50 ? "text-red-600" : rate < 100 ? "text-yellow-500" : "text-cds-green-0600"}`}
    >
      <Certificate go={rate === 100} />
    </div>
  );
}

const ReportTableHeader = Object.freeze(["TC Key", "Scenario", "Definition", "Steps", "Status", "Time"]);

function ReportTable({ jobs, testType, product, changeTestScenario }) {
  return (
    <table className="table-auto w-full">
      <thead className="text-xs text-white bg-color-0600 rounded-sm">
        <tr>
          {ReportTableHeader.map((header, index) => (
            <th
              key={index}
              className={`p-2 font-semibold border-x text-center ${index === 0 ? "rounded-tl-lg" : index === ReportTableHeader.length - 1 ? "rounded-tr-lg" : ""}`}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-xs font-medium divide-y divide-gray-100 text-color-label">
        {jobs?.map((job, index) => {
          if (testType == -1 || testType === job.result)
            return <JobDetails key={job.id + "-" + index} {...job} product={product} changeTestScenario={changeTestScenario} />;
          return null;
        })}
      </tbody>
    </table>
  );
}

function JobDetails({ TestCase, result, steps, startTime, endTime, screenshot, actual, product, changeTestScenario }) {
  const status = TestStatus[result];
  const title = TestCase?.type ? Types[TestCase?.type] : "";
  const actualResult = actual?.actualResult;
  const navigate = useNavigate();
  const { testscenarios } = useSelector((state) => state.testscenario);

  const openTestCase = () => {
    const scenario = testscenarios.find((ts) => ts.id === TestCase?.TestScenario?.id);
    if (scenario) {
      changeTestScenario(scenario);
      navigate(`/${product?.page.base}/test-scenario`, {
        replace: true,
        state: {
          showUpdateDialog: true,
          selectedTestCase: TestCase
        }
      });
    }
  };

  return (
    <>
      <tr className="hover:bg-color-0050 border border-color-0300 text-xs text-color-label cursor-pointer" onClick={openTestCase}>
        <td className="border-x border-x-color-0300 w-0.10 text-center">
          <p className="font-bold">{TestCase?.label}</p>
          <p className="mt-2">{title}</p>
        </td>
        <td className="border-x border-x-color-0300 w-0.20 p-2">
          <label>{TestCase?.TestScenario?.name}</label>
          <NewlineText text={TestCase?.TestScenario?.description} className="font-normal" style={{ fontSize: 10 }} />
        </td>
        <td className="p-1 border-x border-x-color-0300 w-0.40">
          <div className="inline-flex items-center mb-2 border-b border-color-0300 w-full">
            <strong>GIVEN</strong>
            <NewlineText text={TestCase?.given} className="font-normal ml-2" />
          </div>
          <div className="inline-flex items-center mb-2 border-b border-color-0300 w-full">
            <strong>WHEN</strong>
            <NewlineText text={TestCase?.when} className="font-normal ml-2" />
          </div>
          <div className="inline-flex items-center mb-2">
            <strong>THEN</strong>
            <NewlineText text={TestCase?.then} className="font-normal ml-2" />
          </div>
        </td>
        <td className="p-1 border-x border-x-color-0300 text-center">{result > 0 ? steps : 0}</td>
        <td className="border-x border-x-color-0300 w-16">
          <div
            className={`rounded text-xs text-center font-medium mx-2 p-0.5 ${
              status === "Running"
                ? "bg-cds-blue-0600 animate-pulse"
                : status === "Pass"
                  ? "bg-cds-green-0600"
                  : status === "Fail" || status === "Aborted"
                    ? "bg-red-500"
                    : "bg-material-yellow-600"
            } text-white select-none`}
          >
            {status}
          </div>
        </td>
        <td className="p-1 border-x border-x-color-0300 w-0.20">
          {endTime && startTime && (
            <div className="flex flex-col">
              <strong>Duration</strong>
              <div className="inline-flex items-center" style={{ fontSize: 10 }}>
                <i className="text-indigo-700 fad fa-solid fa-clock w-6 text-center" />
                <label>{convertDatesToHM(startTime, endTime)}</label>
              </div>
            </div>
          )}
          {startTime && (
            <div className="flex flex-col">
              <strong>Start</strong>
              <div className="inline-flex items-center" style={{ fontSize: 10 }}>
                <i className="text-purple-700 fad fa-solid fa-calendar w-6 text-center" />
                <label>{startTime}</label>
              </div>
            </div>
          )}
          {endTime && (
            <div className="flex flex-col">
              <strong>End</strong>
              <div className="inline-flex items-center" style={{ fontSize: 10 }}>
                <i className="text-purple-700 fad fa-solid fa-calendar w-6 text-center" />
                <label>{endTime}</label>
              </div>
            </div>
          )}
        </td>
      </tr>
      {status !== "Pass" && !isEmpty(actualResult) && actualResult.actual && (
        <tr className="hover:bg-color-0050 border border-color-0300 text-xs cursor-pointer" onClick={openTestCase}>
          <td colSpan={ReportTableHeader.length} className="p-2 text-color-label border border-color-0300">
            <p>{`Captured Result for TC${TestCase?.seqNo}`}</p>
            <table className="table-auto w-full mb-4 border border-color-0300 rounded">
              <thead className="text-xs text-color-label bg-color-0400">
                <tr className="text-xs text-center">
                  <th className="border-r border-color-0300">Step Number</th>
                  <th className="border-r border-color-0300">Step Details</th>
                  <th className="border-r border-color-0300">Result</th>
                  <th className="border-r border-color-0300">Step Time</th>
                  <th>Actual Output</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white hover:bg-color-0050 text-xs">
                  <td className="border-r border-color-0300 text-center">{actualResult.stepNo}</td>
                  <td className="border-r border-color-0300">
                    <NewlineText text={JSON.stringify(TestCase?.execSteps[actualResult.stepNo - 1], null, 2)} />
                  </td>
                  <td className="border-r border-color-0300">
                    <p
                      className={`rounded text-xs text-center font-medium w-16 mx-2 py-0.5 ${
                        TestStatus[actualResult.result] === "Running"
                          ? "bg-cds-blue-0600 animate-pulse"
                          : TestStatus[actualResult.result] === "Pass"
                            ? "bg-cds-green-0600"
                            : TestStatus[actualResult.result] === "Fail"
                              ? "bg-red-500"
                              : "bg-material-yellow-600"
                      } text-white select-none`}
                    >
                      {TestStatus[actualResult.result]}
                    </p>
                  </td>
                  <td className="flex-1 border-r border-color-0300">
                    <strong>Elapsed</strong>
                    <p>{actualResult.stepTime}ms</p>
                    <strong>Start Time</strong>
                    <p>{!isNaN(actualResult.startTime) && new Date(Number(actualResult.startTime)).toISOString()}</p>
                    <strong>End Time</strong>
                    <p>{!isNaN(actualResult.endTime) && new Date(Number(actualResult.endTime)).toISOString()}</p>
                  </td>
                  <td className="select-all w-96">{JSON.stringify(actualResult.actual, null, 2)}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      )}
      {!isEmpty(screenshot) && (
        <tr className="hover:bg-color-0050 border border-color-0300 text-xs cursor-pointer" onClick={openTestCase}>
          <td colSpan={ReportTableHeader.length} className="p-2 text-color-label border-x border-x-color-0300 flex-wrap w-full">
            {screenshot.map((s, i) => (
              <div key={i}>
                <label>{s?.stepNo === "Evidence" ? s?.stepNo : "Screenshot for Step:" + s?.stepNo + " Capture Number:" + (i + 1)}</label>
                <img src={`data:image/*;base64,${s.buffer}`} className="rounded border border-slate-500" alt="" style={{ height: "400px" }} />
              </div>
            ))}
          </td>
        </tr>
      )}
    </>
  );
}

const data = [
  {
    title: "Completion",
    value: "100%",
    className: "text-cds-green-0600"
  },
  {
    title: "Total Scenarios",
    value: 1
  },
  {
    title: "Total Cases",
    value: 10
  },
  {
    title: "Steps Executed",
    value: 125
  },
  {
    title: "Pass",
    value: 6,
    className: "text-cds-green-0600"
  },
  {
    title: "Fail",
    value: 3,
    className: "text-red-600"
  },
  {
    title: "Skipped",
    value: 1,
    className: "text-yellow-400"
  },
  {
    title: "In-Progress",
    value: 0,
    className: "text-purple-500"
  }
];

function Certificate({ go = false }) {
  return (
    <svg height="150" viewBox="0 50 512 400">
      <path fill="#E6E6E6" d="M14.273 112.52v271.145H497.727V112.52z" />
      <path fill="#F7B239" d="M512 91.382v313.421l-29.907-29.907V121.289z" />
      <g fill="#E09B2D">
        <path d="M512 91.382l-29.907 29.907H29.907L0 91.382zM482.093 374.896H29.907L0 404.803h512z" />
      </g>
      <path
        fill={go ? "green" : "red"}
        d="M404.504 404.803l-4.582-3.326-4.57 3.326h-.012l-21.736 15.815V315.242c.969.263 1.89.598 2.727 1.029 5.156 2.632 13.741 15.737 14.654 10.144 9.264-56.773 11.424-4.235 17.071-5.132 4.725-.742 10.515 1.376 15.312.467h2.883v98.856l-21.747-15.803z"
      />
      <path fill="#F7B239" d="M29.907 121.289v253.607L0 404.803V91.382z" />
      <text x="135" y="200" fill="#184b81" fontSize="50">
        Certified
      </text>
      <text x={go ? "150" : "60"} y="310" fill={go ? "green" : "red"} fontSize="100">
        {go ? "GO" : "NOGO"}
      </text>
      <path
        fill="#F7B239"
        d="M373.604 352.383c-4.749-1.376-10.647-1.412-14.092-4.869-4.163-4.163-3.361-11.843-5.898-16.819-2.632-5.156-9.271-9.056-10.156-14.654-.885-5.658 4.247-11.424 5.144-17.083.873-5.587-2.249-12.668.383-17.824 2.536-4.976 10.037-6.627 14.2-10.778 4.163-4.163 5.814-11.676 10.79-14.212 5.156-2.62 12.226.502 17.824-.383 5.646-.885 11.412-6.017 17.071-5.132 5.599.885 9.498 7.524 14.654 10.156 4.976 2.536 12.668 1.723 16.819 5.886 4.163 4.163 3.362 11.855 5.898 16.831 2.632 5.156 9.271 9.056 10.156 14.654.885 5.646-4.247 11.424-5.144 17.071-.873 5.599 2.249 12.668-.383 17.824-2.536 4.976-10.037 6.627-14.2 10.79-4.163 4.163-5.814 11.664-10.778 14.2a9.498 9.498 0 01-2.524.849c-4.797.909-10.587-1.208-15.312-.467-5.646.897-11.412 6.029-17.071 5.132-5.598-.873-9.498-7.513-14.654-10.144-.836-.43-1.758-.765-2.727-1.028z"
      />
      <path
        fill={go ? "green" : "red"}
        d="M417.495 289.531c9.702 9.702 9.702 25.433 0 35.122-9.702 9.702-25.433 9.702-35.134 0-9.702-9.69-9.702-25.421 0-35.122 9.702-9.702 25.433-9.702 35.134 0z"
      />
    </svg>
  );
}
