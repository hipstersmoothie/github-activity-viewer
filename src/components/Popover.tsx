import React from "react";
import { usePopper } from "react-popper";
import { Popover } from "@primer/components";
import maxSize from "popper-max-size-modifier";

interface PopperPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  interactive?: boolean;
  maxWidth?: number;
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

    if (height < state.elements.popper.clientHeight) {
      // eslint-disable-next-line no-param-reassign
      state.styles.popper = {
        ...state.styles.popper,
        maxWidth: `${width}px`,
        popperContent: {
          overflow: "auto",
        },
        height: `${height}px`,
      };
    }
  },
};

const PopperPopover = ({
  trigger,
  children,
  interactive,
  maxWidth = 400,
}: PopperPopoverProps) => {
  const shouldHide = React.useRef<boolean>();
  const showTimeout = React.useRef<number>();
  const [showPopover, showPopoverSet] = React.useState(false);
  const [referenceElement, setReferenceElement] = React.useState(null);
  const [popperElement, setPopperElement] = React.useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom",
    modifiers: [maxSize, applyMaxSize],
  });
  const computedPlacement = attributes.popper?.["data-popper-placement"];
  const hide = React.useCallback(() => showPopoverSet(false), [showPopoverSet]);
  const show = () => {
    if (showTimeout.current) {
      return;
    }

    showTimeout.current = setTimeout(() => {
      showPopoverSet(true);
    }, 300);
  };

  React.useEffect(() => {
    document.addEventListener("scroll", hide);

    return () => {
      document.removeEventListener("scroll", hide);
    };
  }, [hide]);

  // @ts-ignore
  const { popperContent, ...popperStyles } = styles.popper;

  return (
    <>
      <div
        ref={setReferenceElement}
        onFocus={() => {
          if (showPopover) {
            return;
          }

          shouldHide.current = false;
          show();
        }}
        onMouseOver={() => {
          if (showPopover) {
            return;
          }

          shouldHide.current = false;
          show();
        }}
        onMouseLeave={() => {
          shouldHide.current = true;
          clearTimeout(showTimeout.current);
          showTimeout.current = undefined;
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
            ...popperStyles,
            zIndex: 1,
            width: `max(min(80vw, ${maxWidth}px), ${referenceElement.clientWidth}px)`,
          }}
          {...attributes.popper}
          onMouseEnter={() => {
            if (!interactive) {
              return;
            }

            shouldHide.current = false;
          }}
          onMouseLeave={() => {
            if (!interactive) {
              return;
            }

            shouldHide.current = true;
            requestAnimationFrame(() => {
              if (shouldHide.current !== false) {
                hide();
              }
            });
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
            <Popover.Content
              width="100%"
              height="100%"
              sx={{ ...popperContent }}
            >
              {children}
            </Popover.Content>
          </Popover>
        </div>
      )}
    </>
  );
};

export default PopperPopover;
