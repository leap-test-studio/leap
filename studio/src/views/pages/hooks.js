import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export const useHandleClose = (callback) => {
  const [isChange, setIsChange] = useState(false);
  useEffect(() => {
    setIsChange(false);
  }, []);

  const handleOnClose = () => {
    if (isChange) {
      Swal.fire({
        title: "Are you sure you want to Discard changes?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "YES",
        cancelButtonText: "NO",
        confirmButtonColor: "red",
        cancelButtonColor: "green"
      }).then((response) => {
        if (response.isConfirmed) {
          callback();
          setIsChange(false);
        }
      });
    } else {
      callback();
    }
  };

  return [setIsChange, handleOnClose];
};
