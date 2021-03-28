import PropTypes from "prop-types";
import React, { Fragment } from "react";
import { Field, Record } from "@airtable/blocks/models";
import CustomCellRenderer from "./CustomCellRenderer";
import { Box, Text, Button, Icon, CellRenderer } from "@airtable/blocks/ui";
import { ITEM_TYPES, STATUS_TYPES } from "./config.js";

export default function FlashcardMagoosh({
  record,
  settings,
  shouldShowAnswer,
  recordStatus,
}) {
  const statusBackgroundColor = () => {
    switch (recordStatus) {
      case STATUS_TYPES.LEARNING: {
        console.log("learning");
        return "#d9595d";
      }
      case STATUS_TYPES.MASTERED: {
        return "#37b95c";
      }
      case STATUS_TYPES.REVIEWING: {
        return "#F6A351";
      }
      default:
        return "#f5f5f5";
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
        width="90%"
        height={shouldShowAnswer ? "auto" : "100%"}
        border="none"
        borderRadius="4px"
        backgroundColor="white"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        <Box
          marginTop={shouldShowAnswer ? "56px" : "0"}
          marginBottom={shouldShowAnswer ? "20px" : "0"}
          height="auto"
          marginX={5}
        >
          <CustomCellRenderer
            record={record}
            field={settings.questionField}
            itemType={
              shouldShowAnswer ? ITEM_TYPES.QUESTION_SMALL : ITEM_TYPES.QUESTION
            }
          />
        </Box>
        {settings.answerField && shouldShowAnswer ? (
          <Box marginBottom="12px">
            <CustomCellRenderer
              record={record}
              field={settings.answerField}
              itemType={ITEM_TYPES.ANSWER}
            />
          </Box>
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
