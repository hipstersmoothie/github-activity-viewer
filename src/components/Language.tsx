import { BoxProps, Box, Text } from "@primer/react";

import { LanguageType } from "../utils/types";

export const Language = ({
  language,
  ...props
}: { language: LanguageType } & BoxProps) => (
  <Box display="flex" alignItems="center" {...props}>
    <Box
      size={10}
      mr={1}
      sx={{
        borderRadius: "50%",
        overflow: "hidden",
        bg: language.node.color || "fg.muted",
      }}
    />
    <Text color="fg.muted">{language.node.name}</Text>
  </Box>
);
