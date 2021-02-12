import * as React from "react";

export const useWindowFocus = () => {
  const [windowFocus, windowFocusSet] = React.useState(true);

  React.useEffect(() => {
    const toggleWindowFocus = () => windowFocusSet(!windowFocus);

    window.addEventListener("visibilitychange", toggleWindowFocus, false);

    return () => {
      window.removeEventListener("visibilitychange", toggleWindowFocus);
    };
  });

  return windowFocus;
};
