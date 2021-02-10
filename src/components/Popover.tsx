import React from "react";
import { usePopper } from "react-popper";
import { Popover } from "@primer/components";
import maxSize from "popper-max-size-modifier";

interface PopperPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

// Create your own apply modifier that adds the styles to the state
const applyMaxSize = {
  name: "applyMaxSize",
  enabled: true,
  phase: "afterMain" as const,
  requires: ["maxSize"],
  fn({ state }) {
    // The `maxSize` modifier provides this data
    const { width, height } = state.modifiersData.maxSize;

    // eslint-disable-next-line no-param-reassign
    state.styles.popper = {
      ...state.styles.popper,
      maxWidth: `${width}px`,
      height:
        height < state.elements.popper.clientHeight ? `${height}px` : undefined,
    };
  },
};

const PopperPopover = ({ trigger, children }: PopperPopoverProps) => {
  const shouldHide = React.useRef<boolean>();
  const [showPopover, showPopoverSet] = React.useState(false);
  const [referenceElement, setReferenceElement] = React.useState(null);
  const [popperElement, setPopperElement] = React.useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom",
    modifiers: [maxSize, applyMaxSize],
  });
  const computedPlacement = attributes.popper?.["data-popper-placement"];
  const hide = React.useCallback(() => showPopoverSet(false), [showPopoverSet]);

  React.useEffect(() => {
    document.addEventListener("scroll", hide);

    return () => {
      document.removeEventListener("scroll", hide);
    };
  }, [hide]);

  return (
    <>
      <div
        ref={setReferenceElement}
        onMouseEnter={() => {
          showPopoverSet(true);
        }}
        onMouseLeave={() => {
          requestAnimationFrame(() => {
            if (shouldHide.current !== false) {
              hide();
            }
          });
        }}
      >
        {trigger}
      </div>

      {showPopover && (
        <div
          ref={setPopperElement}
          className="tooltip-wrapper"
          style={{
            ...styles.popper,
            zIndex: 1,
            width: "min(80vw, 400px)",
          }}
          {...attributes.popper}
          onMouseEnter={() => {
            shouldHide.current = false;
          }}
          onMouseLeave={() => {
            shouldHide.current = true;
          }}
        >
          <Popover
            relative
            open
            width="100%"
            height="100%"
            caret={
              (computedPlacement === "top" && "bottom") ||
              (computedPlacement === "bottom" && "top") ||
              undefined
            }
          >
            <Popover.Content width="100%" height="100%" overflow="auto">
              {children}
            </Popover.Content>
          </Popover>
        </div>
      )}
    </>
  );
};

export default PopperPopover;
