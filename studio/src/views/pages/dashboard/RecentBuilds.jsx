import { IconRenderer } from "../../utilities";
import { BuildTypes } from "../utils";

function RecentBuilds({ recentBuildSummary = [] }) {
  return (
    <>
      <div className="relative bg-white p-4 rounded-lg w-full hover:shadow-xl mt-1 border hover:bg-color-0050 hover:border-color-0300 cursor-pointer">
        <div className="text-white flex items-center absolute rounded-md p-2 shadow-xl bg-yellow-500 left-4 -top-4 select-none">
          <IconRenderer icon="Summarize" className="h-10 w-10" />
          <p className="text-sm font-semibold ml-3">Recent Build Summary</p>
        </div>
        <div className="mt-5">
          <table className="table-auto w-full">
            <thead className="text-xs uppercase text-slate-500 bg-slate-100 rounded-sm">
              <tr>
                <th className="p-2 font-semibold text-left">
                  <label>Project</label>
                </th>
                <th className="p-2 font-semibold text-left">
                  <label>Build No.</label>
                </th>
                <th className="p-2 font-semibold text-left">
                  <label>Status</label>
                </th>
                <th className="p-2 font-semibold text-center">
                  <label>Test Cases</label>
                </th>
                <th className="p-2 font-semibold text-center">
                  <label>Pass</label>
                </th>
                <th className="p-2 font-semibold text-center">
                  <label>Fail</label>
                </th>
                <th className="p-2 font-semibold text-center">
                  <label>Skipped</label>
                </th>
                <th className="p-2 font-semibold text-center">
                  <label>Running</label>
                </th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium divide-y divide-gray-100">
              {recentBuildSummary.slice(0, 10)?.map((record, index) => (
                <RenderRow key={index} {...record} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default RecentBuilds;

const STATUS_MAP = Object.freeze([
  { color: "text-color-label bg-slate-200", label: "In-Queue" },
  { color: "animate-pulse bg-green-600", label: "Running" },
  { color: "text-color-0600 bg-green-600", label: "Pass" },
  { color: "bg-red-600", label: "Failed" },
  { color: "bg-red-600", label: "Unknown" },
  { color: "text-color-label bg-cds-yellow-0500", label: "Skipped" },
  { color: "bg-cds-red-0600", label: "Aborted" }
]);

function RenderRow({ project, buildNo, status, total, passed, failed, skipped, running, type }) {
  let obj = STATUS_MAP[status];
  if (status === 1 && running === 0) {
    obj = STATUS_MAP[0];
  }

  return (
    <tr>
      <td className="px-2 py-1 text-left text-slate-500">
        <label>{project?.name}</label>
      </td>
      <td className="px-2 py-1 text-left text-slate-500">
        <label>{`${BuildTypes[type]}-${String(buildNo).padStart(4, "0")}`}</label>
      </td>
      <td className="px-2 text-center">
        <div className={`text-white text-xs text-center font-bold px-2 py-1 w-20 rounded ${obj?.color}`}>{obj?.label}</div>
      </td>
      <td className="px-2 py-1 text-center text-blue-500">
        <label>{total}</label>
      </td>
      <td className="px-2 py-1 text-center text-green-500">
        <label>{passed}</label>
      </td>
      <td className="px-2 py-1 text-center text-red-600">
        <label>{failed}</label>
      </td>
      <td className="px-2 py-1 text-center text-yellow-300">
        <label>{skipped}</label>
      </td>
      <td className="px-2 py-1 text-center text-blue-300">
        <label>{running}</label>
      </td>
    </tr>
  );
}
