let lockCount = 0;
let lockedScrollTop = 0;

let originalPosition = "";
let originalTop = "";
let originalLeft = "";
let originalRight = "";
let originalWidth = "";
let originalOverflow = "";

export function useOverlayScrollLock() {
  function lockBodyScroll() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const body = document.body;

    if (lockCount === 0) {
      lockedScrollTop = window.scrollY || window.pageYOffset || 0;
      originalPosition = body.style.position;
      originalTop = body.style.top;
      originalLeft = body.style.left;
      originalRight = body.style.right;
      originalWidth = body.style.width;
      originalOverflow = body.style.overflow;

      body.style.position = "fixed";
      body.style.top = `-${lockedScrollTop}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
    }

    lockCount += 1;
  }

  function unlockBodyScroll() {
    if (
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      lockCount === 0
    ) {
      return;
    }

    lockCount -= 1;

    if (lockCount > 0) {
      return;
    }

    const body = document.body;
    body.style.position = originalPosition;
    body.style.top = originalTop;
    body.style.left = originalLeft;
    body.style.right = originalRight;
    body.style.width = originalWidth;
    body.style.overflow = originalOverflow;
    window.scrollTo(0, lockedScrollTop);
  }

  return {
    lockBodyScroll,
    unlockBodyScroll,
  };
}
