import React, { useState } from "react";
import merge from "lodash/merge";
import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Stepper from "@mui/material/Stepper";
import { and, categorizationHasCategory, isVisible, optionIs, rankWith, uiTypeIs } from "@jsonforms/core";
import { withJsonFormsLayoutProps } from "@jsonforms/react";
import { TailwindLayoutRenderer, withAjvProps } from "../util";

const buttonWrapperStyle = {
  textAlign: "right",
  width: "100%",
  margin: "1em auto"
};
const buttonNextStyle = {
  float: "right"
};
const buttonStyle = {
  marginRight: "1em"
};

const TailwindCategorizationStepperLayoutRenderer = (props) => {
  const { data, path, renderers, schema, uischema, visible, cells, config, ajv } = props;
  const [activeCategory, setActiveCategory] = useState(0);

  if (!visible) return null;

  const handleStep = (step) => {
    setActiveCategory(step);
  };

  const appliedUiSchemaOptions = merge({}, config, uischema.options);

  const categories = uischema.elements.filter((category) => isVisible(category, data, undefined, ajv));
  const childProps = {
    elements: categories[activeCategory].elements,
    schema,
    path,
    direction: "column",
    visible,
    renderers,
    cells
  };
  return (
    <>
      <Stepper activeStep={activeCategory} nonLinear>
        {Array.isArray(categories) &&
          categories.map((e, idx) => (
            <Step key={e.label}>
              <StepButton onClick={() => handleStep(idx)}>{e.label}</StepButton>
            </Step>
          ))}
      </Stepper>
      <div>
        <TailwindLayoutRenderer layout="categorization-step" {...childProps} />
      </div>
      {!!appliedUiSchemaOptions.showNavButtons ? (
        <div style={buttonWrapperStyle}>
          <Button
            style={buttonNextStyle}
            variant="contained"
            color="primary"
            disabled={activeCategory >= categories.length - 1}
            onClick={() => handleStep(activeCategory + 1)}
          >
            Next
          </Button>
          <Button
            style={buttonStyle}
            color="secondary"
            variant="contained"
            disabled={activeCategory <= 0}
            onClick={() => handleStep(activeCategory - 1)}
          >
            Previous
          </Button>
        </div>
      ) :
        null
      }
    </>
  );
};

export const tailwindCategorizationStepperControlTester = rankWith(
  2,
  and(uiTypeIs("Categorization"), categorizationHasCategory, optionIs("variant", "stepper"))
);

export const TailwindCategorizationStepperControl = withJsonFormsLayoutProps(withAjvProps(TailwindCategorizationStepperLayoutRenderer));
