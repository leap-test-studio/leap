import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import snakeCase from "lodash/snakeCase";
import IconRenderer from "../../IconRenderer";
import Tooltip from "../../utilities/Tooltip";
import LogoutButton from "./LogoutButton";
import UserInfo from "./UserInfo";
import LogoRenderer from "./LogoRenderer";

export default function Sidebar({ showSidebar, base, mode, sideBarItems, headerHeight, maxContentHeight, menuClicked, isSetupSelected, ...props }) {
  const isSmallScreen = maxContentHeight < 800;
  return (
    <aside
      className={`transition-all duration-500 ${showSidebar ? "w-[12%]" : "w-12"} bg-sky-950 text-slate-100 flex flex-col cursor-pointer h-screen`}
    >
      <div className={`border-b mx-2 flex flex-row items-center justify-center ${!showSidebar && "py-2"}`}>
        <LogoRenderer className="m-1 h-5 w-5" name={props?.product.name} />
        {showSidebar && (
          <div className="cursor-pointer text-md tracking-normal font-normal flex flex-col mx-2">
            <label className="lg:tracking-wider text-base">{props?.product.name}</label>
            <p className="tracking-tighter font-normal text-orange-500" style={{ fontSize: 10 }}>
              {props?.product.description}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-between h-[92%]">
        <SidebarRender showSidebar={showSidebar} isSmallScreen={isSmallScreen} {...props}>
          {sideBarItems.map((item, index) =>
            (item.divider && item.mode?.includes(mode)) || (item.mode === undefined && item.divider) ? (
              <SidebarDividerItem key={index} title={item.title} isSmallScreen={isSmallScreen} />
            ) : item.mode === undefined || item.mode?.includes(mode) ? (
              <SidebarItem key={index} showTitle={showSidebar} base={base} isSmallScreen={isSmallScreen} {...item} />
            ) : null
          )}
        </SidebarRender>
        <UserInfo showTitle={showSidebar} {...props} />
        <div className={`flex ${showSidebar ? "flex-row" : "flex-col mb-2"} w-full justify-between items-center`}>
          <LogoutButton showTitle={showSidebar} {...props} />
          <div className="h-6 w-6 flex shadow-lg hover:bg-slate-300 hover:shadow-2xl rounded-full justify-center items-center bg-slate-200 mr-2">
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

function SidebarRender({ children, isSmallScreen }) {
  return (
    <div
      className={`flex flex-col p-2 select-none h-full ${
        isSmallScreen
          ? "overflow-y-auto scrollbar-thin scrollbar-thumb-color-0800 scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          : ""
      }`}
    >
      {children}
    </div>
  );
}

function SidebarDividerItem({ title, isSmallScreen }) {
  return (
    <div
      className="m-0.5 inline-flex items-start border-t-[1px] border-slate-600"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <p className={`${isSmallScreen ? "text-[7px]" : "text-[10px]"} font-normal tracking-wide`}>{title}</p>
    </div>
  );
}

function SidebarItem({ showTitle, base, path, title, icon, openNewTab = false, isSmallScreen }) {
  const [hovered, setHovered] = useState(false);
  const actualPath = base + "/" + path;
  const location = useLocation();
  const { pathname } = location;
  const id = snakeCase(title).replaceAll("_", "-");
  return (
    <NavLink
      id={`nav-page-${id}`}
      to={!openNewTab ? actualPath : pathname}
      className={`relative inline-flex items-center w-full transition-all duration-300 ease-in-out ${isSmallScreen ? "mb-1" : "p-1 mb-2"} ${
        pathname.includes(path)
          ? "z-0 backdrop-blur-sm bg-slate-500/40 text-slate-300 border-l-4 border-slate-500"
          : hovered
          ? "backdrop-blur-sm text-slate-300"
          : "hover:text-slate-300"
      } ${!showTitle ? "justify-center rounded" : "rounded-md"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (openNewTab) {
          openInNewTab(path);
        }
      }}
    >
      <div
        className={`absolute h-full transition-all duration-300 ease-in-out ${
          hovered ? "right-0 w-full rounded-md bg-slate-900 text-slate-300" : "right-full w-0"
        }`}
      />
      {icon && (
        <div className="mx-1 z-10">
          <Tooltip title={!showTitle ? title : undefined}>
            <IconRenderer icon={icon} className="h-4 w-4" viewBox={`${isSmallScreen ? "0 0 30 30" : "0 0 25 25"}`} />
          </Tooltip>
        </div>
      )}
      {showTitle && title && <label className="break-words pr-1 z-10 font-medium text-[9px]">{title}</label>}
    </NavLink>
  );
}

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};
