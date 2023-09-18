import { useContext, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import snakeCase from "lodash/snakeCase";
import IconRenderer from "../../IconRenderer";
import Tooltip from "../../utilities/Tooltip";
import WebContext from "../../context/WebContext";
import Brand from "./Brand";
import LogoutButton from "./LogoutButton";
import UserInfo from "./UserInfo";

export default function Sidebar({ showSidebar, base, mode, sideBarItems, menuClicked, ...props }) {
  const isSmallScreen = window.innerHeight < 800;
  return (
    <aside
      className={`transition-all duration-500 z-[9999] ${
        showSidebar ? "w-[15%]" : "w-[50px]"
      } bg-color-1000 text-slate-100 border-r flex flex-col justify-between cursor-pointer h-screen`}
    >
      <div className="h-[8%] border-b border-slate-300 mx-2 flex items-center">
        <Brand showTitle={showSidebar} {...props} />
      </div>
      <div className="flex flex-col justify-between h-[92%]">
        <SidebarRender showSidebar={showSidebar} isSmallScreen={isSmallScreen}>
          {sideBarItems.map((item, index) =>
            item.divider && (item.mode === undefined || item.mode?.includes(mode)) ? (
              <SidebarDividerItem key={index} title={item.title} isSmallScreen={isSmallScreen} />
            ) : item.mode === undefined || item.mode?.includes(mode) ? (
              <SidebarItem key={index} showTitle={showSidebar} base={base} isSmallScreen={isSmallScreen} {...item} />
            ) : null
          )}
        </SidebarRender>
        <UserInfo showTitle={showSidebar} {...props} />
        <div className={`${showSidebar ? "inline-flex" : "flex flex-col mb-2"} w-full justify-between items-center`}>
          <LogoutButton showTitle={showSidebar} {...props} />
          <div className="h-6 w-6 flex shadow-lg hover:bg-slate-300 hover:shadow-2xl rounded-full justify-center items-center bg-slate-200 border border-slate-400 mr-2">
            <IconRenderer
              icon={showSidebar ? "ArrowBackIos" : "ArrowForwardIos"}
              className="text-color-1000 pl-1"
              fontSize="10"
              onClick={menuClicked}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarRender({ children }) {
  return <div className="flex flex-col p-1 pt-2 select-none h-full">{children}</div>;
}

function SidebarDividerItem({ title }) {
  return (
    <div
      className="m-0.5 inline-flex items-start border-t-[1px] border-slate-100"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <p className="text-xs font-thin tracking-tighter">{title}</p>
    </div>
  );
}

function SidebarItem({ showTitle, base, path, title, icon, openNewTab = false, isSmallScreen }) {
  const [hovered, setHovered] = useState(false);
  const actualPath = `${base}/${path}`;
  const location = useLocation();
  const { pathname } = location;
  const id = snakeCase(title).replace(/_/g, "-");
  const { changeTestScenario } = useContext(WebContext);

  return (
    <NavLink
      id={`nav-page-${id}`}
      to={!openNewTab ? actualPath : pathname}
      className={`relative inline-flex items-center w-full transition-all duration-300 ease-in-out ${isSmallScreen ? "mb-1" : "py-1 mb-2"} ${
        pathname.includes(path)
          ? "z-0 bg-slate-200 text-slate-700 border border-l-4 border-l-cds-blue-0700"
          : hovered
          ? "bg-slate-200 text-slate-700"
          : "hover:text-slate-300"
      } ${!showTitle ? "justify-center rounded" : "rounded-r-full"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (openNewTab) {
          openInNewTab(path);
        } else {
          changeTestScenario(null);
        }
      }}
    >
      {icon && (
        <div className="mx-2.5 z-10">
          <Tooltip title={!showTitle ? title : undefined}>
            <IconRenderer icon={icon} className="h-4 w-4" viewBox={`${isSmallScreen ? "0 0 30 30" : "0 0 25 25"}`} />
          </Tooltip>
        </div>
      )}
      {showTitle && <label className={`break-words ${isSmallScreen ? "text-[10px]" : "text-xs"} tracking-wide z-10`}>{title}</label>}
    </NavLink>
  );
}

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};
