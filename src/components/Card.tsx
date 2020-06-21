import React from "react";
import {
  theme,
  Flex,
  BorderBox,
  Heading,
  Box,
  CounterLabel,
  Text,
} from "@primer/components";

export const CardDivider = (props: React.ComponentProps<typeof Box>) => (
  <Box
    {...props}
    mx={-4}
    sx={{ borderBottom: "1px solid", borderColor: "border.gray" }}
  />
);

export const CardTitle = ({
  title,
  count,
}: {
  title: React.ReactNode;
  count: number;
}) => (
  <Flex alignItems="center" justifyContent="space-between">
    <Text mr={2}>{title}</Text> {count && <CounterLabel>{count}</CounterLabel>}
  </Flex>
);

export const Card = ({
  title,
  children,
  ...props
}: {
  children: React.ReactNode;
  title: React.ReactNode;
} & Omit<React.ComponentProps<typeof BorderBox>, "title">) => (
  <BorderBox px={4} py={3} width="100%" backgroundColor="white" {...props}>
    <Heading fontSize={4} fontWeight="bold" mb={5}>
      {title}
    </Heading>

    {children}
  </BorderBox>
);
