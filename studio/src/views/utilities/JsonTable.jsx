import React from "react";
import capitalize from "lodash/capitalize";
import snakeCase from "lodash/snakeCase";

const defaultSettings = {
  header: true,
  noRowsMessage: "No items",
  classPrefix: "json",
  headerClass: () => {
    return "p-1 border-b-2 border-slate-300 bg-slate-100 text-left text-xs font-semibold text-slate-700 tracking-wider select-none";
  },
  rowClass: (className) => {
    return `bg-white border-b border-slate-300 text-xs select-none text-slate-700 ${className}`;
  },
  cellClass: () => {
    return "px-1 pt-0.5 break-all text-slate-500";
  }
};

const Row = React.memo((props) => {
  const getSetting = (name) => {
    const settings = props.settings;
    if (!settings || typeof settings[name] == "undefined") return defaultSettings[name];
    return settings[name];
  };

  const onClickCell = (e) => {
    props.onClickCell(e, e.target.dataset.key, props.item);
  };

  const onClickRow = (e) => {
    props.onClickRow(e, props.item);
  };

  const cellClass = getSetting("cellClass");
  const rowClass = getSetting("rowClass");

  let className = props.i % 2 ? "bg-slate-100" : "bg-slate-50";

  if (rowClass) className = rowClass(className, props.item);

  return (
    <tr key={props.reactKey} className={className} onClick={onClickRow}>
      {props.columns.map(function (col) {
        let content = col.cell,
          key = col.key,
          className = cellClass();

        if (typeof content === "function") content = content(props.item, key);
        return (
          <td id={props.reactKey + "-" + key} key={key} className={className} data-key={key} onClick={onClickCell}>
            {content}
          </td>
        );
      })}
    </tr>
  );
});

export const JsonTable = React.memo((props) => {
  const getSetting = (name) => {
    const settings = props.settings;
    if (!settings || typeof settings[name] == "undefined") return defaultSettings[name];
    return settings[name];
  };

  const renderHeader = (cols) => {
    const headerClass = getSetting("headerClass"),
      cells = cols.map((col) => (
        <th key={col.key} className={headerClass()} onClick={onClickHeader} data-key={col.key}>
          {col.label}
        </th>
      ));
    return (
      <thead key={"th"}>
        <tr>{cells}</tr>
      </thead>
    );
  };

  const renderRows = (cols) => {
    const items = props.rows,
      settings = props.settings || {};
    let i = 1;
    if (!items || !items.length)
      return (
        <tbody key="noRowsMessage">
          <tr>
            <td>{getSetting("noRowsMessage")}</td>
          </tr>
        </tbody>
      );
    const rows = items.map(function (item) {
      const key = getKey(item, i);
      return React.createElement(Row, {
        key: key,
        reactKey: key,
        item: item,
        settings: settings,
        columns: cols,
        i: i++,
        onClickRow: onClickRow,
        onClickCell: onClickCell
      });
    });
    return <tbody key="body">{rows}</tbody>;
  };

  const getItemField = (item, field) => {
    return item[field] || "-";
  };

  const normalizeColumns = () => {
    const cols = props.columns,
      items = props.rows;

    if (!cols) {
      if (!items || !items.length) return [];
      return Object.keys(items[0]).map(function (key) {
        return {
          key: key,
          label: capitalize(snakeCase(key).replace(/_/g, " ")),
          cell: props.cellRenderer !== undefined ? props.cellRenderer : getItemField
        };
      });
    }

    return cols.map(function (col) {
      let key;
      if (typeof col == "string") {
        return {
          key: col,
          label: col,
          cell: props.cellRenderer !== undefined ? props.cellRenderer : getItemField
        };
      }

      if (typeof col == "object") {
        key = col.key || col.label;

        // This is about get default column definition
        // we use label as key if not defined
        // we use key as label if not defined
        // we use getItemField as cell function if not defined
        return {
          key: key,
          label: col.label || key,
          cell: col.cell || props.cellRenderer !== undefined ? props.cellRenderer : getItemField
        };
      }

      return {
        key: "unknown",
        name: "unknown",
        cell: "Unknown"
      };
    });
  };

  const getKey = (item, i) => {
    const field = props.settings && props.settings.keyField;
    if (field && item[field]) return item[field];

    if (item.id) return item.id;

    if (item._id) return item._id;

    return i;
  };

  const onClickRow = (e, item) => {
    if (props.onClickRow) {
      props.onClickRow(e, item);
    }
  };

  const onClickHeader = (e) => {
    if (props.onClickHeader) {
      props.onClickHeader(e, e.target.dataset.key);
    }
  };

  const onClickCell = (e, key, item) => {
    if (props.onClickCell) {
      props.onClickCell(e, key, item);
    }
  };

  const cols = normalizeColumns(),
    contents = [renderRows(cols)];
  if (getSetting("header")) contents.unshift(renderHeader(cols));
  const tableClass = props.className || getSetting("classPrefix");
  return (
    <div className="w-full select-none mb-2">
      {props.title && <p className="text-xs font-medium">{props.title}</p>}
      <table className={(`${tableClass}`, "w-full border rounded-md")}>{contents}</table>
    </div>
  );
});

export const JsonData = React.memo(({ data, ...props }) => {
  if (data != null) {
    return (
      <>
        {Object.keys(data).map((key) => {
          return <JsonTable key={key} title={data[key].label} rows={data[key].rows} columns={data[key].columns} />;
        })}
      </>
    );
  } else return <JsonTable {...props} />;
});

export const JSONArray = React.memo(({ list }) => Array.isArray(list) && list.map((item, index) => <JsonData key={index} {...item} />));
