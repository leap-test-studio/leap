import React from "react";
import { RuleEffect } from "@jsonforms/core";

import WebContext from "../context/WebContext";
import TailwindRenderer from "../tailwindrender";

class TestPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
  }

  render() {
    const { project } = this.context;
    const { data } = this.state;
    if (project != null && project !== "") {
      return (
        <div className="container">
          <TailwindRenderer
            schema={schema}
            uischema={uischema}
            data={data}
            onChange={(d) =>
              this.setState({
                data: d.data
              })
            }
          />
        </div>
      );
    } else {
      return <div />;
    }
  }
}

TestPage.contextType = WebContext;
export default TestPage;

const schema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          questionType: {
            type: "string",
            enum: ["Choice A", "Choice B", "Choice C"]
          },
          answerText: {
            type: "string",
            description: "Note: you do not need an enumerator, this will be added automatically."
          },
          feedBackText: {
            type: "string",
            description: "Feedback text presented if the answer is selected"
          },
          scoreValue: {
            type: "integer",
            description: "If correct, the answer should have a score"
          }
        }
      }
    }
  }
};

const uischema = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/questions",
      label: "Questions (Use the + icon to add more questions.)",
      options: {
        showSortButtons: true,
        detail: {
          type: "VerticalLayout",
          elements: [
            {
              type: "Control",
              label: "Question Type",
              scope: "#/properties/questionType"
            },
            {
              type: "Control",
              label: "Answer Text",
              scope: "#/properties/answerText",
              rule: {
                effect: RuleEffect.SHOW,
                condition: {
                  type: "LEAF",
                  expectedValue: "Choice A",
                  scope: "#/properties/questionType"
                }
              }
            },
            {
              type: "Control",
              label: "FeedBack Text",
              scope: "#/properties/feedBackText",
              rule: {
                effect: RuleEffect.SHOW,
                condition: {
                  type: "LEAF",
                  expectedValue: "Choice B",
                  scope: "#/properties/questionType"
                }
              }
            },
            {
              type: "Control",
              label: "Score Value",
              scope: "#/properties/scoreValue",
              rule: {
                effect: RuleEffect.SHOW,
                condition: {
                  type: "LEAF",
                  expectedValue: "Choice C",
                  scope: "#/properties/questionType"
                }
              }
            }
          ]
        }
      }
    }
  ]
};
