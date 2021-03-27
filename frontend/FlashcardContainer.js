import _ from "lodash";
import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { Field, Record } from "@airtable/blocks/models";
import { Box, Button, expandRecord, Text } from "@airtable/blocks/ui";
import FlashcardMagoosh from "./Flashcard-magoosh";
import Congratscard from "./Congratscard";

/**
 * Responsible for picking a random record from the given records.
 * Keeps track of removed records.
 */
export default function FlashcardContainer({ records, settings }) {
  const randomSequence = false;
  const [record, setRecord] = useState(_.sample(records));
  let recordIterator = records.values();
  const [shouldShowAnswer, setShouldShowAnswer] = useState(false);
  const [learningRecordsSet, setLearningRecordsSet] = useState(
    new Set(
      records.filter(
        (r) =>
          r.getCellValue(settings.statusField) &&
          r.getCellValue(settings.statusField).name === "learning"
      )
    )
  ); //学习中
  const [masteredRecordsSet, setMasteredRecordsSet] = useState(
    new Set(
      records.filter(
        (r) =>
          r.getCellValue(settings.statusField) &&
          r.getCellValue(settings.statusField).name === "mastered"
      )
    )
  ); //已掌握
  const [masteredRecordsNum, setMasteredRecordsNum] = useState(
    masteredRecordsSet.size
  );
  const [learningRecordsNum, setLearningRecordsNum] = useState(
    learningRecordsSet.size
  );
  const [completeStatus, setCompleteStatus] = useState(false);
  const flashCardRef = useRef();

  function handleUpdateRecord(record, status) {
    settings.table.updateRecordAsync(record, {
      [settings.statusField.id]: { name: status },
    });

    switch (status) {
      case "mastered": {
        // 如果status是mastered，并且愿状态不是mastered，更新原record，同时更新masteredRecordsSet
        // 如果在 learning 中，则需要移除

        if (!masteredRecordsSet.has(record)) {
          const newMasteredRecordsSet = new Set(masteredRecordsSet);
          setMasteredRecordsSet(newMasteredRecordsSet.add(record));
          setMasteredRecordsNum(masteredRecordsNum + 1);
        }
        if (learningRecordsSet.has(record)) {
          console.log("learningRecord has this word!");
          const newLearningRecordsSet = new Set(learningRecordsSet);
          newLearningRecordsSet.delete(record);
          setLearningRecordsSet(newLearningRecordsSet);
          setLearningRecordsNum(learningRecordsNum - 1);
        }
        settings.table.updateRecordAsync(record, {
          [settings.numbersField.id]: record.getCellValue(
            settings.numbersField.name
          )
            ? record.getCellValue(settings.numbersField.name) + 1
            : 1,
        });
        handleToggleRecord();
        break;
      }
      case "learning": {
        // 如果status是learning，并且原状态不是learning，更新原record，同时更新learningRecordsSet
        // 如果在mastered中，则需要移除

        if (!learningRecordsSet.has(record)) {
          const newLearningRecordsSet = new Set(learningRecordsSet);
          setLearningRecordsSet(newLearningRecordsSet.add(record));
          setLearningRecordsNum(learningRecordsNum + 1);
        }
        if (masteredRecordsSet.has(record)) {
          console.log("masteredRecord has this word!");
          const newMasteredRecordsSet = new Set(masteredRecordsSet);
          newMasteredRecordsSet.delete(record);
          setMasteredRecordsSet(newMasteredRecordsSet);
          setMasteredRecordsNum(masteredRecordsNum - 1);
        }
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
    // console.log(recordIterator.next());
    for (let learningRecord of learningRecordsSet) {
      console.log(
        "learningRecord",
        learningRecord.getCellValue(settings.questionField)
      );
    }
    setRecord(
      _.sample(
        records.filter((r) => r !== record && !masteredRecordsSet.has(r))
      )
    );
  }

  function handleNewRecordSequence() {}

  function reset() {
    setRecord(_.sample(records));
    setMasteredRecordsSet(new Set());
    setLearningRecordsSet(new Set());
    setMasteredRecordsNum(0);
    setLearningRecordsNum(0);
  }

  // Handle updating record and removedRecordsSet due to records changing
  useEffect(() => {
    const allRecordsSet = new Set(records);
    const newLearningRecordsSet = new Set();
    const newMasteredRecordsSet = new Set();
    for (const learningRecord of learningRecordsSet) {
      if (allRecordsSet.has(learningRecord)) {
        newLearningRecordsSet.add(learningRecord);
      }
    }
    for (const masteredRecord of masteredRecordsSet) {
      if (allRecordsSet.has(masteredRecord)) {
        newMasteredRecordsSet.add(masteredRecord);
      }
    }
    if (newLearningRecordsSet.size !== learningRecordsSet.size) {
      console.log(newLearningRecordsSet.size, learningRecordsSet.size);
      setLearningRecordsSet(newLearningRecordsSet);
      console.log(learningRecordsSet);
    }
    if (newMasteredRecordsSet.size !== masteredRecordsSet.size) {
      console.log(newMasteredRecordsSet.size, masteredRecordsSet.size);
      setMasteredRecordsSet(newMasteredRecordsSet);
    }
    if (!allRecordsSet.has(record)) {
      handleNewRecord();
    }
    console.log(
      `There are ${records.length} records in this table view. You have mastered ${masteredRecordsNum} records, ${learningRecordsNum} records still need to be reviewed.`
    );
  }, [records]);
  let btnGroup;
  if (record) {
    btnGroup = shouldShowAnswer ? (
      <Box height="auto" width="100%">
        <Box
          onClick={() => {
            console.log("Button Clicked!");
            handleUpdateRecord(record, "mastered");
          }}
          pointer="cursor"
          width="100%"
          height="50px"
          backgroundColor="#bcf5cc"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="14px" textColor="#37b95c">
            ✓ I know it
          </Text>
        </Box>
        <Box
          onClick={() => handleUpdateRecord(record, "learning")}
          pointer="cursor"
          width="100%"
          height="50px"
          backgroundColor="#fccfd0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="0 0 4px 4px"
        >
          <Text fontSize="14px" textColor="#d9595d">
            ✗ I don't know
          </Text>
        </Box>
      </Box>
    ) : null;
  } else {
    btnGroup = (
      <Box height="auto" width="100%">
        <Box
          onClick={() => {
            console.log("Restart!");
            reset();
          }}
          pointer="cursor"
          width="100%"
          height="50px"
          backgroundColor="#bcf5cc"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="0 0 4px 4px"
        >
          <Text fontSize="12px" textColor="#37b95c">
            Restart
          </Text>
        </Box>
      </Box>
    );
  }

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
            boxShadow="0 4px 6px rgb(0 0 0 / 10%)"
            onClick={handleToggleRecord}
            style={{ cursor: "pointer" }}
            borderRadius="4px"
          >
            {record ? (
              <FlashcardMagoosh
                record={record}
                settings={settings}
                shouldShowAnswer={shouldShowAnswer}
                handleUpdateRecord={handleUpdateRecord}
              />
            ) : (
              <Congratscard congratsSentence="🎉 Congrats!" />
            )}
            {btnGroup}
          </Box>
          <Box marginTop="12px">
            <Text size="default">{`You have mastered ${masteredRecordsNum} of ${records.length} records; ${learningRecordsNum} records still need to be reviewed`}</Text>
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
