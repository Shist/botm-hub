import { storeToRefs } from "pinia";
import { useToastStore } from "@/stores/toast";
import { toast } from "vue3-toastify";

export default function useToast() {
  const { currToastId } = storeToRefs(useToastStore());

  const setLoadingToast = (msg: string) => {
    removeCurrToast();

    const loadingToastId = toast(msg, {
      type: "loading",
      position: toast.POSITION.BOTTOM_CENTER,
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
    });

    currToastId.value = loadingToastId;
  };

  const setSuccessToast = (msg: string) => {
    removeCurrToast();

    const successToastId = toast(msg, {
      type: "success",
      position: toast.POSITION.BOTTOM_CENTER,
      closeOnClick: false,
    });

    currToastId.value = successToastId;
  };

  const setErrorToast = (msg: string) => {
    removeCurrToast();

    const errorToastId = toast(msg, {
      type: "error",
      position: toast.POSITION.BOTTOM_CENTER,
      closeOnClick: false,
    });

    currToastId.value = errorToastId;
  };

  const removeCurrToast = () => {
    if (currToastId.value) {
      toast.remove(currToastId.value);
      currToastId.value = null;
    }
  };

  return { setLoadingToast, setSuccessToast, setErrorToast, removeCurrToast };
}
