import React, { useEffect, useState } from "react";
import Spinner from "../utilities/Spinner";
import Centered from "../utilities/Centered";

const ReactComponentLoader = ({ page, ...props }) => {
  const [error, setError] = useState(null);
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousPage, setPreviousPage] = useState(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    if (page != previousPage) {
      import("./" + page)
        .then((m) => {
          setLoading(false);
          setComponent(m);
          setPreviousPage(page);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
          setError(e);
        });
    }
  }, []);

  function resolve(obj) {
    return obj && obj.__esModule ? obj.default : obj;
  }

  function render(loaded, props) {
    const Component = resolve(loaded);
    return <Component {...props} />;
  }

  if (loading) {
    return <Spinner />;
  } else if (error) {
    return <Centered>Page not found</Centered>;
  } else if (component) {
    return render(component, props);
  } else {
    return null;
  }
};

export default ReactComponentLoader;
