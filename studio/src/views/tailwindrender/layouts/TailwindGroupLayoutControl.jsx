import { rankWith, uiTypeIs, withIncreasedRank } from "@jsonforms/core";
import { withJsonFormsLayoutProps, withJsonFormsContext } from "@jsonforms/react";

import { TailwindLayoutRenderer } from "../util/layout";
import { Card, CardHeader } from "../common/CardRenderer";

const TailwindGroupLayout = (properties) => {
  const { schema, path, visible, enabled, renderers, cells, direction } = properties.props;
  if (properties.ctx?.core?.schema?.definitions) {
    schema.definitions = properties.ctx?.core?.schema?.definitions;
  }
  const groupLayout = generateUISchema("#", schema);
  if (!visible || !groupLayout) return null;
  return (
    <Card>
      <CardHeader>{groupLayout.label}</CardHeader>
      <TailwindLayoutRenderer
        layout="group"
        schema={schema}
        path={path}
        elements={groupLayout.elements}
        direction={direction}
        renderers={renderers}
        cells={cells}
        visible={visible}
        enabled={enabled}
      />
    </Card>
  );
};

export const TailwindGroupLayoutControl = withJsonFormsLayoutProps(withJsonFormsContext(TailwindGroupLayout));

export const tailwindGroupLayoutControlTester = withIncreasedRank(1, rankWith(1001, uiTypeIs("Group")));

function generateUISchema(scope, rootSchema, layoutType = "Group") {
  if (rootSchema == null) return null;
  try {
    const label = rootSchema.title;
    switch (rootSchema.type) {
      case "object":
        const uischema = {
          type: layoutType,
          label,
          scope,
          elements: []
        };

        let HorizontalLayout = {
          type: "HorizontalLayout",
          elements: []
        };
        rootSchema.properties &&
          Object.keys(rootSchema.properties).forEach((property) => {
            const childKey = scope + "/properties/" + property;
            const schema = rootSchema.properties[property];

            if (schema != null) {
              if (
                ["object", "array"].includes(schema.type) ||
                schema.allOf != null ||
                schema.oneOf != null ||
                schema.anyOf != null ||
                schema["$ref"]
              ) {
                uischema.elements.push({
                  type: "Control",
                  scope: childKey,
                  label: schema.title,
                  options: schema.options
                });
              } else {
                const genSchem = generateUISchema(childKey, schema);
                if (genSchem) {
                  HorizontalLayout.elements.push(genSchem);
                }
              }
            }
          });

        if (HorizontalLayout.elements.length > 0) {
          uischema.elements.push(HorizontalLayout);
        }
        return uischema;
      case "number":
      case "integer":
      case "string":
        return {
          type: "Control",
          scope,
          label,
          options: rootSchema.options
        };
      case "boolean":
        return {
          type: "Control",
          label,
          scope,
          options: {
            format: "radio"
          }
        };
      case "array":
        const arraySchema = {
          type: "Control",
          label,
          scope
        };
        if (typeof rootSchema.items === "object") {
          arraySchema.options = {
            disableExpand: true,
            showSortButtons: true,
            rowTitle: "Item",
            detail: generateUISchema("#", rootSchema.items)
          };
        }
        return arraySchema;
      default:
    }
    if (Array.isArray(rootSchema.allOf) || Array.isArray(rootSchema.oneOf)) {
      return {
        type: "Control",
        scope,
        label,
        options: rootSchema.options
      };
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}
