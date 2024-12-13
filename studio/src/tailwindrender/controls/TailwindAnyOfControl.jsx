import React, { useCallback, useState } from "react";
import { createCombinatorRenderInfos, isAnyOfControl, rankWith } from "@jsonforms/core";
import { withJsonFormsAnyOfProps } from "@jsonforms/react";

import TabRenderer from "../renderers/common/TabRenderer";
import ErrorMessage from "../renderers/common/ErrorMessage";
import { Card, CardHeader } from "../common/CardRenderer";

const TailwindAnyOfRenderer = React.memo(
  ({ id, schema, rootSchema, indexOfFittingSchema, visible, path, renderers, cells, uischema, uischemas, errors }) => {
    const [selectedAnyOf, setSelectedAnyOf] = useState(indexOfFittingSchema || 0);
    const handleChange = useCallback((value) => setSelectedAnyOf(value), [setSelectedAnyOf]);

    if (!visible) return null;

    const anyOf = "anyOf";
    const anyOfRenderInfos = createCombinatorRenderInfos(schema.anyOf, rootSchema, anyOf, uischema, path, uischemas);

    return (
      <Card>
        <CardHeader>{uischema.label}</CardHeader>
        <TabRenderer selected={selectedAnyOf} onChange={handleChange} infos={anyOfRenderInfos} path={path} renderers={renderers} cells={cells} />
        <ErrorMessage id={id} path={path} errors={errors} />
      </Card>
    );
  }
);

export const tailwindAnyOfControlTester = rankWith(1003, isAnyOfControl);

export const TailwindAnyOfControl = withJsonFormsAnyOfProps(TailwindAnyOfRenderer);
