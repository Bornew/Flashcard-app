import PropTypes from "prop-types";
import React, { Fragment } from "react";
import { Field, Record } from "@airtable/blocks/models";
import CustomCellRenderer from "./CustomCellRenderer";
import { Box, Text, Button, Icon } from "@airtable/blocks/ui";

export default function FlashcardMagoosh({
  record,
  settings,
  shouldShowAnswer,
  wordStatus,
}) {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box
        backgroundColor={wordStatus === "untouched" ? "#f5f5f5" : "green"}
        height="12px"
        width="100%"
        borderRadius="2px 2px 0 0"
      />
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        height="300px"
        border="none"
        borderRadius="none"
        backgroundColor="white"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {record ? (
          //   <CustomCellRenderer field={settings.questionField} record={record} />
          <Text
            fontSize={shouldShowAnswer ? "40px" : "60px"}
            marginBottom="12px"
            height="auto"
            marginX={5}
            lineHeight="normal"
          >
            {record.getCellValueAsString(settings.questionField)}
          </Text>
        ) : (
          <Text fontSize="60px" marginBottom={2}>
            All done!
          </Text>
        )}
        {settings.answerField && record && shouldShowAnswer ? (
          <Text fontSize="16px">
            {record.getCellValueAsString(settings.answerField)}
          </Text>
        ) : null}
      </Box>

      {shouldShowAnswer ? (
        <Fragment>
          <Box
            onClick={() => console.log("Button clicked")}
            pointer="cursor"
            width="100%"
            height="52px"
            backgroundColor="#bcf5cc"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="12px" textColor="#37b95c">
              ✓ I know it
            </Text>
          </Box>
          <Box
            onClick={() => console.log("Button clicked")}
            pointer="cursor"
            width="100%"
            height="52px"
            backgroundColor="#fccfd0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="0 0 2px 2px"
          >
            <Text fontSize="12px" textColor="#d9595d">
              ✗ I don't know this word
            </Text>
          </Box>
        </Fragment>
      ) : null}
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
