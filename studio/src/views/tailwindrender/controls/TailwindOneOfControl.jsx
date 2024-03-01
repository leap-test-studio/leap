import React, { useCallback, useState } from "react";
import ReactSelect from "react-select";
import isEmpty from "lodash/isEmpty";
import { createCombinatorRenderInfos, createDefaultValue, isOneOfControl, rankWith } from "@jsonforms/core";
import { JsonFormsDispatch, withJsonFormsOneOfProps } from "@jsonforms/react";

import CombinatorProperties from "../util/CombinatorProperties";
import ErrorMessage from "../renderers/common/ErrorMessage";
import { ReactSelectCustomStyles } from "../common/Constants";
import { CustomDialog } from "../../utilities";
import { Card, CardHeader } from "../common/CardRenderer";

const TailwindOneOfRenderer = React.memo(
  ({ id, handleChange, schema, path, renderers, cells, rootSchema, visible, indexOfFittingSchema, uischema, uischemas, data, errors }) => {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(indexOfFittingSchema || 0);
    const oneOfRenderInfos = createCombinatorRenderInfos(schema.oneOf, rootSchema, "oneOf", uischema, path, uischemas);
    const [oneOfValue, setOneOfValue] = useState(oneOfRenderInfos[0]);

    if (!visible) return null;

    const cancel = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    const confirm = useCallback(() => {
      setOpen(false);
      if (!isEmpty(data)) {
        handleChange(path, createDefaultValue(schema));
      }
    }, [setOpen, setSelectedIndex, handleChange, path, schema, data]);

    const handleChangeOneOf = useCallback(
      (value) => {
        setOneOfValue(value);
        setSelectedIndex(value);
        if (!isEmpty(data)) {
          setOpen(true);
        }
      },
      [setOpen, data]
    );

    return (
      <Card>
        <CardHeader>{uischema.label}</CardHeader>
        <CombinatorProperties schema={schema} combinatorKeyword={"oneOf"} path={path} />
        <div className="flex flex-col break-words w-full p-0.5 pr-0">
          <DropDownMenu
            selected={selectedIndex}
            handleChange={handleChangeOneOf}
            infos={oneOfRenderInfos}
            path={path}
            renderers={renderers}
            cells={cells}
            oneOfValue={oneOfValue}
            schema={schema}
          />
          <ErrorMessage id={id} path={path} errors={errors} />
        </div>
        <CustomDialog title="Clear Form" open={open} onClose={cancel} onSave={confirm} saveIcon="Delete" saveTitle="Clear">
          <span id="confirm-message" className="px-3 py-5  text-center select-none">
            Your data will be cleared if you navigate away from this tab. Do you want to proceed?
          </span>
        </CustomDialog>
      </Card>
    );
  }
);

const DropDownMenu = ({ selected, handleChange, infos, path, renderers, cells, schema, ...props }) => {
  const selectedSchema = infos[selected]?.schema;
  const selectedUiSchema = infos[selected]?.uischema;
  const options = infos.map((info, index) => ({
    value: index,
    label: info.label
  }));
  return (
    <div className="mx-1">
      <div className="bg-color-0100 text-left text-[10px] text-color-primary select-none px-0.5 rounded-t">
        Select OneOf {isEmpty(schema?.title) ? "" : " - " + schema.title}
      </div>
      <ReactSelect
        value={{ value: selected, label: infos[selected]?.label }}
        onChange={(option) => handleChange(option.value)}
        options={options}
        isSearchable={true}
        className="rounded text-slate-700 border placeholder-slate-500 shadow focus:shadow-md"
        styles={ReactSelectCustomStyles}
      />
      <JsonFormsDispatch schema={selectedSchema} uischema={selectedUiSchema} path={path} renderers={renderers} cells={cells} />
    </div>
  );
};
export const tailwindOneOfControlTester = rankWith(1003, isOneOfControl);

export const TailwindOneOfControl = withJsonFormsOneOfProps(TailwindOneOfRenderer);
