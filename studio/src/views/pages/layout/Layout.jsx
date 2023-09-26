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
    <main
      role="main"
      className="w-full max-w-full h-full"
      style={{
        minHeight: windowDimension.winHeight,
        maxHeight: windowDimension.winHeight
      }}
    >
      <div
        className="flex flex-row"
        style={{
          minHeight: windowDimension.maxContentHeight,
          maxHeight: windowDimension.maxContentHeight
        }}
      >
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
        <div className="flex flex-col w-full">
          <Header isProjectSelected={isProjectSelected} project={project} {...props} />
          <div
            className="w-full px-1.5 overflow-y-scroll scrollbar-thin scrollbar-thumb-color-0800 scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full bg-blue-100"
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
