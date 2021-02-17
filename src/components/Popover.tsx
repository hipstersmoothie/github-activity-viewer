import * as React from "react";
import { usePopper, Modifier } from "react-popper";
import { BaseStyles, Popover, Box } from "@primer/components";
import maxSize from "popper-max-size-modifier";
import Portal from "@reach/portal";

export interface PopperPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  interactive?: boolean;
  maxWidth?: number;
  placement?: "left" | "right";
}

// Create your own apply modifier that adds the styles to the state
const applyMaxSize: Modifier<"applyMaxSize"> = {
  name: "applyMaxSize",
  enabled: true,
  phase: "afterMain",
  requires: ["maxSize"],
  fn({ state }) {
    // The `maxSize` modifier provides this data
    const { width, height } = state.modifiersData["maxSize"];

    if (height < state.elements.popper.clientHeight) {
      // eslint-disable-next-line no-param-reassign
      state.styles["popper"] = {
        ...state.styles["popper"],
        maxWidth: `${width}px`,
        // SHHHH: doing sneaky things to get styles to child elements
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
  placement = "right",
  ...props
}: PopperPopoverProps & React.ComponentProps<"div">) => {
  const shouldHide = React.useRef<boolean>();
  const showTimeout = React.useRef<ReturnType<typeof setTimeout>>();
  const hideTimeout = React.useRef<ReturnType<typeof setTimeout>>();
  const [showPopover, showPopoverSet] = React.useState(false);
  const [referenceElement, setReferenceElement] = React.useState<
    HTMLDivElement
  >();
  const [popperElement, setPopperElement] = React.useState<HTMLDivElement>();
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: "offset", options: { offset: [0, 14] } },
      maxSize,
      applyMaxSize,
    ],
  });
  const computedPlacement = attributes["popper"]?.["data-popper-placement"];
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { popperContent, ...popperStyles } = styles.popper;

  return (
    <>
      <Box
        ref={(ref) => ref && setReferenceElement(ref)}
        style={{ width: "fit-content" }}
        onFocus={() => {
          if (showPopover) {
            return;
          }

          shouldHide.current = false;

          if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
          }

          show();
        }}
        onMouseOver={() => {
          if (showPopover) {
            return;
          }

          shouldHide.current = false;

          if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
          }

          show();
        }}
        onMouseLeave={() => {
          shouldHide.current = true;

          if (showTimeout.current) {
            clearTimeout(showTimeout.current);
          }

          showTimeout.current = undefined;
          hideTimeout.current = setTimeout(() => {
            if (shouldHide.current !== false) {
              hide();
            }
          }, 300);
        }}
        {...props}
      >
        {trigger}
      </Box>

      {showPopover && (
        <Portal>
          <BaseStyles>
            <div
              ref={(ref) => ref && setPopperElement(ref)}
              className="tooltip-wrapper"
              style={{
                ...popperStyles,
                zIndex: 100,
                width: referenceElement
                  ? `max(min(80vw, ${maxWidth}px), ${referenceElement.clientWidth}px)`
                  : undefined,
              }}
              {...attributes["popper"]}
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
                  (computedPlacement === "left" && "right") ||
                  (computedPlacement === "right" && "left") ||
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
          </BaseStyles>
        </Portal>
      )}
    </>
  );
};

export default PopperPopover;
