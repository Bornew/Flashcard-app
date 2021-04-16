import PropTypes, { number } from "prop-types";
import { useBase, useGlobalConfig } from "@airtable/blocks/ui";
import React, { Fragment, useState } from "react";
import { Table, FieldType } from "@airtable/blocks/models";
import {
  Box,
  Button,
  FieldPicker,
  FieldPickerSynced,
  Dialog,
  Heading,
  FormField,
  TablePicker,
  TablePickerSynced,
  ViewPicker,
  ViewPickerSynced,
  SelectButtons,
} from "@airtable/blocks/ui";

import { ConfigKeys } from "./settings";

async function setSettings(
  table,
  view,
  questionField,
  answerField,
  numberField,
  statusField
) {
  // 待修复
  //   const globalConfig = useGlobalConfig();
  //   console.log(globalConfig);
  //   await globalConfig.setAsync(globalConfig.get(ConfigKeys.TABLE_ID), table.id);
  //   //
  //   await globalConfig.setAsync(globalConfig.get(ConfigKeys.VIEW_ID), view.id);
  //   await globalConfig.setAsync(
  //     globalConfig.get(ConfigKeys.QUESTION_FIELD_ID),
  //     questionField.id
  //   );
  //   await globalConfig.setAsync(
  //     globalConfig.get(ConfigKeys.ANSWER_FIELD_ID),
  //     answerField.id
  //   );
  //   await globalConfig.setAsync(
  //     globalConfig.get(ConfigKeys.NUMBERS_FIELD_ID),
  //     numberField.id
  //   );
  //   await globalConfig.setAsync(
  //     globalConfig.get(ConfigKeys.STATUS_FIELD_ID),
  //     statusField.id
  //   );
}

export default function SettingDialog({
  setIsSettingsVisible,
  settings,
  isRandom,
  setIsRandom,
}) {
  const modeOptions = [
    { value: "random", label: "Random" },
    { value: "normal", label: "Normal" },
  ];
  const [table, setTable] = useState(settings.table);
  const [view, setView] = useState(settings.view);
  const [questionField, setQuestionField] = useState(settings.questionField);
  const [answerField, setAnswerField] = useState(settings.answerField);
  const [statusField, setStatusField] = useState(settings.statusField);
  const [numberField, setNumberField] = useState(settings.numberField);
  const [randomState, setRandomState] = useState(isRandom);
  const base = useBase();
  const globalConfig = useGlobalConfig();
  //   const tableId = globalConfig.get(ConfigKeys.TABLE_ID); //获取tableId globalConfig 指定
  //   const table = base.getTableByIdIfExists(tableId); //table 初始化

  // todo: settings 设置完毕，点击“Done”，左侧reset；没有点击“Done”，不会重新reset，
  // 处理字符溢出情况

  return (
    <Dialog
      onClose={() => setIsSettingsVisible(false)}
      width="640px"
      padding={4}
      paddingBottom={2}
    >
      <Dialog.CloseButton />
      <Heading marginBottom={3}>Settings</Heading>
      <Box display="flex" flexDirection="row" marginY={2}>
        <FormField label="Table" marginRight={2}>
          <TablePicker
            globalConfigKey={ConfigKeys.TABLE_ID}
            table={settings.table}
            onChange={(table) => {
              console.log(table);
              setTable(table);
            }}
          />
        </FormField>

        {table && (
          <FormField label="View">
            <ViewPicker
              table={table}
              view={settings.view}
              globalConfigKey={ConfigKeys.VIEW_ID}
              onChange={(view) => {
                console.log(view);
                setView(view);
              }}
            />
          </FormField>
        )}
      </Box>

      <Box display="flex" flexDirection="row" marginY={2}>
        {table && (
          <Fragment>
            <FormField label="Question field" marginRight={2}>
              <FieldPicker
                table={settings.table}
                field={settings.questionField}
                globalConfigKey={ConfigKeys.QUESTION_FIELD_ID}
                shouldAllowPickingNone={false}
                allowedTypes={[
                  FieldType.RICH_TEXT,

                  FieldType.SINGLE_LINE_TEXT,

                  FieldType.AUTO_NUMBER,

                  FieldType.URL,

                  FieldType.SINGLE_SELECT,

                  FieldType.MULTILINE_TEXT,

                  FieldType.MULTIPLE_ATTACHMENTS,
                ]}
                onChange={(questionField) => {
                  setQuestionField(questionField);
                }}
              />
            </FormField>

            <FormField label="Answer field">
              <FieldPicker
                table={settings.table}
                field={settings.answerField}
                globalConfigKey={ConfigKeys.ANSWER_FIELD_ID}
                shouldAllowPickingNone={false}
                onChange={(answerField) => {
                  setAnswerField(answerField);
                }}
              />
            </FormField>
          </Fragment>
        )}
      </Box>

      <Box display="flex" flexDirection="row" marginY={2}>
        {table && (
          <Fragment>
            <FormField label="Status field (optional)" marginRight={2}>
              <FieldPicker
                table={settings.table}
                field={settings.statusField}
                shouldAllowPickingNone={true}
                globalConfigKey={ConfigKeys.STATUS_FIELD_ID}
                allowedTypes={[FieldType.SINGLE_SELECT]}
                onChange={(statusField) => {
                  setStatusField(statusField);
                }}
              />
            </FormField>

            <FormField label="Numbers field (optional)">
              <FieldPicker
                table={settings.table}
                field={settings.numberField}
                shouldAllowPickingNone={true}
                globalConfigKey={ConfigKeys.NUMBERS_FIELD_ID}
                allowedTypes={[FieldType.NUMBER]}
                onChange={(numberField) => {
                  setNumberField(numberField);
                }}
              />
            </FormField>
          </Fragment>
        )}
      </Box>

      <Box display="flex" flexDirection="row" marginY={2}>
        {table && (
          <FormField label="Select a mode" marginRight={2}>
            <SelectButtons
              value={isRandom ? modeOptions[0].value : modeOptions[1].value}
              onChange={(newValue) => {
                setIsRandom(newValue == modeOptions[0].value ? true : false);
                setRandomState(newValue == modeOptions[0].value ? true : false);
              }}
              options={modeOptions}
            />
          </FormField>
        )}
      </Box>

      <Box
        flex="none"
        display="flex"
        justifyContent="flex-end"
        paddingY={3}
        borderTop="thick"
      >
        <Button
          variant="primary"
          size="large"
          onClick={() => {
            console.log(
              table,
              view,
              questionField,
              answerField,
              numberField,
              statusField
            );
            setIsSettingsVisible(false);
          }}
        >
          Done
        </Button>
      </Box>
    </Dialog>
  );
}

SettingDialog.propTypes = {
  setIsSettingsVisible: PropTypes.func.isRequired,

  settings: PropTypes.shape({
    table: PropTypes.instanceOf(Table),
  }).isRequired,
};
