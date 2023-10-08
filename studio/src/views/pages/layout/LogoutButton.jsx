import { useDispatch } from "react-redux";
import IconRenderer from "../../IconRenderer";
import { logoutUser } from "../../../redux/actions/LoginActions";
import Tooltip from "../../utilities/Tooltip";

function LogoutButton({ showTitle = false, resetContext }) {
  const dispatch = useDispatch();

  return (
    <div
      id="logout-button"
      className={`relative flex flex-row items-center p-1 m-1 hover:bg-slate-300 hover:text-slate-700 ${
        showTitle ? "rounded-md w-32" : "justify-center rounded"
      }`}
      onClick={() => {
        dispatch(logoutUser());
        resetContext();
      }}
    >
      <div className="mx-1">
        <Tooltip title={!showTitle ? "Logout" : undefined}>
          <IconRenderer icon="Logout" viewBox="0 0 30 30" />
        </Tooltip>
      </div>
      {showTitle && <label className="break-words text-xs tracking-wide">Logout</label>}
    </div>
  );
}

export default LogoutButton;
