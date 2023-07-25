import IconRenderer from "../../IconRenderer";

function RecentBuilds({ recentBuildSummary }) {
  return (
    <>
      <div className="relative bg-white p-6 rounded-md w-full shadow-xl">
        <div className="text-white flex items-center absolute rounded-md py-3 px-4 shadow-xl bg-yellow-500 left-4 -top-6 select-none">
          <IconRenderer icon="Summarize" className="h-10 w-10" />
          <p className="text-md font-semibold ml-3">Recent Build Summary</p>
        </div>
        <div className="mt-5">
          <table className="table-auto w-full">
            <thead className="text-xs uppercase text-slate-500 bg-slate-100 rounded-sm">
              <tr>
                <th className="p-2 font-semibold text-left">
                  <label>Build No.</label>
                </th>
                <th className="p-2 font-semibold text-left">
                  <label>Suite</label>
                </th>
                <th className="p-2 font-semibold text-center">
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
            <tbody className="text-sm font-medium divide-y divide-gray-100">
              {recentBuildSummary?.slice(0, 10)?.map((record, index) => (
                <Row key={index} {...record} />
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
  { color: "bg-slate-200", label: "In-Queue" },
  { color: "animate-pulse bg-cds-green-0600", label: "Running" },
  { color: "bg-purple-100 text-purple-800", label: "Completed" },
  { color: "bg-cds-red-0500", label: "Failed" },
  { color: "bg-cds-red-0500", label: "Unknown" },
  { color: "bg-cds-yellow-0500", label: "Skipped" },
  { color: "bg-cds-red-0500", label: "Aborted" }
]);

function Row({ suiteName, buildNo, status, total, passed, failed, skipped, running }) {
  let obj = STATUS_MAP[status];
  if (status === 1 && running === 0) {
    obj = STATUS_MAP[0];
  }

  return (
    <tr>
      <td className="px-2 py-1 text-left text-slate-500">
        <label>{String(buildNo).padStart(4, "0")}</label>
      </td>
      <td className="px-2 py-1 text-left text-slate-500">
        <label>{suiteName}</label>
      </td>
      <td>
        <span className={`text-slate-700 rounded text-xs font-normal px-1.5 py-0.5 select-none ${obj?.color || "bg-slate-200"}`}>{obj?.label}</span>
      </td>

      <td className="px-2 py-1 text-center text-blue-500">
        <label>{total}</label>
      </td>
      <td className="px-2 py-1 text-center text-green-500">
        <label>{passed}</label>
      </td>
      <td className="px-2 py-1 text-center text-red-500">
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
