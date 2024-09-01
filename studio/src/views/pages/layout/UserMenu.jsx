import { useState, useRef, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Transition } from "@headlessui/react";

import { IconRenderer } from "../../utilities";
import WebContext from "../../context/WebContext";
import { logoutUser } from "../../../redux/actions/LoginActions";
import LocalStorageService from "../../../redux/actions/LocalStorageService";

export default function UserMenu({ product }) {
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef(null);
  const dropdown = useRef(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdownOpen || dropdown?.current?.contains(target) || trigger?.current?.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });
  const { resetContext } = useContext(WebContext);
  const AuthUser = LocalStorageService.getItem("auth_user");
  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        aria-haspopup="true"
        onClick={() => {
          setDropdownOpen(!dropdownOpen);
        }}
        aria-expanded={dropdownOpen}
      >
        <div className="inline-flex justify-center items-center group text-color-0200 text-xs font-medium group">
          <span className="ml-2">{AuthUser?.name}</span>
          <IconRenderer icon={dropdownOpen ? "ArrowDropUp" : "ArrowDropDown"} />
        </div>
      </button>

      <Transition
        className="origin-top-right z-10 absolute top-full right-0 min-w-44 bg-white border border-slate-300 py-1.5 rounded shadow-lg overflow-hidden mt-0.5"
        show={dropdownOpen}
        enter="transition ease-in-out duration-[100ms]"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-[75ms]"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div ref={dropdown} onFocus={() => setDropdownOpen(true)} onBlur={() => setDropdownOpen(false)}>
          <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-slate-300 w-40">
            <div className="text-xs font-medium break-words">{AuthUser.email}</div>
            <div className="text-xs text-slate-500 italic">{AuthUser.role}</div>
          </div>
          <ul>
            <li>
              <Link
                className="font-medium text-xs text-color-0500 hover:text-color-0700 flex items-center py-1 px-3"
                to={`/${product.page?.base}/settings`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                Settings
              </Link>
            </li>
            <li>
              <Link
                className="font-medium text-xs text-color-0500 hover:text-color-0700 flex items-center py-1 px-3"
                to={`/${product.page?.base}/login`}
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  dispatch(logoutUser());
                  resetContext();
                }}
              >
                Sign Out
              </Link>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  );
}
