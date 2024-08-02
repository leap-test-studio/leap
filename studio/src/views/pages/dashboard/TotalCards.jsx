import ReportCard from "./ReportCard";

export default function TotalCards({ totalStats }) {
  return (
    <div className="grid grid-cols-4 gap-3 m-2 mr-0">
      <ReportCard title="Projects" value={totalStats?.projects} icon="text-yellow-600 fad fa-lg fa-solid fa-folder-tree" bgColor="bg-orange-100" />
      <ReportCard title="Test Scenarios" value={totalStats?.scenarios} icon="text-indigo-700 fas fa-lg fa-regular fa-folder" bgColor="bg-blue-100" />
      <ReportCard title="Test Cases" value={totalStats?.cases} icon="text-green-700 fad fa-lg fa-solid fa-cube" bgColor="bg-green-100" />
      <ReportCard title="Builds" value={totalStats?.builds} icon="text-purple-700 fad fa-lg fa-solid fa-industry" bgColor="bg-purple-100" />
    </div>
  );
}
