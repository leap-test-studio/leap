import { useRef } from "react";
import { JsonForms } from "@jsonforms/react";
import { createAjv } from "@jsonforms/core";
import isEmpty from "lodash/isEmpty";

import { tailwindBooleanCellTester, TailwindBooleanCell } from "./cells/TailwindBooleanCell";
import { tailwindDateCellTester, TailwindDateCell } from "./cells/TailwindDateCell";
import { tailwindEnumCellTester, TailwindEnumCell } from "./cells/TailwindEnumCell";
import { tailwindIntegerCellTester, TailwindIntegerCell } from "./cells/TailwindIntegerCell";
import { tailwindNumberCellTester, TailwindNumberCell } from "./cells/TailwindNumberCell";
import { tailwindNumberFormatCellTester, TailwindNumberFormatCell } from "./cells/TailwindNumberFormatCell";
import { tailwindOneOfEnumCellTester, TailwindOneOfEnumCell } from "./cells/TailwindOneOfEnumCell";
import { tailwindTextCellTester, TailwindTextCell } from "./cells/TailwindTextCell";
import { tailwindTimeCellTester, TailwindTimeCell } from "./cells/TailwindTimeCell";

import { tailwindTextControlTester, TailwindTextControl } from "./controls/TailwindTextControl";
import { tailwindNumberControlTester, TailwindNumberControl } from "./controls/TailwindNumberControl";
import { tailwindTimeIntegerControlTester, TailwindTimeIntegerControl } from "./controls/TailwindTimeIntegerControl";
import { tailwindIntegerControlTester, TailwindIntegerControl } from "./controls/TailwindIntegerControl";
import { tailwindEnumTester, TailwindEnumControl } from "./controls/TailwindEnumControl";
import { tailwindBooleanControlTester, TailwindBooleanControl } from "./controls/TailwindBooleanControl";
import { tailwindBooleanToggleControlTester, TailwindBooleanToggleControl } from "./controls/TailwindBooleanToggleControl";
import { tailwindPrimitiveArrayControlTester, TailwindPrimitiveArrayControl } from "./controls/TailwindPrimitiveArrayControl";
import { tailwindObjectArrayControlTester, TailwindObjectArrayControl } from "./controls/TailwindObjectArrayControl";
import { tailwindAllOfControlTester, TailwindAllOfControl } from "./controls/TailwindAllOfControl";
import { tailwindAnyOfControlTester, TailwindAnyOfControl } from "./controls/TailwindAnyOfControl";
import { tailwindOneOfControlTester, TailwindOneOfControl } from "./controls/TailwindOneOfControl";
import { tailwindRadioGroupControlTester, TailwindRadioGroupControl } from "./controls/TailwindRadioGroupControl";
import { tailwindOneOfRadioGroupControlTester, TailwindOneOfRadioGroupControl } from "./controls/TailwindOneOfRadioGroupControl";
import { tailwindObjectControlTester, TailwindObjectControl } from "./controls/TailwindObjectControl";
import { tailwindDateTimeControlTester, TailwindDateTimeControl } from "./controls/TailwindDateTimeControl";
import { tailwindDateControlTester, TailwindDateControl } from "./controls/TailwindDateControl";
import { tailwindTimeControlTester, TailwindTimeControl } from "./controls/TailwindTimeControl";
import { tailwindSliderControlTester, TailwindSliderControl } from "./controls/TailwindSliderControl";
import { tailwindNativeControlTester, TailwindNativeControl } from "./controls/TailwindNativeControl";
import { tailwindOneOfEnumControlTester, TailwindOneOfEnumControl } from "./controls/TailwindOneOfEnumControl";

import { tailwindGroupLayoutControlTester, TailwindGroupLayoutControl } from "./layouts/TailwindGroupLayoutControl";
import { tailwindCustomGroupLayoutControlTester, TailwindCustomGroupLayoutControl } from "./layouts/TailwindCustomGroupLayoutControl";
import { tailwindHorizontalLayoutTester, TailwindHorizontalLayoutControl } from "./layouts/TailwindHorizontalLayoutControl";
import { tailwindVerticalLayoutTester, TailwindVerticalLayoutControl } from "./layouts/TailwindVerticalLayoutControl";
import { tailwindCategorizationControlTester, TailwindCategorizationControl } from "./layouts/TailwindCategorizationLayout";
import { tailwindCategorizationStepperControlTester, TailwindCategorizationStepperControl } from "./layouts/TailwindCategorizationStepperLayout";
import { tailwindArrayLayoutControlTester, TailwindArrayLayoutControl } from "./layouts/TailwindArrayLayoutRenderer";

import { tailwindLabelTester, TailwindLabel } from "./additional/TailwindLabelRenderer";
import { tailwindListWithDetailTester, TailwindListWithDetail } from "./additional/TailwindListWithDetailRenderer";
import { tailwindAnyOfStringOrEnumControlTester, TailwindAnyOfStringOrEnumControl } from "./controls/TailwindAnyOfStringOrEnumControl";
import { tailwindEnumArrayControlTester, TailwindEnumArrayControl } from "./renderers/TailwindEnumArrayRenderer";

const ajv = createAjv();

ajv.addFormat(
  "ip",
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/
);

const hexStringPattern = /^[0-9a-fA-F]+$/;

