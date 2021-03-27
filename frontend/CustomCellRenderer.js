import PropTypes from "prop-types";
import React from "react";

import { Field, FieldType, Record } from "@airtable/blocks/models";
import { CellRenderer, Text } from "@airtable/blocks/ui";
import { ITEM_TYPES } from "./config.js";
/**
 * Handle Simple Text in Question Field or Answer Field to make them larger
 * Handle attachment and rich text to make them
 * falls back to cell renderer for other field types
 */
export default function CustomCellRenderer({ record, field, itemType }) {
  switch (field.type) {
    case FieldType.RICH_TEXT: {
      return <CellRenderer record={record} field={field} />;
    }
    case FieldType.MULTIPLE_ATTACHMENTS: {
      const attachmentCellValue = record.getCellValue(field);

      let attachmentObj;
      if (attachmentCellValue && attachmentCellValue.length > 0) {
        // Try to get the first attachment object from the cell value.
        attachmentObj = attachmentCellValue[attachmentCellValue.length - 1];
      }

      if (
        !attachmentObj ||
        !attachmentObj.thumbnails ||
        !attachmentObj.thumbnails.large
      ) {
        // If there are no attachments present, use the default cell renderer
        return <CellRenderer record={record} field={field} />;
      }
      switch (itemType) {
        case ITEM_TYPES.ANSWER: {
          return (
            <img src={attachmentObj.thumbnails.large.url} height="100px" />
          );
        }
        case ITEM_TYPES.QUESTION_SMALL: {
          return <img src={attachmentObj.thumbnails.large.url} height="80px" />;
        }
        case ITEM_TYPES.QUESTION: {
          return (
            <img src={attachmentObj.thumbnails.large.url} height="150px" />
          );
        }
      }
    }
    default: {
      switch (itemType) {
        case ITEM_TYPES.ANSWER: {
          return (
            <Text fontSize="16px" lineHeight="20px">
              {record.getCellValueAsString(field)}
            </Text>
          );
        }
        case ITEM_TYPES.QUESTION_SMALL: {
          return (
            <Text fontSize="40px" lineHeight="44px">
              {record.getCellValueAsString(field)}
            </Text>
          );
        }
        case ITEM_TYPES.QUESTION: {
          console.log("question");
          return (
            <Text fontSize="60px" lineHeight="72px">
              {record.getCellValueAsString(field)}
            </Text>
          );
        }
      }
    }
  }
}

CustomCellRenderer.propTypes = {
  record: PropTypes.instanceOf(Record).isRequired,
  field: PropTypes.instanceOf(Field).isRequired,
};
