import React from "react";
import { usePopper } from "react-popper";
import { Popover } from "@primer/components";

interface PopperPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const PopperPopover = ({ trigger, children }: PopperPopoverProps) => {
  const [showPopover, showPopoverSet] = React.useState(false);
  const [referenceElement, setReferenceElement] = React.useState(null);
  const [popperElement, setPopperElement] = React.useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
    ],
  });
  const computedPlacement = attributes.popper?.["data-popper-placement"];

  return (
    <>
      <div
        ref={setReferenceElement}
        onMouseEnter={() => showPopoverSet(true)}
        onMouseLeave={() => showPopoverSet(false)}
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
        >
          <Popover
            relative
            open
            width="100%"
            caret={
              (computedPlacement === "top" && "bottom") ||
              (computedPlacement === "bottom" && "top") ||
              undefined
            }
          >
            {children}
          </Popover>
        </div>
      )}
    </>
  );
};

export default PopperPopover;
