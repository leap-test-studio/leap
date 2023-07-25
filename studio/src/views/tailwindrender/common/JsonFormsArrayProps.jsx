import { withJsonFormsArrayLayoutProps, withJsonFormsContext } from "@jsonforms/react";

export const withContextToArrayProps =
  (Component) =>
  ({ ctx, props }) => {
    return <Component {...props} ctx={ctx} />;
  };

export const withJsonFormsArrayProps = (Component) => withJsonFormsArrayLayoutProps(withJsonFormsContext(withContextToArrayProps(Component)));
