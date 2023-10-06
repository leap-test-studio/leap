import { useContext, useState, useEffect } from "react";
import Pagination from "../utilities/Pagination/Pagination";
import isEmpty from "lodash/isEmpty";
import EmptyIconRenderer from "../utilities/EmptyIconRenderer";
import Centered from "../utilities/Centered";
import IconRenderer from "../MuiIcons";
import WebContext from "../context/WebContext";

function TableRenderer({
  columns = [],
  data = [],
  pageSizes,
  onPageChange,
  defaultSort,
  defaultSortDirection = "asc",
  actionHandler,
  showSelect,
  getData
}) {
  if (isEmpty(data)) return <EmptyIconRenderer title="Data Not Found" fill="#1e5194" />;

  const defaultPage = pageSizes?.find((p) => p.default)?.value || 50;
  const [pageSize, setPageSize] = useState(defaultPage);
  const [pageNumber, setPageNumber] = useState(1);
  const [sortProperty, setSortProperty] = useState(defaultSort);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const { windowDimension } = useContext(WebContext);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [list, setList] = useState([]);
  const [checkedRecords, setCheckedRecords] = useState([]);
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

  useEffect(() => {
    setList(data);
    if (getData) {
      getData(checkedRecords);
    }
  }, [list, checkedRecords]);

  const handleSelectAll = () => {
    if (!isCheckAll) {
      setIsCheckAll(true);
      setCheckedRecords(list);
    } else {
      setIsCheckAll(false);
      setCheckedRecords([]);
    }
  };

  const handleSelect = (record) => {
    if (isChecked(record)) {
      setCheckedRecords((prev) => prev.filter((item) => item.id !== record.id));
    } else {
      setCheckedRecords((prev) => [...prev, record]);
    }
  };

  const isChecked = (record) => {
    return checkedRecords?.some((r) => r.id === record.id);
  };

  const totalRecords = data.length;
  return (
    <>
      <div
        className="h-full w-full overflow-y-scroll scrollbar-thin bg-white scrollbar-thumb-color-0800 scrollbar-track-slate-50 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
        style={{
          minHeight: windowDimension.maxContentHeight - 90,
          maxHeight: windowDimension.maxContentHeight - 90
        }}
      >
        <table className="relative w-full text-[10px] text-left text-slate-600">
          <TableHeader
            columns={columns}
            sortDirection={sortDirection}
            sortProperty={sortProperty}
            setSortProperty={setSortProperty}
            setSortDirection={setSortDirection}
            actionHandler={actionHandler}
            showSelect={showSelect}
            handleSelectAll={handleSelectAll}
            isCheckAll={isCheckAll}
          />
          <tbody className="divide-y">
            {paginate(sortedItems, pageSize, pageNumber).map((record, index) => (
              <RenderRow
                key={index}
                rowIndex={index}
                record={record}
                columns={columns}
                actionHandler={actionHandler}
                showSelect={showSelect}
                data={data}
                handleSelect={handleSelect}
                isChecked={isChecked}
                isCheckAll={isCheckAll}
                checkedRecords={checkedRecords}
              />
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
            typeof onPageChange === "function" && onPageChange(ps);
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

function TableHeader({
  columns,
  sortDirection,
  sortProperty,
  setSortProperty,
  setSortDirection,
  actionHandler,
  showSelect,
  handleSelectAll,
  isCheckAll
}) {
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
      <tr className="group">
        {showSelect && (
          <th className="bg-slate-200 border border-r-slate-100 w-10">
            <input
              type="checkbox"
              id="selectAll"
              className="rounded m-2 p-1.5 sticky top-0 select-none font-semibold  text-slate-600 text-left tracking-wider"
              checked={isCheckAll}
              onChange={handleSelectAll}
            />
          </th>
        )}
        {columns.map(({ title, field, sortable, width, sorter, center }, index, arr) => (
          <th
            key={index}
            className={`px-1.5 py-0.5 sticky top-0 ${
              sortable ? "cursor-pointer" : ""
            } select-none bg-slate-200 font-semibold text-slate-600 text-left tracking-wider ${index < arr?.length && "border border-r-slate-300"}`}
            style={{ width }}
            onClick={sortable && !sorter ? (e) => handleSortClick(field, e) : sorter ? sorter : () => {}}
          >
            <div className="flex flex-row justify-between items-center">
              {center && <div className="opacity-0"></div>}
              <label>{title}</label>
              {sortable && (
                <div className={`opacity-0 group-hover:opacity-100 ${sortProperty === field ? "opacity-100 bg-slate-300 rounded-full" : ""}`}>
                  <IconRenderer icon={sortDirection === "asc" ? "ArrowDropUp" : "ArrowDropDown"} />
                </div>
              )}
            </div>
          </th>
        ))}
        {actionHandler && <th className="p-1.5 sticky top-0 select-none bg-slate-200 font-semibold text-slate-600 w-20">Actions</th>}
      </tr>
    </thead>
  );
}

function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function RenderRow({ record, rowIndex, columns, actionHandler, showSelect, handleSelect, isChecked, checkedRecords }) {
  const checkedRecord = checkedRecords?.map((r) => r.id).includes(record.id);
  return (
    <tr key={`row-${rowIndex}`} className={`${checkedRecord && "bg-blue-100 text-color-0800"}  hover:bg-slate-100 border-b border-slate-200`}>
      {showSelect && (
        <td className="border border-r-slate-100 w-10">
          <input
            key={record.id}
            type="checkbox"
            id={record.id}
            onChange={() => handleSelect(record)}
            checked={isChecked(record)}
            className="text-color-0800 rounded mx-2"
          />
        </td>
      )}
      {columns.map((column, index) => {
        let field = record[column.field];
        return (
          <td key={`row-${rowIndex}-${index}`} className="px-1 py-0.5 border border-r-slate-100">
            {CellRenderer(column, field, record, record, columns)}
          </td>
        );
      })}
      {actionHandler && <td className="text-center border-slate-200">{actionHandler(record)}</td>}
    </tr>
  );
}
function CellRenderer(col, field, record, columns) {
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
    case "accordion":
      return <AccordionComponent value={field} record={record} col={col} />;
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

const AccordionComponent = ({ record, col }) => {
  const recordData = record[col.field];
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded bg-white border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-1 px-4 flex items-center justify-between text-neutral-800 transition-transform duration-200 ease-in-out focus:outline-none"
      >
        <span>Accordion Item</span>
        <IconRenderer icon={open ? "ArrowDropUp" : "ArrowDropDown"} />
      </button>
      {open && (
        <div className="transition-max-h p-1 border">
          <div className="p-1">
            <table className="border ">
              <thead>
                <tr>
                  {Object.keys(recordData).map((item, index) => (
                    <th
                      key={index}
                      className="p-1 px-2 border-b-2  border-slate-300 bg-slate-100 text-left text-[10px] font-semibold text-slate-700 tracking-wider select-none"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(recordData).map((item, index) => (
                    <td key={index} className="bg-white border-b text-center border-slate-200 text-[10px] select-none text-slate-700">
                      {item}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
