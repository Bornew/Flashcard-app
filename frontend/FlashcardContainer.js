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
 * Picking a random record or a record in sequence from the given records based on the user setting
 * In RANDOM mode, both unfamiliar records and unknown records will appear randomly;
 * In NORMAL mode, both unfamiliar records and unknown records will appear in sequence;
 * Every record that the user does not know will repeat at least twice. (learning -> reviewing -> mastered)
 * Keep track of the familiarity of the records and store the learning situation in the specified fields (if specified in setting form);
 */

async function addChoiceToSelectField(selectField, nameForNewOption) {
  const updatedOptions = {
    choices: [...selectField.options.choices, { name: nameForNewOption }],
  };
  if (selectField.hasPermissionToUpdateOptions(updatedOptions)) {
    await selectField.updateOptionsAsync(updatedOptions);
    console.log("successfully added option" + nameForNewOption);
  }
}

export default function FlashcardContainer({ records, settings, isRandom }) {
  const [shouldShowAnswer, setShouldShowAnswer] = useState(false);
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
  ); // unfamiliar records will be marked as "learning"
  const [reviewingRecordsSet, setReviewingRecordsSet] = useState(
    settings.statusField
      ? new Set(
          records.filter(
            (r) =>
              r.getCellValue(settings.statusField) &&
              r.getCellValueAsString(settings.statusField) ===
                STATUS_TYPES.REVIEWING
          )
        )
      : new Set()
  ); // reviewing records will be marked as "reviewing"
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
  ); // mastered records will be marked as "mastered"
  const [record, setRecord] = useState(
    isRandom
      ? _.sample(
          records.filter((r) => r !== record && !masteredRecordsSet.has(r))
        )
      : records.filter((r) => r !== record && !masteredRecordsSet.has(r)).length
      ? records.filter((r) => r !== record && !masteredRecordsSet.has(r))[0]
      : null
  ); // all the records that are not mastered
  const [masteredRecordsNum, setMasteredRecordsNum] = useState(
    masteredRecordsSet.size
  ); // count the num of the records that the user have mastered
  const [learningRecordsNum, setLearningRecordsNum] = useState(
    learningRecordsSet.size
  ); // count the num of the records that the user don't know
  const [reviewingRecordsNum, setReviewingRecordsNum] = useState(
    reviewingRecordsSet.size
  ); // count the num of the records being reviewed

  useEffect(() => {
    if (settings.statusField) {
      addChoiceToSelectField(settings.statusField, STATUS_TYPES.LEARNING);
      addChoiceToSelectField(settings.statusField, STATUS_TYPES.MASTERED);
      addChoiceToSelectField(settings.statusField, STATUS_TYPES.REVIEWING);
      addChoiceToSelectField(settings.statusField, STATUS_TYPES.UNTOUCHED);
      console.log("success");
    }
  }, []);

  useEffect(() => {
    reset();
  }, [settings]);

  function updateSingleSelectRecord(id, name) {
    settings.table.updateRecordAsync(record, {
      [id]: { name: name },
    });
  }

  function handleUpdateRecord(record, status) {
    /**
     * The classification of cards follows simple rules: 1. new card -> mastered; 2. new card -> learning -> reviewing -> mastered
     * Only unfamiliar cards will reappear; mastered cards would not appear untill the user wants to restart
     * In this way the flashcards focuses on the words the user needs to review the most and helps the user to memorize effectively
     */

    switch (status) {
      case STATUS_TYPES.MASTERED: {
        if (learningRecordsSet.has(record)) {
          // if the record was specified as "don't know" by the user at first, this time it is classified as "reviewing"
          const newReviewingRecordsSet = new Set(reviewingRecordsSet);
          setReviewingRecordsSet(newReviewingRecordsSet.add(record));
          setReviewingRecordsNum(reviewingRecordsNum + 1);
          // removed the record from the learning set
          const newLearningRecordsSet = new Set(learningRecordsSet);
          newLearningRecordsSet.delete(record);
          setLearningRecordsSet(newLearningRecordsSet);
          setLearningRecordsNum(learningRecordsNum - 1);
          settings.statusField
            ? updateSingleSelectRecord(
                settings.statusField.id,
                STATUS_TYPES.REVIEWING
              )
            : ""; // track in the statusField if specified
        } else if (reviewingRecordsSet.has(record)) {
          // if the record was classified as "reviewing", this time it is classified as "mastered"
          const newMasteredRecordsSet = new Set(masteredRecordsSet);
          setMasteredRecordsSet(newMasteredRecordsSet.add(record));
          setMasteredRecordsNum(masteredRecordsNum + 1);
          // removed the record from the reviewing set
          const newReviewingRecordsSet = new Set(reviewingRecordsSet);
          newReviewingRecordsSet.delete(record);
          setReviewingRecordsSet(newReviewingRecordsSet);
          setReviewingRecordsNum(reviewingRecordsNum - 1);
          settings.statusField
            ? updateSingleSelectRecord(
                settings.statusField.id,
                STATUS_TYPES.MASTERED
              )
            : "";
          settings.numbersField
            ? settings.table.updateRecordAsync(record, {
                [settings.numbersField.id]: record.getCellValue(
                  settings.numbersField
                )
                  ? record.getCellValue(settings.numbersField) + 1
                  : 1,
              })
            : "";
        } else if (!masteredRecordsSet.has(record)) {
          // if the record was never touched previously, this time it is classified as "mastered"
          const newMasteredRecordsSet = new Set(masteredRecordsSet);
          setMasteredRecordsSet(newMasteredRecordsSet.add(record));
          setMasteredRecordsNum(masteredRecordsNum + 1);
          settings.statusField
            ? updateSingleSelectRecord(
                settings.statusField.id,
                STATUS_TYPES.MASTERED
              )
            : "";

          // store the times the word is specified as "mastered"
          settings.numbersField
            ? settings.table.updateRecordAsync(record, {
                [settings.numbersField.id]: record.getCellValue(
                  settings.numbersField
                )
                  ? record.getCellValue(settings.numbersField) + 1
                  : 1,
              })
            : "";
        }
        break;
      }
      case STATUS_TYPES.LEARNING: {
        if (masteredRecordsSet.has(record)) {
          // if the record was specified as "mastered", this time it would be classified as learning
          const newLearningRecordsSet = new Set(learningRecordsSet);
          setLearningRecordsSet(newLearningRecordsSet.add(record));
          setLearningRecordsNum(learningRecordsNum + 1);
          // remove the records from the mastered set
          const newMasteredRecordsSet = new Set(masteredRecordsSet);
          newMasteredRecordsSet.delete(record);
          setMasteredRecordsSet(newMasteredRecordsSet);
          setMasteredRecordsNum(masteredRecordsNum - 1);
          settings.statusField
            ? updateSingleSelectRecord(
                settings.statusField.id,
                STATUS_TYPES.LEARNING
              )
            : "";
        } else if (reviewingRecordsSet.has(record)) {
          // if the record was being reviewed, this time it would be classified as learning
          const newLearningRecordsSet = new Set(learningRecordsSet);
          setLearningRecordsSet(newLearningRecordsSet.add(record));
          setLearningRecordsNum(learningRecordsNum + 1);
          // removed the record from the reviewing set
          const newReviewingRecordsSet = new Set(reviewingRecordsSet);
          newReviewingRecordsSet.delete(record);
          setReviewingRecordsSet(newReviewingRecordsSet);
          setReviewingRecordsNum(reviewingRecordsNum - 1);
          settings.statusField
            ? updateSingleSelectRecord(
                settings.statusField.id,
                STATUS_TYPES.LEARNING
              )
            : "";
        } else if (!learningRecordsSet.has(record)) {
          // if the record was not touched, this time it should be classified as learning
          const newLearningRecordsSet = new Set(learningRecordsSet);
          setLearningRecordsSet(newLearningRecordsSet.add(record));
          setLearningRecordsNum(learningRecordsNum + 1);
          settings.statusField
            ? updateSingleSelectRecord(
                settings.statusField.id,
                STATUS_TYPES.LEARNING
              )
            : "";
        }

        break;
      }
      default: {
      }
    }
    handleNewRecord();
    handleToggleRecord();
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
      console.log("not random");
      setRecord(
        records.filter((r) => r !== record && !masteredRecordsSet.has(r)).length
          ? records.filter((r) => r !== record && !masteredRecordsSet.has(r))[0]
          : null
      );
    }
  }

  function getStatus() {
    if (record && settings.statusField) {
      // if the user specifies the statusField, use the previous status value as the background color;
      let statusCellValue = record.getCellValueAsString(settings.statusField);
      switch (statusCellValue) {
        case STATUS_TYPES.LEARNING: {
          return STATUS_TYPES.LEARNING;
        }
        case STATUS_TYPES.REVIEWING: {
          return STATUS_TYPES.REVIEWING;
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
        return STATUS_TYPES.MASTERED;
      } else if (reviewingRecordsSet.has(record)) {
        return STATUS_TYPES.REVIEWING;
      } else if (learningRecordsSet.has(record)) {
        return STATUS_TYPES.LEARNING;
      } else {
        return null;
      }
    }
  }
  function reset() {
    setMasteredRecordsSet(new Set());
    setLearningRecordsSet(new Set());
    setReviewingRecordsSet(new Set());
    setMasteredRecordsNum(0);
    setLearningRecordsNum(0);
    setReviewingRecordsNum(0);
    isRandom ? setRecord(_.sample(records)) : setRecord(records[0]);
  }

  // Handle updating record and other classified record sets due to records changing
  useEffect(() => {
    const allRecordsSet = new Set(records);
    const newLearningRecordsSet = new Set();
    const newMasteredRecordsSet = new Set();
    const newReviewingRecordsSet = new Set();
    for (const learningRecord of learningRecordsSet) {
      if (allRecordsSet.has(learningRecord)) {
        newLearningRecordsSet.add(learningRecord);
      }
    }
    for (const reviewingRecord of reviewingRecordsSet) {
      if (allRecordsSet.has(reviewingRecord)) {
        newReviewingRecordsSet.add(reviewingRecord);
      }
    }
    for (const masteredRecord of masteredRecordsSet) {
      if (allRecordsSet.has(masteredRecord)) {
        newMasteredRecordsSet.add(masteredRecord);
      }
    }
    if (newLearningRecordsSet.size !== learningRecordsSet.size) {
      setLearningRecordsSet(newLearningRecordsSet);
    }
    if (newReviewingRecordsSet.size !== reviewingRecordsSet.size) {
      setReviewingRecordsSet(newReviewingRecordsSet);
    }
    if (newMasteredRecordsSet.size !== masteredRecordsSet.size) {
      setMasteredRecordsSet(newMasteredRecordsSet);
    }

    if (!allRecordsSet.has(record)) {
      handleNewRecord();
    }
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
            handleToggleRecord();
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
            reviewingRecordsNum={reviewingRecordsNum}
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
