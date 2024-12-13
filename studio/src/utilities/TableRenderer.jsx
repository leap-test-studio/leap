import { useState, useEffect } from "react";
import { Pagination } from "./Paginator";

import { FcDown, FcUp, FcCollapse, FcExpand } from "react-icons/fc";
import { Centered } from "./Centered";
import { EmptyIconRenderer } from "./EmptyIconRenderer";

export const TableRenderer = ({
  columns = [],
  data = [],
  clientSide = true,
  pageNo = 1,
  pageSizes = [
    { value: 10, label: "10" },
    { value: 15, label: "15", default: true },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
    { value: 100, label: "100" }
  ],
  defaultSort,
  defaultSortDirection = "asc",
  actionHandler,
  showSelect,
  fieldIndentifier = "id",
  getData,
  noDataIndication,
  noDataIcon = true,
  onPageNumberChange,
  onPageSizeChange,
  selectedRecords,
  size = 10,
  total = 0
}) => {
  const [pageSize, setPageSize] = useState(pageSizes?.find((p) => p.default)?.value || 10);
  const [pageNumber, setPageNumber] = useState(pageNo);
  const [sortProperty, setSortProperty] = useState(defaultSort);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [list, setList] = useState([]);
  const [checkedRecords, setCheckedRecords] = useState([]);

  useEffect(() => {
    if (!Number.isNaN(pageNo)) setPageNumber(pageNo);
  }, [pageNo]);

  useEffect(() => {
    if (selectedRecords) selectedRecords(checkedRecords);
  }, [checkedRecords, selectedRecords]);

  useEffect(() => {
    if (!Number.isNaN(size)) setPageSize(size);
  }, [size]);

  const sortedItems = Array.isArray(list)
    ? [...list].sort((a, b) => {
        if (sortProperty) {
          const colProperties = columns.find((c) => c.dataField === sortProperty);
          const sortByDate = colProperties?.sortType === "date";
          const objA = sortByDate ? new Date(a[sortProperty]) : a[sortProperty];
          const objB = sortByDate ? new Date(b[sortProperty]) : b[sortProperty];
          if (objA < objB) {
            return sortDirection === "asc" ? -1 : 1;
          }
          if (objA > objB) {
            return sortDirection === "asc" ? 1 : -1;
          }
        }
        return 0;
      })
    : [];

  useEffect(() => {
    setList(data);
    if (getData) {
      getData(checkedRecords, isCheckAll);
    }
  }, [data, getData, checkedRecords]);

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
      setCheckedRecords((prev) => prev.filter((item) => item[fieldIndentifier] !== record[fieldIndentifier]));
    } else {
      setCheckedRecords((prev) => [...prev, record]);
    }
  };

  const isChecked = (record) => {
    return checkedRecords?.some((r) => r[fieldIndentifier] === record[fieldIndentifier]);
  };

  const handlePageNumberChange = (n) => {
    setPageNumber(n);
    onPageNumberChange && onPageNumberChange(n);
  };
  const handlePageSizeChange = (n) => {
    setPageNumber(1);
    setPageSize(n);
    onPageNumberChange && onPageNumberChange(1);
    onPageSizeChange && onPageSizeChange(n);
  };
  const totalRecords = total || list?.length;

  return (
    <>
      <div className={`max-h-[70vh] overflow-y-scroll mb-1 pb-2 ${totalRecords > 0 && pageSizes ? "border-b border-color-0300" : ""}`}>
        <table className="w-full text-sm text-color-label border-separate border-spacing-0 bg-white">
          <TableHeader
            columns={columns}
            sortDirection={sortDirection}
            sortProperty={sortProperty}
            setSortProperty={setSortProperty}
            setSortDirection={setSortDirection}
            actionHandler={actionHandler}
            showSelect={showSelect}
            handleSelectAll={handleSelectAll}
            isCheckAll={isCheckAll || checkedRecords.length === data?.length}
          />
          <tbody className="divide-y">
            {totalRecords === 0 ? (
              <tr className="border-b border-color-0300 cursor-pointer">
                <td
                  colSpan={showSelect || actionHandler != null ? columns.length + 1 : columns.length}
                  className="px-1 py-0.5 border border-color-0200 rounded-b-md"
                >
                  <Centered>
                    <EmptyIconRenderer title={noDataIndication} showIcon={noDataIcon} />
                  </Centered>
                </td>
              </tr>
            ) : (
              paginate(clientSide, sortedItems, pageSize, pageNumber)?.map((record, index, records) => (
                <RenderRow
                  key={index}
                  actualRowIndex={index}
                  rowIndex={clientSide ? index + (pageNumber - 1) * pageSize : index}
                  record={record}
                  columns={columns}
                  actionHandler={actionHandler}
                  showSelect={showSelect}
                  data={data}
                  handleSelect={handleSelect}
                  isChecked={isChecked}
                  isCheckAll={isCheckAll}
                  checkedRecords={checkedRecords}
                  total={records.length}
                  fieldIndentifier={fieldIndentifier}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalRecords > 0 && pageSizes && (
        <Pagination
          totalRecords={totalRecords}
          page={pageNumber}
          size={pageSize}
          count={Math.ceil(totalRecords / pageSize)}
          recordsCount={pageSize}
          handlePageItems={(ps) => {
            handlePageSizeChange(ps);
          }}
          showRecordsDropdown={true}
          onChange={(_, va) => {
            handlePageNumberChange(va);
          }}
          pageSizes={pageSizes}
        />
      )}
    </>
  );
};

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
    <thead className="text-xs text-color-0800 bg-color-0100 top-0 sticky">
      <tr>
        {showSelect && (
          <th className="border border-color-0300/60 w-10 rounded-tl-md">
            <input type="checkbox" id="selectAll" className="text-color-0600 rounded mx-2" checked={isCheckAll} onChange={handleSelectAll} />
          </th>
        )}
        {columns?.map(({ text, dataField, sort, width, style, sorter, center }, index, arr) => (
          <th
            key={index}
            className={`p-1.5 ${style ? style : ""} ${
              sort ? "cursor-pointer" : ""
            } select-none font-semibold tracking-wider ${!showSelect && index === 0 ? "rounded-tl-md" : ""} ${!actionHandler && index === arr?.length - 1 ? "rounded-tr-md" : ""} ${index < arr?.length && " border border-color-0300/60"}`}
            style={{ width: width + "px" }}
            onClick={sort && !sorter ? () => handleSortClick(dataField) : sorter ? sorter : () => {}}
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
          >
            <div
              className={`${center ? "text-center" : "ps-2"} flex flex-row ${center && !sort ? "justify-center" : "justify-between"} items-center`}
            >
              {center && sort && <div />}
              <>{text}</>
              {sort && (
                <div style={{ opacity: dataField == sortProperty || isHovering ? 1 : 0 }}>{sortDirection === "asc" ? <FcUp /> : <FcDown />}</div>
              )}
            </div>
          </th>
        ))}
        {actionHandler && (
          <th className="p-1.5 sticky top-0 select-none font-semibold rounded-tr-md border border-color-0300/60 flex w-full justify-center">
            Actions
          </th>
        )}
      </tr>
    </thead>
  );
}

