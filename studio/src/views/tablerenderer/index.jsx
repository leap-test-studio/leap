import { useState } from "react";
import isEmpty from "lodash/isEmpty";
import Pagination from "../utilities/Pagination/Pagination";
import EmptyIconRenderer from "../utilities/EmptyIconRenderer";
import Centered from "../utilities/Centered";

function TableRenderer({ columns = [], data = [], pageSizes = [] }) {
  if (isEmpty(data))
    return (
      <Centered>
        <EmptyIconRenderer title="Records Not Found" fill="#1e5194" />
      </Centered>
    );
  const defaultPage = pageSizes?.find((p) => p.default)?.value || 50;
  const [pageSize, setPageSize] = useState(defaultPage);
  const [pageNumber, setPageNumber] = useState(1);
  const totalRecords = data.length;

  return (
    <>
      <table className="w-full text-sm text-left text-slate-500">
        <TableHeader columns={columns} />
        <tbody className="divide-y">
          {paginate(data, pageSize, pageNumber).map((record, index) => (
            <RenderRow key={index} rowIndex={index} record={record} columns={columns} />
          ))}
        </tbody>
      </table>
      <Pagination
        totalRecords={totalRecords}
        page={pageNumber}
        size={pageSize}
        count={Math.ceil(totalRecords / pageSize)}
        recordsCount={pageSize}
        handlePageItems={setPageSize}
        showRecordsDropdown={true}
        onChange={(_, va) => {
          setPageNumber(va);
        }}
        pageSizes={pageSizes}
      />
    </>
  );
}

export default TableRenderer;

function TableHeader({ columns }) {
  return (
    <thead className="text-sm sticky">
      <tr>
        {columns.map((column, index, arr) => (
          <th
            key={index}
            className={`p-1.5 bg-slate-200 font-semibold text-slate-600 text-left uppercase tracking-wider ${
              index < arr?.length && "border border-r-slate-300"
            }`}
          >
            {column?.title}
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
      {columns.map((column) => {
        let field = record[column.field];
        if (column.formatter) {
          if (typeof column.formatter === "function") {
            field = column.formatter(field);
          }
        }
        const colProperties = column.enum?.find((c) => c.const === field);
        return (
          <td className="px-2 py-1 border border-r-slate-100">
            <label className={`select-all ${colProperties?.class ? colProperties.class + " px-2 py-0.5 rounded hover:shadow" : ""}`}>
              {colProperties != null ? colProperties.title : field}
            </label>
          </td>
        );
      })}
    </tr>
  );
}
