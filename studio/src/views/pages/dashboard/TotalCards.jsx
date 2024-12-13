import { FaCube, FaFolderTree, FaFolder, FaIndustry } from "react-icons/fa6";

import ReportCard from "./ReportCard";

export default function TotalCards({ totalStats }) {
  return (
    <div className="grid grid-cols-4 gap-3 m-2 mr-0">
      <ReportCard title="Projects" value={totalStats?.projects} icon={<FaFolderTree className="text-yellow-600" />} bgColor="bg-orange-100" />
      <ReportCard title="Test Suites" value={totalStats?.suites} icon={<FaFolder className="text-indigo-700" />} bgColor="bg-blue-100" />
      <ReportCard title="Test Cases" value={totalStats?.cases} icon={<FaCube className="text-green-700" />} bgColor="bg-green-100" />
      <ReportCard title="Builds" value={totalStats?.builds} icon={<FaIndustry className="text-purple-700" />} bgColor="bg-purple-100" />
    </div>
  );
}
