import * as React from "react";
import { Heading, Box, BoxProps, CounterLabel, Text } from "@primer/react";

export const CardDivider = (props: BoxProps) => (
  <Box
    {...props}
    mx={-4}
    sx={{ borderBottom: "1px solid", borderColor: "border.muted" }}
  />
);

export const CardTitle = ({
  title,
  count,
}: {
  title: React.ReactNode;
  count: number;
}) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    color="fg.default"
  >
    <Text mr={2}>{title}</Text> {count && <CounterLabel>{count}</CounterLabel>}
  </Box>
);

export const Card = ({
  title,
  children,
  ...props
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
} & Omit<BoxProps, "title">) => (
  <Box
    borderWidth="1px"
    borderStyle="solid"
    borderColor="border.default"
    borderRadius={4}
    px={4}
    py={3}
    width="100%"
    backgroundColor="canvas.default"
    {...props}
  >
    {title && (
      <Heading
        sx={{ fontSize: 4, fontWeight: "bold", mb: 5, color: "fg.default" }}
      >
        {title}
      </Heading>
    )}

    {children}
  </Box>
);
