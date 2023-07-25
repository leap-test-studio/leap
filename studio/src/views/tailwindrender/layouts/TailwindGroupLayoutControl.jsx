import { TailwindLayoutRenderer } from "../util/layout";
import { rankWith, uiTypeIs, withIncreasedRank } from "@jsonforms/core";
import { withJsonFormsLayoutProps, withJsonFormsContext } from "@jsonforms/react";

const TailwindGroupLayout = (properties) => {
  const { schema, path, visible, enabled, renderers, cells, direction } = properties.props;
  if (properties.ctx?.core?.schema?.definitions) {
    schema.definitions = properties.ctx?.core?.schema?.definitions;
  }
  const groupLayout = generateUISchema("#", schema);
  return (
    <>
      {visible && groupLayout && (
        <div className="w-full flex flex-col rounded border my-0.5">
          {groupLayout.label?.length > 0 && (
            <span className="bg-color-0100 text-left text-sm text-color-primary select-none p-0.5 pl-2 rounded-t">{groupLayout.label}</span>
          )}
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
        </div>
      )}
    </>
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
