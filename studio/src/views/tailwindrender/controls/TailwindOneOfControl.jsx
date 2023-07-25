import React, { useCallback, useState } from "react";
import isEmpty from "lodash/isEmpty";
import { createCombinatorRenderInfos, createDefaultValue, isOneOfControl, rankWith } from "@jsonforms/core";
import { JsonFormsDispatch, withJsonFormsOneOfProps } from "@jsonforms/react";
import CombinatorProperties from "../util/CombinatorProperties";
import ErrorMessage from "../renderers/common/ErrorMessage";
import CustomDialog from "../../utilities/CustomDialog";
import Select from "react-select";

const customStyles = {
  control: (styles) => ({
    ...styles,
    boxShadow: "none",
    padding: 0,
    minHeight: 24,
    borderStyle: "none"
  }),
  menuPortal: (base) => ({ ...base, zIndex: 100000 }),
  menu: (base) => ({ ...base, width: "auto", minWidth: "25%", zIndex: 100000 }),
  menuList: (base) => ({
    ...base,
    "::-webkit-scrollbar": {
      width: "8px",
      height: "0px"
    },
    "::-webkit-scrollbar-track": {
      background: "#f1f1f1"
    },
    "::-webkit-scrollbar-thumb": {
      background: "#154374"
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#555"
    }
  }),
  valueContainer: (styles) => ({
    ...styles,
    fontSize: 14,
    paddingTop: 0,
    paddingBottom: 0
  }),
  option: (base, { isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? "#154374" : "",
    color: isSelected ? "white" : "",
    ":active": {
      backgroundColor: "#154374"
    },
    ":hover": {
      backgroundColor: "#316eaf",
      color: "#fff"
    }
  }),
  placeholder: (base) => ({
    ...base,
    color: "rgb(100 116 139)",
    fontSize: 13
  }),
  input: (base) => ({
    ...base,
    fontSize: 13,
    borderStyle: "none",
    paddingTop: 0,
    paddingBottom: 0
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 2,
    paddingTop: 0,
    paddingBottom: 0
  })
};

const TailwindOneOfRenderer = React.memo(
  ({ handleChange, schema, path, renderers, cells, rootSchema, visible, indexOfFittingSchema, uischema, uischemas, data, errors }) => {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(indexOfFittingSchema || 0);
    const oneOfRenderInfos = createCombinatorRenderInfos(schema.oneOf, rootSchema, "oneOf", uischema, path, uischemas);
    const [oneOfValue, setOneOfValue] = useState(oneOfRenderInfos[0]);

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
      <>
        {visible && (
          <>
            <div className="w-full flex flex-col rounded border mt-0.5">
              {uischema.label?.length > 0 && (
                <div className="bg-color-0100 text-left text-sm text-color-primary select-none p-0.5 pl-2 rounded-t">{uischema.label}</div>
              )}
              <CombinatorProperties schema={schema} combinatorKeyword={"oneOf"} path={path} />
              <div className="flex flex-col min-w-0 break-words w-full p-2 rounded">
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
                <ErrorMessage path={path} errors={errors} />
              </div>
            </div>
            <CustomDialog title="Clear Form" open={open} onClose={cancel} onSave={confirm} saveIcon="Delete" saveTitle="Clear">
              <span id="confirm-message" className="px-3 py-5  text-center select-none">
                Your data will be cleared if you navigate away from this tab. Do you want to proceed?
              </span>
            </CustomDialog>
          </>
        )}
      </>
    );
  }
);

const DropDownMenu = ({ selected, handleChange, infos, path, renderers, cells, schema }) => {
  const selectedSchema = infos[selected]?.schema;
  const selectedUiSchema = infos[selected]?.uischema;
  const options = infos.map((info, index) => ({
    value: index,
    label: info.label
  }));
  return (
    <>
      <div className="w-full rounded-sm border">
        <div className="bg-color-0100 text-left text-xs text-color-primary select-none p-1 pl-2">
          Select OneOf {isEmpty(schema?.title) ? "" : " - " + schema.title}
        </div>
        <div className="p-1">
          <Select
            value={{ value: selected, label: infos[selected]?.label }}
            onChange={(option) => handleChange(option.value)}
            options={options}
            isSearchable={true}
            className="rounded text-slate-700 border placeholder-slate-500 shadow focus:shadow-md"
            styles={customStyles}
          />
        </div>
      </div>
      <JsonFormsDispatch schema={selectedSchema} uischema={selectedUiSchema} path={path} renderers={renderers} cells={cells} />
    </>
  );
};
export const tailwindOneOfControlTester = rankWith(1003, isOneOfControl);

export const TailwindOneOfControl = withJsonFormsOneOfProps(TailwindOneOfRenderer);
