import { useEffect, useState } from "react";
import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";

import TailwindRenderer from "../../tailwindrender";
import { CustomDialog } from "../../utilities";

import WebSchema from "./schema/web_schema.json";
import SSHSchema from "./schema/ssh_schema.json";
import APISchema from "./schema/api_schema.json";
import { TestCaseTypesOneOf } from "../utils";
import { useHandleClose } from "../hooks";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject } from "../../../redux/actions/ProjectActions";

const defaults = [
  {},
  {
    settings: {
      timeout: 60000,
      method: "port"
    }
  },
  {
    settings: {
      screenshot: 3,
      sleep: {
        timeType: 0,
        interval: 0
      }
    }
  },
  {
    settings: {
      host: "127.0.0.1",
      port: 22,
      username: "root",
      password: "root",
      readyTimeout: 30000
    }
  }
];
const Schemas = Object.freeze([{}, APISchema, WebSchema, SSHSchema]);

function UpdateTestCaseDialog({ isOpen, onClose, testscenario, testcase, onUpdate, project }) {
  const dispatch = useDispatch();
  const [setIsChange, handleOnClose] = useHandleClose(onClose);
  const { settings, execSteps, ...rest } = testcase;
  const [nodeData, setNodeData] = useState(rest);
  const [payload, setPayoad] = useState({ settings, execSteps });
  if (isEmpty(testcase) || isEmpty(testcase?.id)) return null;

  useEffect(() => {
    const { settings, execSteps, ...rest } = testcase;
    setPayoad({ settings, execSteps });
    setNodeData(rest);
  }, [testcase]);

  const loadProject = (id) => id && dispatch(fetchProject(id));

  useEffect(() => {
    loadProject(project?.id);
  }, [project?.id]);

  const payloadSchema = Schemas[nodeData.type] || {};

  const { projectData } = useSelector((state) => state.project);

  const suggest = projectData?.settings?.env;
  try {
    const usch = JSON.stringify(payloadSchema.uischema);
    payloadSchema.uischema = JSON.parse(usch.replaceAll('"$AUTOCOMPLETE$"', JSON.stringify(suggest)));
  } catch (_) {}

  return (
    <CustomDialog
      open={isOpen}
      onClose={handleOnClose}
      title={
        <div className="text-sm font-bold text-color-label py-0">
          Edit Test Case
          <div className="inline-flex text-xs text-slate-400 justify-start items-center mx-4">
            <p>{`Test Suite: ${testscenario.name}, Test Case ID: `}</p>
            <p className="select-all pl-2">{testcase?.label}</p>
          </div>
        </div>
      }
      saveTitle="Save"
      onSave={() =>
        onUpdate({
          type: nodeData.type,
          title: nodeData.title,
          given: nodeData.given,
          when: nodeData.when,
          then: nodeData.then,
          tags: nodeData.tags,
          execSteps: payload.execSteps,
          settings: payload.settings
        })
      }
      customHeight="h-[90vh]"
      customWidth="w-[90vw]"
    >
      <TailwindRenderer
        {...getSchema(suggest)}
        data={nodeData}
        onChange={({ data }) => {
          if (!isEqual(nodeData, data)) {
            setIsChange(true);
            setNodeData(data);
            if (nodeData.type !== data.type) {
              setPayoad(defaults[data.type]);
            }
          }
        }}
      />
      <TailwindRenderer
        {...payloadSchema}
        data={payload}
        onChange={({ data }) => {
          if (!isEqual(payload, data)) {
            setIsChange(true);
            setPayoad(data);
          }
        }}
      />
    </CustomDialog>
  );
}

export default UpdateTestCaseDialog;

const getSchema = (suggest) => {
  const schema = {
    properties: {
      title: {
        type: "string",
        title: "Test Title",
        description: "Describe Test Case Title."
      },
      given: {
        type: "string",
        title: "Given",
        description:
          "The `given` part describes the state of the world before you begin the behavior you're specifying in this scenario. You can think of it as the pre-conditions to the test."
      },
      when: {
        type: "string",
        title: "When",
        description: "The `when` section is that behavior that you're specifying."
      },
      then: {
        type: "string",
        title: "Then",
        description: "Finally the `then` section describes the changes you expect due to the specified behavior."
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
  };

  const uischema = {
    label: "Test Case Settings",
    type: "CustomGroup",
    elements: [
      {
        type: "HorizontalLayout",
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
            scope: "#/properties/given",
            label: "Given",
            options: {
              multi: true,
              suggest
            }
          },
          {
            type: "Control",
            scope: "#/properties/when",
            label: "When",
            options: {
              multi: true,
              suggest
            }
          },
          {
            type: "Control",
            scope: "#/properties/then",
            label: "Then",
            options: {
              multi: true,
              suggest
            }
          }
        ]
      },
      {
        type: "HorizontalLayout",
        elements: [
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
    ]
  };

  return { uischema, schema };
};
