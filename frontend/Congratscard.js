import PropTypes from "prop-types";
import React, { Fragment } from "react";
import { Field, Record } from "@airtable/blocks/models";
import { Box, Text, Button, Icon } from "@airtable/blocks/ui";

export default function Congratscard() {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box
        marginTop="0"
        height="10px"
        width="100%"
        borderRadius="6px 6px 0 0"
      />
      <Box
        display="flex"
        flexDirection="column"
        width="90%"
        height="100%"
        border="none"
        borderRadius="none"
        backgroundColor="white"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        <Text fontSize="40px" lineHeight="44px" marginBottom="24px">
          🎉 Congrats!
        </Text>
        <Text fontSize="16px" lineHeight="14px">
          You have completed this learning session
        </Text>
      </Box>
    </Box>
  );
}
