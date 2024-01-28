import React from "react";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";

const Model = {
  schema: {
    properties: {
      given: {
        type: "string",
        description: "Define initial state."
      },
      when: {
        type: "string",
        description: "Define actions takes place."
      },
      then: {
        type: "string",
        description: "Define expected outcome."
      },
      type: {
        type: "integer",
        oneOf: [
          { const: 0, title: "Definition" },
          { const: 1, title: "REST-API" },
          { const: 2, title: "Web" },
          { const: 3, title: "SSH" }
        ]
      }
    },
    required: ["given", "when", "then"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/given",
        label: "Given",
        options: {
          multi: true
        }
      },
      {
        type: "Control",
        scope: "#/properties/when",
        label: "When",
        options: {
          multi: true
        }
      },
      {
        type: "Control",
        scope: "#/properties/then",
        label: "Then",
        options: {
          multi: true
        }
      },
      {
        type: "Control",
        scope: "#/properties/type",
        options: {
          format: "radio"
        }
      }
    ]
  }
};

function CreateTestCaseDialog({ showDialog, createTestCase, onClose }) {
  const [data, setData] = React.useState({
    type: 0,
    settings: {
      sleep: {
        interval: 2000,
        timeType: 0
      }
    }
  });
  return (
    <CustomDialog
      open={showDialog}
      onClose={() => {
        setData({});
        onClose();
      }}
      title="Create Test Case"
      saveTitle="Create"
      className="max-w-lg"
      onSave={() => {
        createTestCase(data);
        setData({});
      }}
      largeScreen={true}
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default CreateTestCaseDialog;
