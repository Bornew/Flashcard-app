import _ from "lodash";
import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { Field, Record } from "@airtable/blocks/models";
import { Box, Button, expandRecord, Text } from "@airtable/blocks/ui";
import FlashcardMagoosh from "./Flashcard-magoosh";

/**
 * Responsible for picking a random record from the given records.
 * Keeps track of removed records.
 */
export default function FlashcardContainer({ records, settings }) {
  const [record, setRecord] = useState(_.sample(records));
  const [removedRecordsSet, setRemovedRecordsSet] = useState(new Set());
  const [shouldShowAnswer, setShouldShowAnswer] = useState(false);
  const [learningRecordsSet, setLearningRecordsSet] = useState(new Set()); //学习中
  const [masteredRecordsSet, setMasteredRecordsSet] = useState(new Set()); //已掌握
  const [masteredRecordsNum, setMasteredRecordsNum] = useState(0);
  const [learningRecordsNum, setLearningRecordsNum] = useState(0);
  const flashCardRef = useRef();
  //   console.log(records);
  console.log("共有" + records.length + "个单词");

  function handleUpdateRecord(record, status) {
    console.log(
      record.getCellValue(settings.numbersField),
      record.getCellValue(settings.statusField).name,
      status
    );

    settings.table.updateRecordAsync(record, {
      [settings.statusField.name]: { name: status },
    });

    switch (status) {
      case "mastered": {
        // 如果status是mastered，更新原record，同时更新masteredRecordsSet
        const newMasteredRecordsSet = new Set(masteredRecordsSet);
        setMasteredRecordsSet(newMasteredRecordsSet.add(record));
        setMasteredRecordsNum(masteredRecordsNum + 1);
        settings.table.updateRecordAsync(record, {
          [settings.numbersField.name]: record.getCellValue(
            settings.numbersField.name
          )
            ? record.getCellValue(settings.numbersField.name) + 1
            : 1,
        });
        handleToggleRecord();
        break;
      }
      case "learning": {
        // 如果status是learning，更新原record，同时更新learningRecordsSet
        const newLearningRecordsSet = new Set(learningRecordsSet);
        setLearningRecordsSet(newLearningRecordsSet.add(record));
        setLearningRecordsNum(learningRecordsNum + 1);
        handleToggleRecord();
        break;
      }
      default: {
        handleToggleRecord();
      }
    }
    handleNewRecord();
  }
  function handleToggleRecord() {
    setShouldShowAnswer(!shouldShowAnswer);
  }

  function handleNewRecord() {
    setRecord(
      _.sample(
        records.filter(
          (r) =>
            r !== record &&
            !learningRecordsSet.has(r) &&
            !masteredRecordsSet.has(r)
        )
      )
    );
  }

  function reset() {
    setLearningRecordsSet(new Set());
    setMasteredRecordsSet(new Set());
    // Can't use handleNewRecord here because setting state is async, so removedRecordsSet won't
    // be updated yet.
    setRecord(_.sample(records));
  }

  // Handle updating record and removedRecordsSet due to records changing
  useEffect(() => {
    const allRecordsSet = new Set(records);
    const newLearningRecordsSet = new Set();
    const newMasteredRecordsSet = new Set();
    for (const removedRecord of removedRecordsSet) {
      if (allRecordsSet.has(removedRecord)) {
        newRemovedRecordsSet.add(removedRecord);
      }
    }
    if (newLearningRecordsSet.size !== learningRecordsSet.size) {
      setLearningRecordsSet(newLearningRecordsSet);
    }
    if (newMasteredRecordsSet.size !== masteredRecordsSet.size) {
      setMasteredRecordsSet(newMasteredRecordsSet);
    }
    if (!allRecordsSet.has(record)) {
      handleNewRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);

  return (
    <Fragment>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="100%"
      >
        <Box
          display="flex"
          flexDirection="column"
          paddingLeft={6}
          paddingRight={6}
          paddingTop={5}
          align-items="center"
        >
          <Box
            marginBottom={3}
            width="100%"
            height="300px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            boxShadow="0 1px 2px rgb(0 0 0 / 10%)"
            onClick={handleToggleRecord}
            style={{ cursor: "pointer" }}
          >
            <FlashcardMagoosh
              record={record}
              settings={settings}
              shouldShowAnswer={shouldShowAnswer}
              handleUpdateRecord={handleUpdateRecord}
            />
          </Box>
          <Box marginTop="12px">
            <Text size="default">{`You have mastered ${masteredRecordsNum} of ${records.length} words; ${learningRecordsNum} words still needs reviewing`}</Text>
            <Box
              marginTop="6px"
              height="24px"
              backgroundColor="#f5f5f5"
              boxShadow="inset 0 1px 2px rgb(0 0 0 / 10%)"
              width="100%"
              borderRadius="large"
              overflow="hidden"
            >
              <Box
                width="100%"
                height="100%"
                display="flex"
                flexDirection="row"
              >
                <Box
                  width={
                    (
                      parseFloat(masteredRecordsNum / records.length) * 100
                    ).toFixed(2) + "%"
                  }
                  height="100%"
                  backgroundColor="#37b95c"
                />
                <Box
                  width={
                    (
                      parseFloat(learningRecordsNum / records.length) * 100
                    ).toFixed(2) + "%"
                  }
                  height="100%"
                  backgroundColor="#f6a351"
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box flex="none" borderTop="none" display="flex" padding={3}>
          {record && (
            <Button
              icon="expand"
              variant="secondary"
              onClick={() => expandRecord(record)}
            >
              Expand
            </Button>
          )}
        </Box>
      </Box>
    </Fragment>
  );
}

FlashcardContainer.propTypes = {
  records: PropTypes.arrayOf(PropTypes.instanceOf(Record)).isRequired,
  settings: PropTypes.shape({
    questionField: PropTypes.instanceOf(Field).isRequired,
    answerField: PropTypes.instanceOf(Field),
    statusField: PropTypes.instanceOf(Field),
    numbersField: PropTypes.instanceOf(Field),
  }).isRequired,
};
