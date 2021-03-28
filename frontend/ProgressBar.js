import React, { Fragment, useEffect, useState, useRef } from "react";
import { Box, Button, expandRecord, Text, Icon } from "@airtable/blocks/ui";

export default function ({
  masteredRecordsNum,
  reviewingRecordsNum,
  learningRecordsNum,
  recordsNum,
}) {
  return (
    <Box marginTop="16px">
      <Text size="default">{`You have mastered ${masteredRecordsNum} of ${recordsNum} records`}</Text>
      <Box
        marginTop="6px"
        marginBottom="15px"
        height="20px"
        backgroundColor="#f5f5f5"
        boxShadow="inset 0 1px 2px rgb(0 0 0 / 10%)"
        width="100%"
        borderRadius="large"
        overflow="hidden"
      >
        <Box
          width={
            (parseFloat(masteredRecordsNum / recordsNum) * 100).toFixed(2) + "%"
          }
          height="100%"
          backgroundColor="#37b95c"
        />
      </Box>
      <Text size="default">{`You are reviewing ${reviewingRecordsNum} of ${recordsNum} records`}</Text>
      <Box
        marginTop="6px"
        marginBottom="15px"
        height="20px"
        backgroundColor="#f5f5f5"
        boxShadow="inset 0 1px 2px rgb(0 0 0 / 10%)"
        width="100%"
        borderRadius="large"
        overflow="hidden"
      >
        <Box
          width={
            (parseFloat(reviewingRecordsNum / recordsNum) * 100).toFixed(2) +
            "%"
          }
          height="100%"
          backgroundColor="#F6A351"
        />
      </Box>
      <Text size="default">{`You are learning ${learningRecordsNum} of ${recordsNum} records`}</Text>
      <Box
        marginTop="6px"
        marginBottom="15px"
        height="20px"
        backgroundColor="#f5f5f5"
        boxShadow="inset 0 1px 2px rgb(0 0 0 / 10%)"
        width="100%"
        borderRadius="large"
        overflow="hidden"
      >
        <Box
          width={
            (parseFloat(learningRecordsNum / recordsNum) * 100).toFixed(2) + "%"
          }
          height="100%"
          backgroundColor="#d9595d"
        />
      </Box>
    </Box>
  );
}
