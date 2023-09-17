export default function ReportCard({ title, icon, value, total, bgColor }) {
  const rate = Number((value / total) * 100).toFixed(2);

  return (
    <div className="card p-1 shadow-md rounded-md bg-white select-none">
      <div className="min-w-0 bg-white ">
        <div className="p-3 flex items-center">
          <div className="flex flex-col items-center">
            <div className={`p-3 rounded-full text-center mr-4 ${bgColor}`}>
              <i className={`w-6 ${icon}`} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-md font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <span className="flex flex-row">
              <p className="font-medium text-base">{value}</p>
              {!isNaN(total) && <p>/</p>}
              {!isNaN(total) && <p className="font-medium text-base text-slate-400">{total}</p>}
              <div className="ml-5">
                {!isNaN(rate) && (
                  <span className={`rounded-full text-white badge ${rate >= 75 ? "bg-teal-400" : "bg-red-400"} text-xs px-2`}>
                    {rate}%<i className={`fal ${rate >= 75 ? "fa-chevron-up" : "fa-chevron-down"} ml-1`} />
                  </span>
                )}
              </div>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