function paginate(clientSide, array, page_size, page_number) {
  return !clientSide ? array : array.slice((page_number - 1) * page_size, page_number * page_size);
}

function RenderRow({
  record,
  rowIndex,
  actualRowIndex,
  columns,
  actionHandler,
  showSelect,
  handleSelect,
  isChecked,
  checkedRecords,
  total,
  fieldIndentifier
}) {
  const checkedRecord = checkedRecords?.map((r) => r[fieldIndentifier]).includes(record[fieldIndentifier]);
  return (
    <tr
      key={`row-${rowIndex}`}
      className={`${checkedRecord && "bg-blue-100 text-color-0600"} hover:bg-color-0050 border-b border-color-0300 cursor-pointer`}
    >
      {showSelect && (
        <td
          className={`hover:shadow-md border border-color-0200 hover:border-color-0300 w-10 ${actualRowIndex === total - 1 ? "rounded-bl-md" : ""}`}
        >
          <input
            key={record[fieldIndentifier]}
            type="checkbox"
            id={"check-" + record[fieldIndentifier]}
            onChange={() => handleSelect(record)}
            checked={isChecked(record)}
            className="text-color-0600 rounded mx-2"
          />
        </td>
      )}
      {columns?.map((column, colIndex) => {
        return (
          <td
            key={`row-${rowIndex}-${colIndex}`}
            className={`tw-flex tw-flex-row hover:shadow-md px-1 py-0.5 border border-color-0200 hover:border-color-0300 ${actualRowIndex === total - 1 && colIndex === 0 ? (showSelect ? "" : "rounded-bl-md") : ""} ${!actionHandler && actualRowIndex === total - 1 && colIndex === columns.length - 1 ? "rounded-br-md" : ""}`}
            style={{ width: column.width }}
          >
            {CellRenderer(column, record, rowIndex, colIndex)}
          </td>
        );
      })}
      {actionHandler && (
        <td
          className={`hover:shadow-md text-center border border-color-0200 hover:border-color-0300 ${actualRowIndex === total - 1 ? "rounded-br-md" : ""}`}
        >
          {actionHandler(record, rowIndex)}
        </td>
      )}
    </tr>
  );
}

function CellRenderer(col, record, rowIndex, colIndex) {
  const field = record[col.dataField];
  if (typeof col.formatter == "function") {
    return col.formatter(field, record, rowIndex, colIndex);
  }
  const colProperties = col.enum?.find((c) => c.const === field);
  switch (col.format) {
    case "chip":
      return <ChipComponent value={field} />;
    case "link":
      return <LinkComponent value={field} />;
    case "json":
      return <JsonComponent value={field} />;
    case "accordion":
      return <AccordionComponent record={record} col={col} />;
    default:
      const { class: cn, style, center } = col;
      return (
        <div
          className={`select-all ${style ? style : ""} ${cn ? cn + " px-1 py-0.5 rounded hover:shadow" : ""} ${center ? "w-full text-center" : "ps-4"}`}
        >
          {colProperties != null ? colProperties.title : field}
        </div>
      );
  }
}

const ChipComponent = ({ value }) => {
  return (
    <a
      href="#"
      className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-medium mr-2 px-2.5 py-0.5 rounded w-full border border-blue-400 inline-flex items-center justify-center"
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
      className="select-all m-1 rounded-md w-full text-[10px] text-color-label border border-gray-300 bg-color-0300"
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
        {open ? <FcCollapse /> : <FcExpand />}
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
                      className="p-1 px-2 border-b-2 border-color-0300 bg-color-0300 text-left text-[10px] font-semibold text-color-label tracking-wider select-none"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.keys(recordData).map((key, index) => (
                    <td key={index} className="bg-white border-b text-center border-color-0300 text-[10px] select-all text-color-label px-4 py-2">
                      {recordData[key]}
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
