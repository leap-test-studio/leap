import { and, rankWith, schemaMatches, uiTypeIs } from "@jsonforms/core";
import { Control, withJsonFormsControlProps } from "@jsonforms/react";
import Input from "@mui/material/Input";
import merge from "lodash/merge";
import { useMemo } from "react";
import { useDebouncedChange } from "../util";
import { TailwindInputControl } from "./TailwindInputControl";

const findEnumSchema = (schemas) => schemas.find((s) => s.enum !== undefined && (s.type === "string" || s.type === undefined));
const findTextSchema = (schemas) => schemas.find((s) => s.type === "string" && s.enum === undefined);

const TailwindAutocompleteInputText = (props) => {
  const { data, config, className, id, enabled, uischema, isValid, path, handleChange, schema } = props;
  const enumSchema = findEnumSchema(schema.anyOf);
  const stringSchema = findTextSchema(schema.anyOf);
  const maxLength = stringSchema.maxLength;
  const appliedUiSchemaOptions = useMemo(() => merge({}, config, uischema.options), [config, uischema.options]);
  const inputProps = useMemo(() => {
    let propMemo = {};
    if (appliedUiSchemaOptions.restrict) {
      propMemo = { maxLength: maxLength };
    }
    if (appliedUiSchemaOptions.trim && maxLength !== undefined) {
      propMemo.size = maxLength;
    }
    propMemo.list = props.id + "datalist";
    return propMemo;
  }, [appliedUiSchemaOptions, props.id, maxLength]);
  const [inputText, onChange] = useDebouncedChange(handleChange, "", data, path);

  const dataList = (
    <datalist id={props.id + "datalist"}>
      {Array.isArray(enumSchema.enum) && enumSchema.enum.map((optionValue) => <option value={optionValue} key={optionValue} />)}
    </datalist>
  );
  return (
    <Input
      type="text"
      value={inputText || ""}
      onChange={onChange}
      className={className}
      id={id}
      disabled={!enabled}
      autoFocus={appliedUiSchemaOptions.focus}
      fullWidth={!appliedUiSchemaOptions.trim || maxLength === undefined}
      inputProps={inputProps}
      error={!isValid}
      endAdornment={dataList}
    />
  );
};

class TailwindAnyOfStringOrEnum extends Control {
  render() {
    return <TailwindInputControl {...this.props} input={TailwindAutocompleteInputText} />;
  }
}
const hasEnumAndText = (schemas) => {
  // idea: map to type,enum and check that all types are string and at least one item is of type enum,
  const enumSchema = findEnumSchema(schemas);
  const stringSchema = findTextSchema(schemas);
  const remainingSchemas = schemas.filter((s) => s !== enumSchema || s !== stringSchema);
  const wrongType = remainingSchemas.find((s) => s.type && s.type !== "string");
  return enumSchema && stringSchema && !wrongType;
};
const simpleAnyOf = and(
  uiTypeIs("Control"),
  schemaMatches((schema) => schema.hasOwnProperty("anyOf") && hasEnumAndText(schema.anyOf))
);

export const tailwindAnyOfStringOrEnumControlTester = rankWith(1005, simpleAnyOf);

export const TailwindAnyOfStringOrEnumControl = withJsonFormsControlProps(TailwindAnyOfStringOrEnum);
