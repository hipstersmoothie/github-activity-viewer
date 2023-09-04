import * as React from "react";
import * as RadixHoverCard from "@radix-ui/react-hover-card";
import { BaseStyles, Popover, Box, BoxProps } from "@primer/react";

export interface PopperPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
  placement?: "left" | "right";
}

const PopperPopover = ({
  trigger,
  children,
  maxWidth = 400,
  placement = "right",
  ...props
}: PopperPopoverProps & BoxProps) => {
  return (
    <RadixHoverCard.Root>
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
          >
            <Popover.Content style={{ width: maxWidth }}>
              {children}
            </Popover.Content>
          </RadixHoverCard.Content>
        </BaseStyles>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  );
};

export default PopperPopover;
