import PropTypes from "prop-types";
import React, { Fragment } from "react";
import { Field, Record } from "@airtable/blocks/models";
import CustomCellRenderer from "./CustomCellRenderer";
import { Box, Text, Button, Icon } from "@airtable/blocks/ui";

export default function FlashcardMagoosh({
  record,
  settings,
  shouldShowAnswer,
  handleUpdateRecord,
}) {
  const statusBackgroundColor = () => {
    if (record) {
      switch (record.getCellValueAsString(settings.statusField)) {
        case "learning": {
          return "#F6A351";
        }
        case "mastered": {
          return "#37b95c";
        }
        default:
          return "#f5f5f5";
      }
    } else {
      return "white";
    }
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box
        backgroundColor={statusBackgroundColor()}
        marginTop="0"
        height="10px"
        width="100%"
        borderRadius="4px 4px 0 0"
      />
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        height={shouldShowAnswer ? "auto" : "100%"}
        border="none"
        borderRadius="4px"
        backgroundColor="white"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        <Text
          fontSize={shouldShowAnswer ? "40px" : "60px"}
          marginTop={shouldShowAnswer ? "48px" : "0"}
          marginBottom="12px"
          height="auto"
          marginX={5}
          lineHeight="normal"
        >
          {record.getCellValueAsString(settings.questionField)}
        </Text>
        {settings.answerField && shouldShowAnswer ? (
          <Text fontSize="16px">
            {record.getCellValueAsString(settings.answerField)}
          </Text>
        ) : null}
      </Box>
    </Box>
  );
}

FlashcardMagoosh.propTypes = {
  record: PropTypes.instanceOf(Record),
  settings: PropTypes.shape({
    questionField: PropTypes.instanceOf(Field).isRequired,
    answerField: PropTypes.instanceOf(Field),
  }).isRequired,
};
