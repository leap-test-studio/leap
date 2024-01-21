export default function ErrorMessage({ id, path, errors }) {
  return (
    <>
      {errors?.length > 0 && (
        <label id={id + "-error-msg"} htmlFor={path} className="block text-[10px] text-left font-medium text-red-600 w-full select-none">
          {errors}
        </label>
      )}
    </>
  );
}
