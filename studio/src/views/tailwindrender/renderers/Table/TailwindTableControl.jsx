import merge from "lodash/merge";
import isEmpty from "lodash/isEmpty";
import startCase from "lodash/startCase";
import range from "lodash/range";
import union from "lodash/union";
import { JsonFormsDispatch, useJsonForms } from "@jsonforms/react";
import React, { useMemo, useState, useCallback } from "react";
import IconButton from "../../../utilities/IconButton";
import { errorsAt, formatErrorMessage, Paths, Resolve, composePaths, createDefaultValue } from "@jsonforms/core";
import TableToolbar from "./TableToolbar";
import EmptyIconRenderer from "../../../utilities/EmptyIconRenderer";
import Tooltip from "../../../utilities/Tooltip";

const generateCells = (Cell, schema, uischema, rowPath, enabled, cells) => {
  if (schema.type === "object") {
    return getValidColumnProps(schema).map((prop) => {
      const cellPath = Paths.compose(rowPath, prop);
      const props = {
        propName: prop,
        schema: schema.properties[prop],
        title: schema.properties?.[prop]?.title ?? startCase(prop),
        rowPath,
        cellPath,
        uischema: uischema?.options?.detail?.elements?.find((e) => e.scope.endsWith(prop)) || uischema,
        enabled,
        cells
      };
      return <Cell key={cellPath} {...props} />;
    });
  } else {
    // primitives
    const props = {
      schema,
      uischema,
      rowPath,
      cellPath: rowPath,
      enabled
    };
    return <Cell key={rowPath} {...props} />;
  }
};

const getValidColumnProps = (scopedSchema) => {
  if (scopedSchema.type === "object" && typeof scopedSchema.properties === "object") {
    return Object.keys(scopedSchema.properties).filter((prop) => scopedSchema.properties[prop].type !== "array");
  }
  // primitives
  return [""];
};

const EmptyTable = () => (
  <div className="w-full items-center justify-center">
    <EmptyIconRenderer title="No records found" fill="#90b6e8" showIcon={false} />
  </div>
);

const ctxToNonEmptyCellProps = (ctx, { rowPath, schema, propName, enabled, cells, renderers, uischema }) => {
  const path = rowPath + (schema.type === "object" ? "." + propName : "");
  const errors = formatErrorMessage(union(errorsAt(path, schema, (p) => p === path)(ctx.core.errors).map((error) => "propName:" + error.message)));
  return {
    rowPath,
    propName,
    schema,
    rootSchema: ctx.core.schema,
    errors,
    path,
    enabled,
    cells: cells || ctx.cells,
    renderers: renderers || ctx.renderers,
    uischema
  };
};

const createControl = (scope, name, uischema, title) => {
  return {
    ...uischema,
    type: "Control",
    scope,
    label: title !== undefined ? title : uischema.label !== undefined ? uischema.label : name !== undefined ? startCase(name) : true
  };
};

const NonEmptyCellComponent = ({ path, propName, schema, rootSchema, enabled, renderers, cells, ...props }) => {
  const uischema = createControl(schema.properties ? `#/properties/${propName}` : "#", propName, props?.uischema, schema.title);
  return (
    <div className="px-1 pt-0.5 text-xs">
      {schema.properties ? (
        <JsonFormsDispatch
          schema={Resolve.schema(schema, `#/properties/${propName}`, rootSchema) || schema}
          uischema={uischema}
          path={path}
          enabled={enabled}
          renderers={renderers}
          cells={cells}
        />
      ) : (
        <JsonFormsDispatch schema={schema} uischema={uischema} path={path + "." + propName} enabled={enabled} renderers={renderers} cells={cells} />
      )}
    </div>
  );
};

const NonEmptyCell = (ownProps) => {
  const ctx = useJsonForms();
  const emptyCellProps = ctxToNonEmptyCellProps(ctx, ownProps);
  const isValid = isEmpty(emptyCellProps.errors);
  return <NonEmptyCellComponent {...emptyCellProps} isValid={isValid} />;
};

