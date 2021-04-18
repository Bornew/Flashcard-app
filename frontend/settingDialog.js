import PropTypes from "prop-types";
import React, { Fragment, useState } from "react";
import { Table, FieldType } from "@airtable/blocks/models";
import {
  Box,
  Button,
  FieldPickerSynced,
  FormField,
  Heading,
  TablePickerSynced,
  ViewPickerSynced,
  SelectButtons,
  Dialog,
} from "@airtable/blocks/ui";

import { ConfigKeys } from "./settings";

export default function SettingDialog({ setIsSettingsVisible, settings }) {
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
          <TablePickerSynced globalConfigKey={ConfigKeys.TABLE_ID} />
        </FormField>

        {settings.table && (
          <FormField label="View">
            <ViewPickerSynced
              table={settings.table}
              view={settings.view}
              globalConfigKey={ConfigKeys.VIEW_ID}
            />
          </FormField>
        )}
      </Box>

      <Box display="flex" flexDirection="row" marginY={2}>
        {settings.table && (
          <Fragment>
            <FormField label="Question field" marginRight={2}>
              <FieldPickerSynced
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
              />
            </FormField>

            <FormField label="Answer field">
              <FieldPickerSynced
                table={settings.table}
                field={settings.answerField}
                globalConfigKey={ConfigKeys.ANSWER_FIELD_ID}
                shouldAllowPickingNone={false}
              />
            </FormField>
          </Fragment>
        )}
      </Box>

      <Box display="flex" flexDirection="row" marginY={2}>
        {settings.table && (
          <Fragment>
            <FormField label="Status field (optional)" marginRight={2}>
              <FieldPickerSynced
                table={settings.table}
                field={settings.statusField}
                shouldAllowPickingNone={true}
                globalConfigKey={ConfigKeys.STATUS_FIELD_ID}
                allowedTypes={[FieldType.SINGLE_SELECT]}
              />
            </FormField>

            <FormField label="Numbers field (optional)">
              <FieldPickerSynced
                table={settings.table}
                shouldAllowPickingNone={true}
                globalConfigKey={ConfigKeys.NUMBERS_FIELD_ID}
                allowedTypes={[FieldType.NUMBER]}
              />
            </FormField>
          </Fragment>
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
