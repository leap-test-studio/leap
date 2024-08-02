import { useState, useEffect } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { Centered, Spinner, ShowSnack } from "../../utilities";

function Layout({ disableLayout, base, sideBarItems, children, ...props }) {
  const { project, loaded, windowDimension, isProjectSelected, meta } = props;
  const [expandSB, setExpandSB] = useState(true);

  useEffect(() => {
    setExpandSB(windowDimension.winWidth > 1024);
  }, [windowDimension]);

  const showSidebar = loaded && window.innerWidth > 1000;

  if (disableLayout) return children;
  return (
    <main role="main" className="w-full max-w-full h-screen bg-slate-200/70">
      <div
        className="flex flex-row"
        style={{
          maxHeight: windowDimension.maxContentHeight
        }}
      >
        {showSidebar && (
          <Sidebar
            showSidebar={expandSB}
            base={base}
            mode={meta?.mode}
            sideBarItems={sideBarItems}
            menuClicked={() => setExpandSB(!expandSB)}
            {...windowDimension}
            {...props}
          />
        )}
        <div className="flex flex-col w-full">
          <Header
            isProjectSelected={isProjectSelected}
            project={project}
            {...props}
            showSidebar={expandSB}
            menuClicked={() => setExpandSB(!expandSB)}
          />
          <div
            className="w-full pl-2.5 overflow-y-scroll custom-scrollbar"
            style={{
              minHeight: windowDimension.maxContentHeight,
              maxHeight: windowDimension.maxContentHeight
            }}
          >
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
