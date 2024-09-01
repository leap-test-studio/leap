import React from "react";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";
import { TestCaseTypesOneOf } from "../utils";

const Model = {
  schema: {
    properties: {
      title: {
        type: "string",
        title: "Test Title",
        description: "Describe Test Case Title."
      },
      type: {
        type: "integer",
        oneOf: TestCaseTypesOneOf,
        title: "Test Type",
        description: "Type of Test Case. Some options: Web Automation, REST-API Automation, SSH Commands etc,."
      },
      tags: {
        description: "Tags",
        items: {
          type: "string"
        },
        title: "Tags",
        type: "array"
      }
    },
    required: ["title"]
  },
  uischema: {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/title",
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
      },
      {
        type: "Control",
        label: "Tags",
        scope: "#/properties/tags"
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
      onSave={() => {
        createTestCase(data);
        setData({});
      }}
      customWidth="w-[50vw]"
    >
      <TailwindRenderer {...Model} data={data} onChange={(d) => setData(d.data)} />
    </CustomDialog>
  );
}

export default CreateTestCaseDialog;
