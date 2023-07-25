import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import IconRenderer from "../IconRenderer";
import IconButton from "./IconButton";
import CloseButton from "./CloseButton";

function CustomDialog({ open, largeScreen, title, onClose, onSave, saveTitle, saveIcon, buttonDiabled = false, children, customWidth = "" }) {
  const contentHeight = {
    maxHeight: window.innerHeight - (largeScreen ? 40 : 300)
  };
  if (largeScreen) {
    contentHeight.minHeight = window.innerHeight - 350;
  }
  return (
    <>
      {open && (
        <Transition appear={true} show={open === true} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 z-50 bg-slate-400 bg-opacity-60 transition-opacity" onClose={() => null}>
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-[300ms]"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transform transition ease-in-out duration-[500ms]"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="inset-0 bg-slate-400 bg-opacity-40" />
            </Transition.Child>
            <div className="min-h-screen px-4 text-center">
              {/* This element is to trick the browser into centering the modal contents. */}
              <span className="inline-block h-screen align-middle" aria-hidden="true">
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-[300ms] sm:duration-[600ms]"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-[300ms] sm:duration-[600ms]"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <div
                  className={`inline-block py-2 px-3 text-left align-middle transition-all transform bg-white shadow-xl rounded z-[1000] h-fit ${
                    largeScreen ? "w-[60vw]" : "w-[28vw]"
                  } ${customWidth}`}
                >
                  <div className="flex flex-col h-fit" style={contentHeight}>
                    {title != null && (
                      <div className="text-lg font-medium leading-6 text-slate-800 group flex items-start justify-between p-1 border-b border-solid border-slate-200 rounded-t">
                        <label className="text-color-0700 font-medium text-xl tracking-wide select-none">{title}</label>
                        <button type="button" onClick={onClose} className="text-cds-red-0700 hover:text-cds-red-0300 focus:outline-none">
                          <IconRenderer icon="Close" className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col grow items-center h-full overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-color-0800 scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full w-full">
                      {children}
                    </div>
                    {onSave && (
                      <div className="flex border-t border-solid border-slate-200 justify-end w-full mt-1.5 pt-2">
                        <CloseButton onClose={onClose} />
                        <IconButton
                          id="form-submit-btn"
                          title={saveTitle || "Save"}
                          icon={saveIcon || "Save"}
                          onClick={onSave}
                          disabled={buttonDiabled}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  );
}

export default CustomDialog;
