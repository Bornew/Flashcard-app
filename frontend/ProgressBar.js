import React, { Fragment, useEffect, useState, useRef } from "react";
import { Box, Button, expandRecord, Text, Icon } from "@airtable/blocks/ui";

export default function ({
  masteredRecordsNum,
  learningRecordsNum,
  recordsNum,
}) {
  return (
    <Box marginTop="16px">
      <Text size="default">{`You have mastered ${masteredRecordsNum} of ${recordsNum} records; ${learningRecordsNum} records still need to be reviewed`}</Text>
      <Box
        marginTop="6px"
        height="24px"
        backgroundColor="#f5f5f5"
        boxShadow="inset 0 1px 2px rgb(0 0 0 / 10%)"
        width="100%"
        borderRadius="large"
        overflow="hidden"
      >
        <Box width="100%" height="100%" display="flex" flexDirection="row">
          <Box
            width={
              (parseFloat(masteredRecordsNum / recordsNum) * 100).toFixed(2) +
              "%"
            }
            height="100%"
            backgroundColor="#37b95c"
          />
          <Box
            width={
              (parseFloat(learningRecordsNum / recordsNum) * 100).toFixed(2) +
              "%"
            }
            height="100%"
            backgroundColor="#f6a351"
          />
        </Box>
      </Box>
    </Box>
  );
}
