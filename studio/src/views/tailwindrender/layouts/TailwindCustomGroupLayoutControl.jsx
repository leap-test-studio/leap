import { rankWith, uiTypeIs, withIncreasedRank } from "@jsonforms/core";
import { withJsonFormsLayoutProps } from "@jsonforms/react";

import { TailwindLayoutRenderer } from "../util/layout";
import { Card, CardHeader } from "../common/CardRenderer";

const TailwindCustomGroupLayout = ({ uischema, schema, path, visible, enabled, renderers, cells, direction }) => {
  if (!visible || !uischema) return null;
  return (
    <Card>
      <CardHeader>{uischema.label}</CardHeader>
      <TailwindLayoutRenderer
        layout="group"
        schema={schema}
        path={path}
        elements={uischema.elements}
        direction={direction}
        renderers={renderers}
        cells={cells}
        visible={visible}
        enabled={enabled}
      />
    </Card>
  );
};

export const TailwindCustomGroupLayoutControl = withJsonFormsLayoutProps(TailwindCustomGroupLayout);

export const tailwindCustomGroupLayoutControlTester = withIncreasedRank(1, rankWith(1001, uiTypeIs("CustomGroup")));
