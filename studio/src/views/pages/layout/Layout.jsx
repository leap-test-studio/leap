import { useState, useEffect } from "react";
import Spinner from "../../utilities/Spinner";
import Centered from "../../utilities/Centered";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { ShowSnack } from "../../utilities/Snackbar";

function Layout({ disableLayout, base, sideBarItems, children, ...props }) {
  const { project, loaded, windowDimension, isProjectSelected, meta } = props;
  const [expandSB, setExpandSB] = useState(true);

  useEffect(() => {
    setExpandSB(windowDimension.winWidth > 1024);
  }, [windowDimension]);

  const showSidebar = loaded && window.innerWidth > 1000;

  if (disableLayout) return children;
  return (
    <main role="main" className="w-screen max-w-full h-screen bg-blue-100">
      <div className="flex flex-row h-full w-full">
        {showSidebar && (
          <Sidebar
            showSidebar={expandSB}
            base={base}
            mode={meta?.mode}
            sideBarItems={sideBarItems}
            maxContentHeight={windowDimension.maxContentHeight}
            menuClicked={() => {
              setExpandSB(!expandSB);
            }}
            {...props}
          />
        )}
        <div className="flex flex-col h-full w-full">
          <Header isProjectSelected={isProjectSelected} project={project} {...props} />
          <div className="h-full w-full px-1">
            {!loaded ? (
              <Centered>
                <Spinner>Loading</Spinner>
              </Centered>
            ) : (
              children
            )}
          </div>
        </div>
        <ShowSnack />
      </div>
    </main>
  );
}

export default Layout;
