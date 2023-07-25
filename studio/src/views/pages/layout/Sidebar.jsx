import { useContext } from "react";
import IconRenderer from "../../IconRenderer";
import { NavLink, useLocation } from "react-router-dom";
import snakeCase from "lodash/snakeCase";
import Tooltip from "../../utilities/Tooltip";
import Brand from "./Brand";
import LogoutButton from "./LogoutButton";
import UserInfo from "./UserInfo";
import WebContext from "../../context/WebContext";

export default function Sidebar({ showSidebar, product, sideBarItems, menuClicked }) {
  const minHeight = window.innerHeight;
  return (
    <aside
      className={`transition-all duration-500 z-[9999] ${showSidebar ? "w-[250px]" : "w-[50px]"} bg-color-1000 text-slate-100 relative`}
      style={{
        minHeight: minHeight,
        maxHeight: minHeight
      }}
    >
      <div
        className={`absolute cursor-pointer h-6 w-6 flex shadow-lg hover:bg-slate-300 hover:shadow-2xl rounded-full justify-center items-center bg-slate-200 border border-slate-400 top-9 ${
          showSidebar ? "left-[200px]" : "left-10"
        }`}
      >
        <IconRenderer icon={showSidebar ? "ArrowBackIos" : "ArrowForwardIos"} className="text-color-1000 pl-1" fontSize="10" onClick={menuClicked} />
      </div>
      <div className="h-[8%] border-b border-slate-300 mx-2 mb-2 flex items-center">
        <Brand showTitle={showSidebar} />
      </div>
      <div className="flex flex-col justify-between h-[90%]">
        <SidebarRender>
          {sideBarItems.map((item, index) =>
            item.divider ? (
              <SidebarDividerItem key={index} title={item.title} />
            ) : (
              <SidebarItem key={index} showTitle={showSidebar} product={product} {...item} />
            )
          )}
        </SidebarRender>
        <UserInfo showTitle={showSidebar} />
        <LogoutButton showSidebar={showSidebar} product={product} />
      </div>
    </aside>
  );
}

function SidebarRender({ children }) {
  return <div className="flex flex-col py-3 select-none grow">{children}</div>;
}

function SidebarDividerItem({ title }) {
  return (
    <div className="m-0.5 flex flex-col items-start border-t-[1px] border-slate-100">
      <p className="text-xs font-thin tracking-tighter">{title}</p>
    </div>
  );
}

function SidebarItem({ showTitle, product, path, title, icon, openNewTab = false }) {
  const actualPath = product?.page.base + "/" + path;
  const location = useLocation();
  const { pathname } = location;
  const id = snakeCase(title).replaceAll("_", "-");
  const { changeSuite } = useContext(WebContext);

  return (
    <NavLink
      id={`nav-page-${id}`}
      to={!openNewTab ? actualPath : pathname}
      className={`inline-flex cursor-pointer items-center rounded mb-2 mx-1 p-1.5  text-slate-100  ${
        pathname.includes(path) ? "bg-white text-slate-700" : "hover:text-slate-300"
      } ${showTitle ? "pl-2" : "justify-center"}`}
      onClick={() => {
        if (openNewTab) {
          openInNewTab(path);
        } else {
          changeSuite(null);
        }
      }}
    >
      {icon && (
        <Tooltip title={title}>
          <IconRenderer icon={icon} className="h-5 w-5" viewBox="0 0 25 25" />
        </Tooltip>
      )}
      {showTitle && title && <label className="break-words cursor-pointer tracking-tight text-sm ml-2">{title}</label>}
    </NavLink>
  );
}

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};
