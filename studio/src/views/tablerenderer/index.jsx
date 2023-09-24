import { useContext, useState } from "react";
import Pagination from "../utilities/Pagination/Pagination";
import isEmpty from "lodash/isEmpty";
import EmptyIconRenderer from "../utilities/EmptyIconRenderer";
import IconRenderer from "../MuiIcons";
import WebContext from "../context/WebContext";

function TableRenderer({ columns = [], data = [], pageSizes }) {
  if (isEmpty(data)) return <EmptyIconRenderer title="Events Not Found" fill="#1e5194" />;

  const defaultPage = pageSizes?.find((p) => p.default)?.value || 50;
  const [pageSize, setPageSize] = useState(defaultPage);
  const [pageNumber, setPageNumber] = useState(1);
  const [sortProperty, setSortProperty] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const { windowDimension } = useContext(WebContext);

  const sortedItems = [...data].sort((a, b) => {
    if (sortProperty) {
      if (a[sortProperty] < b[sortProperty]) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (a[sortProperty] > b[sortProperty]) {
        return sortDirection === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const totalRecords = data.length;
  return (
    <>
      <div
        className="overflow-y-scroll scrollbar-thin scrollbar-thumb-color-0800 scrollbar-track-slate-50 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
        style={{
          minHeight: windowDimension.maxContentHeight - 95,
          maxHeight: windowDimension.maxContentHeight - 95
        }}
      >
        <table className="relative w-full text-[10px] text-left text-slate-600">
          <TableHeader
            columns={columns}
            sortDirection={sortDirection}
            sortProperty={sortProperty}
            setSortProperty={setSortProperty}
            setSortDirection={setSortDirection}
          />
          <tbody className="divide-y">
            {paginate(sortedItems, pageSize, pageNumber).map((record, index) => (
              <RenderRow key={index} rowIndex={index} record={record} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
      {pageSizes && (
        <Pagination
          totalRecords={totalRecords}
          page={pageNumber}
          size={pageSize}
          count={Math.ceil(totalRecords / pageSize)}
          recordsCount={pageSize}
          handlePageItems={(ps) => {
            setPageSize(ps);
            setPageNumber(1);
          }}
          showRecordsDropdown={true}
          onChange={(_, va) => {
            setPageNumber(va);
          }}
          pageSizes={pageSizes}
        />
      )}
    </>
  );
}

export default TableRenderer;

function TableHeader({ columns, sortDirection, sortProperty, setSortProperty, setSortDirection }) {
  const [isHovering, setIsHovering] = useState(false);
  const handleSortClick = (property) => {
    if (sortProperty === property) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortProperty(property);
      setSortDirection("asc");
    }
  };

  return (
    <thead>
      <tr>
        {columns.map(({ title, field, sortable, width, sorter }, index, arr) => (
          <th
            key={index}
            className={`p-1.5 sticky top-0 ${
              sortable ? "cursor-pointer" : ""
            } select-none bg-slate-200 font-semibold text-slate-600 text-left tracking-wider ${index < arr?.length && "border border-r-slate-300"}`}
            style={{ width: width + "px" }}
            onClick={sortable && !sorter ? (e) => handleSortClick(field, e) : sorter ? sorter : () => {}}
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
          >
            {title}
            {sortable && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2" style={{ opacity: isHovering ? 1 : 0 }}>
                <IconRenderer icon={sortDirection === "asc" ? "ArrowDropUp" : "ArrowDropDown"} />
              </div>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function RenderRow({ record, rowIndex, columns }) {
  return (
    <tr key={`row-${rowIndex}`} className={`${rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-100 border-b border-slate-200`}>
      {columns.map((column, index) => {
        let field = record[column.field];
        return (
          <td key={`row-${rowIndex}-${index}`} className="px-1 py-0.5 border border-r-slate-100">
            {CellRenderer(column, field, record)}
          </td>
        );
      })}
    </tr>
  );
}
function CellRenderer(col, field, record) {
  if (typeof col.formatter == "function") {
    field = col.formatter(field, record);
  }
  const colProperties = col.enum?.find((c) => c.const === field);
  switch (col.format) {
    case "progress":
      return <ProgressBar value={field} record={record} colProperties={colProperties} />;
    case "chip":
      return <ChipComponent value={field} />;
    case "link":
      return <LinkComponent value={field} />;
    case "json":
      return <JsonComponent value={field} />;
    default:
      return (
        <div
          className={`select-all ${colProperties?.class ? colProperties.class + " px-1 py-0.5 rounded hover:shadow" : ""} ${
            col.center ? "text-center" : ""
          }`}
        >
          {colProperties != null ? colProperties.title : field}
        </div>
      );
  }
}

const ProgressBar = ({ colProperties }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full">
      <div className={`select-all text-center ${colProperties?.class ? colProperties.class + " px-1 py-0.5 rounded-full hover:shadow" : ""}`}>
        {colProperties?.title}
      </div>
    </div>
  );
};

const ChipComponent = ({ value }) => {
  return (
    <a
      href="#"
      className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-medium mr-2 px-2.5 py-0.5 rounded-full border border-blue-400 inline-flex items-center justify-center"
    >
      {value}%
    </a>
  );
};

const LinkComponent = ({ value }) => {
  const openInNewTab = (url) => {
    window.open(url, "_blank", "noreferrer");
  };
  return (
    <button role="link" onClick={() => openInNewTab(value)} className="text-blue-500">
      {value}
    </button>
  );
};

const JsonComponent = ({ value }) => {
  return (
    <textarea
      className="select-all m-1 rounded-md w-full text-[10px] text-slate-600 border border-gray-300 bg-slate-100"
      disabled={true}
      value={JSON.stringify(value, null, 2)}
    />
  );
};
