import * as React from "react";
import * as RadixHoverCard from "@radix-ui/react-hover-card";
import { BaseStyles, Popover, Box, BoxProps } from "@primer/react";

export interface PopperPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
  placement?: "left" | "right";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PopperPopover = ({
  trigger,
  children,
  maxWidth = 400,
  placement = "right",
  open,
  onOpenChange,
  ...props
}: PopperPopoverProps & BoxProps) => {
  return (
    <RadixHoverCard.Root open={open} onOpenChange={onOpenChange}>
      <RadixHoverCard.Trigger asChild>
        <Box {...props}>{trigger}</Box>
      </RadixHoverCard.Trigger>

      <RadixHoverCard.Portal>
        <BaseStyles>
          <RadixHoverCard.Content
            side={placement}
            sideOffset={14}
            align="center"
            style={{ outline: "none" }}
            collisionPadding={16}
          >
            <Popover
              open
              caret={placement === "left" ? "right" : "left"}
              style={{ position: "static" }}
            >
              <Popover.Content
                style={{
                  width: maxWidth,
                  maxHeight: "calc(100vh - 32px)",
                  overflow: "auto",
                }}
              >
                {children}
              </Popover.Content>
            </Popover>
          </RadixHoverCard.Content>
        </BaseStyles>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  );
};

export default PopperPopover;
