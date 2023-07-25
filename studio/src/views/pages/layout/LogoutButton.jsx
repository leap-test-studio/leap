import { useContext } from "react";
import { useDispatch } from "react-redux";
import WebContext from "../../context/WebContext";
import IconRenderer from "../../IconRenderer";
import { logoutUser } from "../../../redux/actions/LoginActions";

function LogoutButton({ showSidebar = false }) {
  const { resetContext } = useContext(WebContext);
  const dispatch = useDispatch();

  return (
    <div
      id="nav-logout"
      className={`flex flex-row items-center w-full mb-1 p-1.5 mt-2 text-white hover:text-slate-300 ${showSidebar === false && "justify-center"}`}
      onClick={() => {
        dispatch(logoutUser());
        resetContext();
      }}
    >
      <div className="flex flex-row items-center justify-center mx-2">
        <IconRenderer icon="Logout" className="h-5 w-5" viewBox="0 0 25 25" />
      </div>
      {showSidebar && <label className="break-words text-xs tracking-tight">Logout</label>}
    </div>
  );
}

export default LogoutButton;
