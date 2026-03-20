import { isWeb } from "@uni-helper/uni-env";

let lockedBodyScrollTop = 0;

export function useShoppingScrollLock() {
  function lockBodyScroll() {
    if (
      !isWeb ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    ) {
      return;
    }

    const body = document.body;
    if (body.dataset.shoppingScrollLocked === "true") return;

    lockedBodyScrollTop = window.scrollY || window.pageYOffset || 0;
    body.dataset.shoppingScrollLocked = "true";
    body.style.position = "fixed";
    body.style.top = `-${lockedBodyScrollTop}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
  }

  function unlockBodyScroll() {
    if (
      !isWeb ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    ) {
      return;
    }

    const body = document.body;
    if (body.dataset.shoppingScrollLocked !== "true") return;

    body.dataset.shoppingScrollLocked = "false";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    window.scrollTo(0, lockedBodyScrollTop);
  }

  return {
    lockBodyScroll,
    unlockBodyScroll,
  };
}
