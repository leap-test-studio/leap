import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import snakeCase from "lodash/snakeCase";

import UserInfo from "./UserInfo";
import LogoRenderer, { VINASHAK_LOGO } from "./LogoRenderer";
import { Tooltip, IconRenderer } from "../../utilities";

export default function Sidebar({ showSidebar, base, mode, sideBarItems, headerHeight, maxContentHeight, menuClicked, isSetupSelected, ...props }) {
  const isSmallScreen = maxContentHeight < 800;
  return (
    <aside
      className={`transition-all duration-500 ${showSidebar ? "w-[12%]" : "w-12"
        } bg-sky-950 text-slate-100 flex flex-col cursor-pointer h-screen px-0.5`}
    >
      <div className="border-b-[1px] border-slate-400 mx-px py-2 flex flex-row items-center justify-start my-2">
        <LogoRenderer className="mx-1 h-7 w-7" name={props?.product.name} />
        {showSidebar && (
          <VINASHAK_LOGO className="w-32" />
        )}
      </div>
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
      <div className={`w-full flex h-9 py-1 border-t-[1px] border-slate-400 mx-px ${showSidebar ? "justify-end" : "justify-center"}`}>
        <Tooltip title={!showSidebar ? "Expand Sidebar" : "Collapse Sidebar"} placement="right">
          <div className="h-6 w-7 flex cursor-pointer rounded justify-center items-center hover:bg-slate-500/40 mx-1" onClick={menuClicked}>
            <IconRenderer icon="DoubleArrowTwoTone" className={`text-white ${showSidebar ? "rotate-180" : ""}`} fontSize="24px" />
          </div>
        </Tooltip>
      </div>
    </aside>
  );
}

function SidebarRender({ showSidebar, children }) {
  return (
    <div
      className={`flex flex-col px-1.5 py-2 select-none h-full ${showSidebar ? "max-h-[94%]" : "max-h-[99%]"
        } overflow-y-auto custom-scrollbar cursor-default overflow-x-hidden`}
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
      <p className={`${isSmallScreen ? "text-[10px]=" : "text-xs"} font-normal tracking-wide`}>{title}</p>
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
    <Tooltip title={!showTitle ? title : undefined} placement="right">
      <NavLink
        id={`nav-page-${id}`}
        to={!openNewTab ? actualPath : pathname}
        className={`relative inline-flex items-center w-full transition-all duration-300 ease-in-out ${isSmallScreen ? "mb-1" : "p-1 mb-2"} ${pathname.includes(path)
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
          className={`absolute h-full transition-all duration-300 ease-in-out ${hovered ? "right-0 w-full rounded-md bg-slate-900 text-slate-300" : "right-full w-0"
            }`}
        />
        {icon && (
          <div className="mx-1 z-10">
            <IconRenderer icon={icon} className="h-4 w-4" viewBox={`${isSmallScreen ? "0 0 30 30" : "0 0 25 25"}`} />
          </div>
        )}
        {showTitle && title && <label className="break-words pr-1 z-10 font-medium text-[9px]">{title}</label>}
      </NavLink>
    </Tooltip>
  );
}

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};
