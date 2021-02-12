import * as React from "react";
import { Flex, Box, Text } from "@primer/components";
import { LanguageType } from "../utils/types";
import { DEFAULT_LANGUAGE_COLOR } from "../utils/constants";

export const Language = ({
  language,
  ...props
}: { language: LanguageType } & React.ComponentProps<typeof Flex>) => (
  <Flex alignItems="center" {...props}>
    <Box
      size={10}
      mr={1}
      style={{
        borderRadius: "50%",
        overflow: "hidden",
        backgroundColor: language.node.color || DEFAULT_LANGUAGE_COLOR,
      }}
    />
    <Text color="gray.6">{language.node.name}</Text>
  </Flex>
);
