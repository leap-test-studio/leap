import { Dialog, DialogTitle, Description } from "@headlessui/react";

import LogoRenderer from "./LogoRenderer";

function AboutDialog({ showDialog, closeDialog, product }) {
  const { name, version, build } = product;
  return (
    <Dialog open={showDialog} onClose={closeDialog} as="div" className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black opacity-30" />
      <div className="flex flex-col pt-4 pb-4 px-4 bg-white rounded shadow-lg z-50 min-w-0.25">
        <DialogTitle className="text-color-label font-medium text-lg tracking-wide">{name}</DialogTitle>
        <Description as="div" className="text-color-label">
          <div className="flex justify-center">
            <LogoRenderer className="size-32" name={name} />
          </div>
          <span className="justify-center">
            Version: {version}
            <br />
            Build Number: {build.id}
            <br />
            Build Date: {build.date}
            <br />
            Build Host: {build.host}
          </span>
        </Description>
        <div className="flex justify-end text-cds-white mt-2">
          <button className="px-5 py-1 bg-color-0800 hover:bg-color-0700 rounded" onClick={closeDialog}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default AboutDialog;
