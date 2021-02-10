import React from "react";
import { usePopper } from "react-popper";
import { Popover } from "@primer/components";
import maxSize from "popper-max-size-modifier";

interface PopperPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const HIDE_DELAY = 200;
const POPPER_OFFSET = 8;

// Create your own apply modifier that adds the styles to the state
const applyMaxSize = {
  name: "applyMaxSize",
  enabled: true,
  phase: "main" as const,
  requires: ["maxSize"],
  fn({ state, ...rest }) {
    // The `maxSize` modifier provides this data
    console.log(state.elements.popper.clientHeight);
    const { width, height } = state.modifiersData.maxSize;

    // eslint-disable-next-line no-param-reassign
    state.styles.popper = {
      ...state.styles.popper,
      maxWidth: `${width}px`,
      height:
        height - POPPER_OFFSET   < state.elements.popper.clientHeight
          ? `${height - POPPER_OFFSET}px`
          : undefined,
    };
  },
};

let otherPopoverHides: (() => void)[] = [];

const hideOtherPopovers = () => {
  otherPopoverHides.map((hide) => hide());
  otherPopoverHides = [];
};

const PopperPopover = ({ trigger, children }: PopperPopoverProps) => {
  const timeoutRef = React.useRef<number>();
  const [showPopover, showPopoverSet] = React.useState(false);
  const [referenceElement, setReferenceElement] = React.useState(null);
  const [popperElement, setPopperElement] = React.useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, POPPER_OFFSET],
        },
      },
      maxSize,
      applyMaxSize,
    ],
  });
  const computedPlacement = attributes.popper?.["data-popper-placement"];
  const hide = React.useCallback(() => showPopoverSet(false), [showPopoverSet]);

  React.useEffect(() => {
    otherPopoverHides.push(hide);
  }, [hide]);

  return (
    <>
      <div
        ref={setReferenceElement}
        onMouseEnter={() => {
          clearTimeout(timeoutRef.current);
          showPopoverSet(true);
          hideOtherPopovers();
        }}
        onMouseLeave={() => {
          timeoutRef.current = setTimeout(hide, HIDE_DELAY);
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
            clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(hide, HIDE_DELAY);
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
