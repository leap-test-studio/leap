export const CircularProgressBar = ({ title, progress }) => (
  <div className="relative pt-1">
    <div className="flex mb-2 items-center justify-between">
      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-cds-blue-0600 bg-cds-blue-0200">{title}</span>
      <div className="text-right">
        <span className="text-xs font-semibold inline-block text-cds-blue-0600">{progress + "%"}</span>
      </div>
    </div>
    <div className="h-2 mb-4 text-xs flex rounded bg-cds-blue-0200">
      <div
        style={{
          width: progress + "%"
        }}
        className="flex flex-col text-center whitespace-nowrap text-white justify-center bg-cds-blue-0500"
      />
    </div>
  </div>
);