ajv.addFormat("mac", /^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/);

ajv.addFormat("numeric-string", /^\d+$/);

ajv.addFormat("hex-string", hexStringPattern);

ajv.addFormat("alphanumeric-string", {
  type: "string",
  validate: (data) => data.length > 0 && /^[a-zA-Z_]+$/.test(data[0]) && /^[0-9a-zA-Z+_-]+$/.test(data)
});

ajv.addFormat("bit-string", /^[0-1]+$/);

ajv.addFormat("octet-string", {
  type: "string",
  validate: (data) => {
    if (data == null || data.length % 2 !== 0) return false;
    return hexStringPattern.test(data);
  }
});

ajv.addFormat("printable-string", /^[\x20-\x7E]+$/);

ajv.addFormat("vdusim.tar.gz", {
  type: "string",
  validate: (data) => {
    let isUrlCorrect = false;
    try {
      new URL(data);
      isUrlCorrect = true;
    } catch (_) {}
    return isUrlCorrect && /vdusim.tar.gz/.test(data);
  }
});

const Cells = [
  { tester: tailwindBooleanCellTester, cell: TailwindBooleanCell },
  { tester: tailwindDateCellTester, cell: TailwindDateCell },
  { tester: tailwindEnumCellTester, cell: TailwindEnumCell },
  { tester: tailwindIntegerCellTester, cell: TailwindIntegerCell },
  { tester: tailwindNumberCellTester, cell: TailwindNumberCell },
  { tester: tailwindNumberFormatCellTester, cell: TailwindNumberFormatCell },
  { tester: tailwindOneOfEnumCellTester, cell: TailwindOneOfEnumCell },
  { tester: tailwindTextCellTester, cell: TailwindTextCell },
  { tester: tailwindTimeCellTester, cell: TailwindTimeCell }
];

const Renderers = [
  // controls
  { tester: tailwindPrimitiveArrayControlTester, renderer: TailwindPrimitiveArrayControl },
  { tester: tailwindObjectArrayControlTester, renderer: TailwindObjectArrayControl },
  { tester: tailwindBooleanControlTester, renderer: TailwindBooleanControl },
  { tester: tailwindBooleanToggleControlTester, renderer: TailwindBooleanToggleControl },
  { tester: tailwindNativeControlTester, renderer: TailwindNativeControl },
  { tester: tailwindEnumTester, renderer: TailwindEnumControl },
  { tester: tailwindTimeIntegerControlTester, renderer: TailwindTimeIntegerControl },
  { tester: tailwindIntegerControlTester, renderer: TailwindIntegerControl },
  { tester: tailwindNumberControlTester, renderer: TailwindNumberControl },
  { tester: tailwindTextControlTester, renderer: TailwindTextControl },
  { tester: tailwindDateTimeControlTester, renderer: TailwindDateTimeControl },
  { tester: tailwindDateControlTester, renderer: TailwindDateControl },
  { tester: tailwindTimeControlTester, renderer: TailwindTimeControl },
  { tester: tailwindSliderControlTester, renderer: TailwindSliderControl },
  { tester: tailwindObjectControlTester, renderer: TailwindObjectControl },
  { tester: tailwindAllOfControlTester, renderer: TailwindAllOfControl },
  { tester: tailwindAnyOfControlTester, renderer: TailwindAnyOfControl },
  { tester: tailwindOneOfControlTester, renderer: TailwindOneOfControl },
  { tester: tailwindRadioGroupControlTester, renderer: TailwindRadioGroupControl },
  { tester: tailwindOneOfRadioGroupControlTester, renderer: TailwindOneOfRadioGroupControl },
  { tester: tailwindOneOfEnumControlTester, renderer: TailwindOneOfEnumControl },

  // layouts
  { tester: tailwindCustomGroupLayoutControlTester, renderer: TailwindCustomGroupLayoutControl },
  { tester: tailwindGroupLayoutControlTester, renderer: TailwindGroupLayoutControl },
  { tester: tailwindHorizontalLayoutTester, renderer: TailwindHorizontalLayoutControl },
  { tester: tailwindVerticalLayoutTester, renderer: TailwindVerticalLayoutControl },
  { tester: tailwindCategorizationControlTester, renderer: TailwindCategorizationControl },
  { tester: tailwindCategorizationStepperControlTester, renderer: TailwindCategorizationStepperControl },
  { tester: tailwindArrayLayoutControlTester, renderer: TailwindArrayLayoutControl },

  // additional
  { tester: tailwindLabelTester, renderer: TailwindLabel },
  { tester: tailwindListWithDetailTester, renderer: TailwindListWithDetail },
  { tester: tailwindAnyOfStringOrEnumControlTester, renderer: TailwindAnyOfStringOrEnumControl },
  { tester: tailwindEnumArrayControlTester, renderer: TailwindEnumArrayControl }
];

export default function TailwindRenderer({ id, ...props }) {
  if (props.isValid) {
    props.isValid(ajv.validate(props.schema, props.data));
  }
  const viewRef = useRef();
  return (
    <div ref={viewRef} id={id} className="w-full">
      {!isEmpty(props.schema) && <JsonForms cells={Cells} renderers={Renderers} readonly={props?.readonly} {...props} ajv={ajv} />}
    </div>
  );
}
