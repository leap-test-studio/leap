import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";

import TailwindRenderer from "../../tailwindrender";
import { IconButton, IconRenderer } from "../../utilities";

import WebSchema from "./schema/web_schema.json";
import SSHSchema from "./schema/ssh_schema.json";
import APISchema from "./schema/api_schema.json";

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

function UpdateTestCaseDialog({ isOpen, onClose, testscenario, testcase, onUpdate, windowDimension }) {
  const { settings, execSteps, ...rest } = testcase;
  const [nodeData, setNodeData] = useState(rest);
  const [payload, setPayoad] = useState({ settings, execSteps });
  if (isEmpty(testcase) || isEmpty(testcase?.id)) return null;

  const payloadSchema = Schemas[nodeData.type] || {};

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden z-[10000]" onClose={() => null}>
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-600"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-600"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 bg-slate-400 bg-opacity-40" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-600 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-600 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-screen max-w-full h-screen flex flex-col bg-white">
                <div className="px-4 py-1 sm:px-6 flex justify-between border-b border-slate-300">
                  <Dialog.Title as="div" className="text-sm font-bold text-color-0500 py-0">
                    Configure Test Case
                    <div className="inline-flex text-xs text-slate-400 justify-start items-center mx-4">
                      <p className="select-none">{`Test Scenario: ${testscenario.name} - [`}</p>
                      <p className="select-all px-2">TCID-{testcase?.seqNo}</p>
                      <p className="select-none">]</p>
                    </div>
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-slate-300 hover:text-white focus:outline-none focus:ring-1"
                    onClick={() => onClose()}
                  >
                    <span className="sr-only">Close panel</span>
                    <IconRenderer icon="Close" className="h-5 w-5 text-red-500" aria-hidden="true" />
                  </button>
                </div>
                <div
                  className="w-full overflow-y-scroll custom-scrollbar"
                  style={{
                    minHeight: windowDimension?.maxContentHeight - 30,
                    maxHeight: windowDimension?.maxContentHeight - 30
                  }}
                >
                  <TailwindRenderer
                    schema={schema}
                    uischema={uischema}
                    data={nodeData}
                    onChange={({ data }) => {
                      if (!isEqual(nodeData, data)) {
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
                        setPayoad(data);
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end text-white p-1 mr-5 w-full border-t border-slate-300">
                  <button
                    type="button"
                    className="px-3 rounded focus:outline-none shadow-sm bg-slate-200 hover:bg-slate-100 text-slate-700"
                    onClick={onClose}
                  >
                    Close
                  </button>
                  <IconButton
                    title="Save"
                    icon="Save"
                    onClick={() =>
                      onUpdate({
                        ...nodeData,
                        ...payload
                      })
                    }
                  />
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default UpdateTestCaseDialog;

const schema = {
  properties: {
    enabled: {
      type: "boolean",
      default: true
    },
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
};

const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/type",
      options: {
        format: "radio"
      }
    },
    {
      type: "HorizontalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/enabled",
          label: "Enable Test Case?",
          options: {
            toggle: true
          }
        },
        {
          type: "Control",
          scope: "#/properties/given",
          label: "Given",
          options: {
            multi: true,
            isLarge: true
          }
        },
        {
          type: "Control",
          scope: "#/properties/when",
          label: "When",
          options: {
            multi: true,
            isLarge: true
          }
        },
        {
          type: "Control",
          scope: "#/properties/then",
          label: "Then",
          options: {
            multi: true,
            isLarge: true
          }
        }
      ]
    }
  ]
};
