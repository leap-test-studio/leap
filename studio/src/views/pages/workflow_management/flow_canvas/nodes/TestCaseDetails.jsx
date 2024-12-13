import { useSelector } from "react-redux";
import { NewlineText, Tooltip } from "@utilities/.";

const TestCaseDetails = ({ id, showDetails }) => {
  const { testcases } = useSelector((state) => state.project);
  const tc = testcases[id];
  if (!tc) return <div className="text-[10px] text-color-label">Not Selected</div>;

  const Details = () => (
    <Tooltip
      title={tc.label}
      content={
        <div className="flex flex-col space-y-1 text-[10px] text-white w-fit">
          <div className="flex flex-row items-start space-x-1">
            <strong className="w-12">Id</strong>
            <span>{tc.id}</span>
          </div>
          <div className="flex flex-row items-start space-x-1">
            <strong className="w-12">Label</strong>
            <span>{tc.label}</span>
          </div>
          <div className="flex flex-row items-start space-x-1">
            <strong className="w-12">Title</strong>
            <NewlineText text={tc.title} className="font-normal" />
          </div>
          <div className="flex flex-row items-start space-x-1">
            <strong className="w-12">IsActive</strong>
            <span>{tc.enabled ? "Enabled" : "Diabled"}</span>
          </div>
          {tc.given && (
            <div className="flex flex-row items-start space-x-1">
              <strong className="w-12">Given</strong>
              <NewlineText text={tc.given} className="font-normal" />
            </div>
          )}
          {tc.when && (
            <div className="flex flex-row items-start space-x-1">
              <strong className="w-12">When</strong>
              <NewlineText text={tc.when} className="font-normal" />
            </div>
          )}
          {tc.then && (
            <div className="flex flex-row items-start space-x-1">
              <strong className="w-12">Then</strong>
              <NewlineText text={tc.then} className="font-normal" />
            </div>
          )}
        </div>
      }
    >
      <span className="underline underline-offset-2 text-[10px] w-fit hover:text-blue-400">{tc.label}</span>
    </Tooltip>
  );

  if (showDetails)
    return (
      <div className="flex flex-col space-y-1 text-[10px] text-color-label">
        <div className="inline-flex space-x-1 w-52">
          <strong>Test</strong>
          <Details />
        </div>
        <div className="inline-flex space-x-1 w-52">
          <strong>Title</strong>
          <NewlineText text={tc.title} className="font-normal" />
        </div>
      </div>
    );

  return <Details />;
};

export default TestCaseDetails;
