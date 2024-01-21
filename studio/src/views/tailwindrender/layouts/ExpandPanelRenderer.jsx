import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import merge from "lodash/merge";
import React, { useMemo, useCallback } from "react";
import { JsonFormsDispatch, withJsonFormsContext } from "@jsonforms/react";
import { composePaths, findUISchema, moveDown, moveUp, Resolve, update, getFirstPrimitiveProp, getData } from "@jsonforms/core";
import Accordion from "../../utilities/Accordion";
import IconButton from "../../utilities/IconButton";
import Tooltip from "../../utilities/Tooltip";

const ExpandPanelRenderer = React.memo((props) => {
  const {
    childLabel,
    childPath,
    totalItems,
    index,
    expanded,
    moveDown,
    moveUp,
    enableMoveDown,
    enableMoveUp,
    handleExpansion,
    addItem,
    removeItems,
    path,
    rootSchema,
    schema,
    uischema,
    uischemas,
    renderers,
    cells,
    config,
    readonly = false
  } = props;
  const foundUISchema = useMemo(
    () => findUISchema(uischemas, schema, uischema.scope, path, undefined, uischema, rootSchema),
    [uischemas, schema, path, uischema, rootSchema]
  );
  const appliedUiSchemaOptions = merge({}, config, schema.options, uischema.options);

  let showAddItem = true;
  if (!isNaN(appliedUiSchemaOptions.maximum)) {
    showAddItem = totalItems < Number(appliedUiSchemaOptions.maximum);
  }

  return (
    <div key={index} className="w-full flex flex-row justify-between items-center text-xs border-b p-0.5 px-2 bg-white">
      {!appliedUiSchemaOptions.disableExpand ? (
        <Accordion
          pid={childPath}
          title={`${appliedUiSchemaOptions.rowTitle || "Record"} #${index + 1} ${!isEmpty(childLabel) ? "- " + childLabel : ""}`}
          defaultOpen={expanded}
          disableOnMouseHover={true}
          onChange={handleExpansion(childPath)}
        >
          <JsonFormsDispatch schema={schema} uischema={foundUISchema} path={childPath} key={childPath} renderers={renderers} cells={cells} />
        </Accordion>
      ) : (
        <div className="flex flex-row w-full">
          <p>{`${appliedUiSchemaOptions.rowTitle || "Record"} #${index + 1}`}</p>
          <JsonFormsDispatch schema={schema} uischema={foundUISchema} path={childPath} key={childPath} renderers={renderers} cells={cells} />
        </div>
      )}
      <div className="flex flex-row">
        {!readonly && (
          <div className="flex flex-col items-center justify-center">
            <Tooltip title={`Delete this ${appliedUiSchemaOptions.rowTitle || "Record"} ?`}>
              <IconButton
                id={`${path}-delete-row-${index}`}
                icon="Delete"
                ariaLabel="Delete Record"
                onClick={removeItems(path, [index])}
                className="text-color-0500 hover:text-cds-red-0800"
                showShadow={false}
              />
            </Tooltip>
            {showAddItem && (
              <Tooltip title={`Clone and add ${appliedUiSchemaOptions.rowTitle || "Record"}`}>
                <IconButton id={`delete-add-${index}`} icon="FileCopy" ariaLabel="Add Record" onClick={addItem(path, [index])} showShadow={false} />
              </Tooltip>
            )}
          </div>
        )}
        {appliedUiSchemaOptions.showSortButtons && (
          <div className="px-1 pt-0.5 text-xs flex flex-col items-center">
            {enableMoveUp && (
              <IconButton id={`moveup-item-${childPath}`} icon="ArrowUpward" ariaLabel="Move up" onClick={moveUp(path, index)} bg="" />
            )}
            {enableMoveDown && (
              <IconButton id={`movedown-item-${childPath}`} icon="ArrowDownward" ariaLabel="Move down" onClick={moveDown(path, index)} bg="" />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Maps state to dispatch properties of an expand pandel control.
 *
 * @param dispatch the store"s dispatch method
 * @returns {DispatchPropsOfArrayControl} dispatch props of an expand panel control
 */
export const useDispatchToExpandPanelProps = (dispatch) => ({
  addItem: useCallback(
    (path, toAdd) => (ev) => {
      const insert = (arr, index, newItem) => [
        // part of the array before the specified index
        ...arr.slice(0, index),
        // inserted item
        newItem,
        // part of the array after the specified index
        ...arr.slice(index)
      ];
      ev.stopPropagation();
      dispatch(
        update(path, (array) => {
          toAdd
            .sort()
            .reverse()
            .forEach((i) => {
              array = insert(array, i + 1, array[i]);
            });
          return array;
        })
      );
    },
    [dispatch]
  ),
  removeItems: useCallback(
    (path, toDelete) => (ev) => {
      ev.stopPropagation();
      dispatch(
        update(path, (array) => {
          toDelete
            .sort()
            .reverse()
            .forEach((i) => array.splice(i, 1));
          return array;
        })
      );
    },
    [dispatch]
  ),
  moveUp: useCallback(
    (path, toMove) => (ev) => {
      ev.stopPropagation();
      dispatch(
        update(path, (array) => {
          moveUp(array, toMove);
          return array;
        })
      );
    },
    [dispatch]
  ),
  moveDown: useCallback(
    (path, toMove) => (ev) => {
      ev.stopPropagation();
      dispatch(
        update(path, (array) => {
          moveDown(array, toMove);
          return array;
        })
      );
    },
    [dispatch]
  )
});

/**
 * Map state to control props.
 * @param state the JSON Forms state
 * @param ownProps any own props
 * @returns {StatePropsOfControl} state props for a control
 */
export const withContextToExpandPanelProps =
  (Component) =>
  ({ ctx, props }) => {
    const dispatchProps = useDispatchToExpandPanelProps(ctx.dispatch);
    const { childLabelProp, schema, path, index, uischemas } = props;
    const childPath = composePaths(path, `${index}`);
    const children = Resolve.data(ctx.core.data, path);
    const childData = Resolve.data(ctx.core.data, childPath);
    const childLabel = childLabelProp ? get(childData, childLabelProp, "") : get(childData, getFirstPrimitiveProp(schema), "");
    return (
      <Component
        {...props}
        {...dispatchProps}
        childLabel={childLabel}
        childPath={childPath}
        uischemas={uischemas}
        totalItems={Array.isArray(children) ? children.length : 0}
      />
    );
  };

export const withJsonFormsExpandPanelProps = (Component) => withJsonFormsContext(withContextToExpandPanelProps(Component));

export default withJsonFormsExpandPanelProps(ExpandPanelRenderer);