const NonEmptyRow = React.memo(
  ({
    childPath,
    schema,
    rowIndex,
    openDeleteDialog,
    moveUpCreator,
    moveDownCreator,
    enableUp,
    enableDown,
    showSortButtons,
    rowTitle,
    enabled,
    cells,
    path,
    records,
    uischema,
    readonly
  }) => {
    const moveUp = useMemo(() => moveUpCreator(path, rowIndex), [moveUpCreator, path, rowIndex]);
    const moveDown = useMemo(() => moveDownCreator(path, rowIndex), [moveDownCreator, path, rowIndex]);
    return (
      <div key={childPath} className="w-full flex flex-row justify-between items-center text-xs bg-white my-1.5 shadow rounded">
        <div className="w-full flex flex-col">
          <div className="flex flex-row justify-between items-center bg-color-0100 px-1 py-0.5 rounded-t">
            <span>{`${rowTitle || "Record"} #${rowIndex + 1}`}</span>
            {!readonly && (
              <IconButton
                id={`delete-item-${childPath}`}
                icon="Delete"
                ariaLabel="Delete"
                onClick={() => openDeleteDialog(childPath, rowIndex)}
                className="text-color-0500 hover:text-cds-red-0800"
                showShadow={false}
              />
            )}
          </div>
          <div className="p-1">{generateCells(NonEmptyCell, schema, uischema, childPath, enabled, cells)}</div>
        </div>
        {enabled && showSortButtons && (
          <div className="px-1 pt-0.5 text-xs flex flex-col items-center">
            {rowIndex > 0 && (
              <IconButton id={`moveup-item-${childPath}`} icon="ArrowUpward" ariaLabel="Move up" onClick={moveUp} disabled={!enableUp} />
            )}
            {rowIndex < records - 1 && (
              <IconButton id={`movedown-item-${childPath}`} icon="ArrowDownward" ariaLabel="Move down" onClick={moveDown} disabled={!enableDown} />
            )}
          </div>
        )}
      </div>
    );
  }
);

const TableRows = ({ data, path, schema, openDeleteDialog, moveUp, moveDown, uischema, config, enabled, cells, readonly }) => {
  const [expanded, setExpanded] = useState(false);
  const handleExpansion = useCallback(
    (panel) => (_event, expandedPanel) => {
      setExpanded(expandedPanel ? panel : false);
    },
    []
  );
  const isExpanded = (index) => expanded === composePaths(path, `${index}`);

  if (data === 0) {
    return <EmptyTable />;
  }
  const appliedUiSchemaOptions = merge({}, config, uischema.options);
  return (
    <>
      {range(data).map((index) => {
        const childPath = Paths.compose(path, `${index}`);
        return (
          <NonEmptyRow
            key={childPath}
            childPath={childPath}
            rowIndex={index}
            records={data}
            schema={schema}
            uischema={uischema}
            openDeleteDialog={openDeleteDialog}
            moveUpCreator={moveUp}
            moveDownCreator={moveDown}
            enableUp={index !== 0}
            enableDown={index !== data - 1}
            showSortButtons={appliedUiSchemaOptions.showSortButtons}
            rowTitle={appliedUiSchemaOptions.rowTitle || "Record"}
            enabled={enabled}
            cells={cells}
            path={path}
            expanded={isExpanded(index)}
            handleExpansion={handleExpansion}
            readonly={readonly}
          />
        );
      })}
    </>
  );
};

export default function TailwindTableControl(props) {
  const { label, path, config, schema, uischema, errors, openDeleteDialog, visible, enabled, data, readonly } = props;
  const appliedUiSchemaOptions = merge({}, config, schema.options, uischema.options);

  return (
    <div className="grow w-full mb-1.5">
      {visible && (
        <div className="w-full group border block rounded shadow mt-1 bg-slate-50">
          <TableToolbar
            errors={errors}
            label={label}
            addItem={props.addItem}
            path={path}
            enabled={enabled && data === 0}
            schema={schema}
            readonly={readonly}
          />
          <div className="w-full px-2 pb-2">
            <TableRows openDeleteDialog={openDeleteDialog} {...props} />
            {data !== 0 && !readonly && (
              <div className="w-full flex flex-row justify-end text-color-0500 select-none">
                <label>Add a {appliedUiSchemaOptions.rowTitle || "Record"}</label>
                <Tooltip id="tooltip-add" title={`Add to ${label}`} placement="left">
                  <IconButton
                    id={`add-item-${path}`}
                    icon="Add"
                    ariaLabel={`Add to ${label}`}
                    onClick={props.addItem(path, createDefaultValue(schema))}
                    iconSize="24"
                    className="text-color-0800 hover:text-color-0700"
                  />
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
