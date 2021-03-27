import _ from "lodash";
import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { Field, Record } from "@airtable/blocks/models";
import { Box, Button, expandRecord, Text, Icon } from "@airtable/blocks/ui";
import FlashcardMagoosh from "./Flashcard-magoosh";
import Congratscard from "./Congratscard";
import { ITEM_TYPES, STATUS_TYPES } from "./config.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRandom, faRedo } from "@fortawesome/fontawesome-free-solid";
import ProgressBar from "./ProgressBar";
/**
 * Responsible for picking a random record from the given records.
 * Keeps track of removed records.
 */
export default function FlashcardContainer({ records, settings }) {
  const [isRandom, setIsRandom] = useState(true);
  let recordIterator = records.values();
  const [shouldShowAnswer, setShouldShowAnswer] = useState(false);
  //   const [recordStatus, setRecordStatus] = useState(null);
  const [learningRecordsSet, setLearningRecordsSet] = useState(
    settings.statusField
      ? new Set(
          records.filter(
            (r) =>
              r.getCellValue(settings.statusField) &&
              r.getCellValueAsString(settings.statusField) ===
                STATUS_TYPES.LEARNING
          )
        )
      : new Set()
  ); //学习中
  const [masteredRecordsSet, setMasteredRecordsSet] = useState(
    settings.statusField
      ? new Set(
          records.filter(
            (r) =>
              r.getCellValue(settings.statusField) &&
              r.getCellValue(settings.statusField).name ===
                STATUS_TYPES.MASTERED
          )
        )
      : new Set()
  ); //已掌握
  const [record, setRecord] = useState(
    _.sample(records.filter((r) => r !== record && !masteredRecordsSet.has(r)))
  );
  const [masteredRecordsNum, setMasteredRecordsNum] = useState(
    masteredRecordsSet.size
  );
  const [learningRecordsNum, setLearningRecordsNum] = useState(
    learningRecordsSet.size
  );
  const [completeStatus, setCompleteStatus] = useState(false);
  const flashCardRef = useRef();

  function handleCheckRandom(event) {
    setIsRandom(event.currentTarget.checked);
  }

  function handleUpdateRecord(record, status) {
    settings.statusField
      ? settings.table.updateRecordAsync(record, {
          [settings.statusField.id]: { name: status },
        })
      : "";

    switch (status) {
      case STATUS_TYPES.MASTERED: {
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
        settings.numbersField
          ? settings.table.updateRecordAsync(record, {
              [settings.numbersField.id]: record.getCellValue(
                settings.numbersField
              )
                ? record.getCellValue(settings.numbersField) + 1
                : 1,
            })
          : "";
        handleToggleRecord();
        break;
      }
      case STATUS_TYPES.LEARNING: {
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
    if (isRandom) {
      setRecord(
        _.sample(
          records.filter((r) => r !== record && !masteredRecordsSet.has(r))
        )
      );
    } else {
      console.log("ordered", recordIterator.next().type);
    }
  }

  function getStatus() {
    if (record && settings.statusField) {
      // if the user specifies the statusField, use the previous status value as the background color;
      let statusCellValue = record.getCellValueAsString(settings.statusField);
      console.log(statusCellValue);
      switch (statusCellValue) {
        case STATUS_TYPES.LEARNING: {
          return STATUS_TYPES.LEARNING;
        }
        case STATUS_TYPES.MASTERED: {
          return STATUS_TYPES.MASTERED;
        }
        default:
          return null;
      }
    } else if (record) {
      // otherwise use the status value in the local storage
      if (masteredRecordsSet.has(record)) {
        console.log("yes you have mastered!");
        return STATUS_TYPES.MASTERED;
      } else if (learningRecordsSet.has(record)) {
        console.log("word is learning");
        return STATUS_TYPES.LEARNING;
      } else {
        return null;
      }
    }
  }
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
            handleUpdateRecord(record, STATUS_TYPES.MASTERED);
          }}
          pointer="cursor"
          width="100%"
          height="44px"
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
          onClick={() => handleUpdateRecord(record, STATUS_TYPES.LEARNING)}
          pointer="cursor"
          width="100%"
          height="44px"
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
          height="44px"
          backgroundColor="#bcf5cc"
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          borderRadius="0 0 4px 4px"
        >
          <Icon name="redo" size={16} fillColor="#37b95c" />
          <Text fontSize="16px" textColor="#37b95c" marginX="6px">
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
            display="flex"
            width="100%"
            flexDirection="row"
            justifyContent="space-between"
            marginBottom="16px"
          >
            <Box display="flex" flexDirection="row" alignItems="center">
              <FontAwesomeIcon icon={faRandom} color="rgba(0, 0, 0, 0.6)" />
              <Text
                fontSize="12px"
                color="rgba(0, 0, 0, 0.6)"
                marginX="8px"
                fontWeight="300"
              >
                Words you don't know will reappear later
              </Text>
            </Box>
            {/* <Box display="flex" flexDirection="row" alignItems="center">
              <input
                type="checkbox"
                checked={isRandom}
                onChange={handleCheckRandom}
              />
              <Text
                fontSize="12px"
                color="rgba(0, 0, 0, 0.6)"
                marginX="8px 0"
                fontWeight="300"
              >
                Random Mode
              </Text>
            </Box> */}
          </Box>
          <Box
            marginBottom={3}
            width="100%"
            height="320px"
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
                recordStatus={getStatus()}
              />
            ) : (
              <Congratscard />
            )}
            {btnGroup}
          </Box>
          <ProgressBar
            masteredRecordsNum={masteredRecordsNum}
            learningRecordsNum={learningRecordsNum}
            recordsNum={records.length}
          />
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
