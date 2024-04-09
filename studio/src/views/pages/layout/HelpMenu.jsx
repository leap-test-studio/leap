import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Transition } from "@headlessui/react";

import AboutDialog from "./AboutDialog";
import { IconRenderer } from "../../utilities";

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

function Help(props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

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

  return (
    <div className="relative inline-flex mx-1">
      <button
        ref={trigger}
        className={`w-5 h-5 flex items-center justify-center bg-slate-200 hover:bg-slate-300 transition duration-150 rounded-full ${
          dropdownOpen && "bg-slate-300"
        }`}
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="sr-only">Need help?</span>
        <IconRenderer icon="Info" className="text-color-0500 fill-color-0500" fontSize="10" />
      </button>

      <Transition
        className="origin-top-right z-10 absolute top-full right-0 min-w-44 bg-white border border-slate-300 py-1.5 rounded shadow-lg overflow-hidden"
        show={dropdownOpen}
        enter="transition ease-in-out duration-[100ms]"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-[75ms]"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div ref={dropdown} onFocus={() => setDropdownOpen(true)} onBlur={() => setDropdownOpen(false)}>
          <div className="text-xs font-semibold text-color-0400 uppercase pt-1.5 pb-2 px-4">Need help?</div>
          <ul>
            <li>
              <div
                className="font-medium text-xs text-color-0500 hover:text-color-0700 flex items-center py-1 px-3 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  openInNewTab("/vinashak/documentation");
                }}
              >
                <svg className="w-3 h-3 fill-current text-color-0500 shrink-0 mr-2" viewBox="0 0 12 12">
                  <rect y="3" width="12" height="9" rx="1" />
                  <path d="M2 0h8v2H2z" />
                </svg>
                <span>Documentation</span>
              </div>
            </li>
            <li>
              <Link
                className="font-medium text-xs text-color-0500 hover:text-color-0700 flex items-center py-1 px-3"
                to="#0"
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setShowAbout(!showAbout);
                }}
              >
                <svg className="w-3 h-3 fill-current text-color-0500 shrink-0 mr-2" viewBox="0 0 12 12">
                  <path d="M11.854.146a.5.5 0 00-.525-.116l-11 4a.5.5 0 00-.015.934l4.8 1.921 1.921 4.8A.5.5 0 007.5 12h.008a.5.5 0 00.462-.329l4-11a.5.5 0 00-.116-.525z" />
                </svg>
                <span>About</span>
              </Link>
            </li>
          </ul>
        </div>
      </Transition>
      <AboutDialog showDialog={showAbout} closeDialog={() => setShowAbout(!showAbout)} {...props} />
    </div>
  );
}

export default Help;
