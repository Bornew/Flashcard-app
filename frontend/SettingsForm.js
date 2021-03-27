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
} from "@airtable/blocks/ui";

import { ConfigKeys } from "./settings";

export default function SettingsForm({
  setIsSettingsVisible,
  settings,
  setIsRandom,
}) {
  const modeOptions = [
    { value: "random", label: "Random" },
    { value: "normal", label: "Normal" },
  ];
  const [value, setValue] = useState(modeOptions[0].value);
  return (
    <Box
      flex="none"
      display="flex"
      flexDirection="column"
      width="260px"
      backgroundColor="white"
      maxHeight="100vh"
      borderLeft="thick"
    >
      <Box
        flex="auto"
        display="flex"
        flexDirection="column"
        minHeight="0"
        padding={3}
        overflowY="auto"
      >
        <Heading marginBottom={3}>Settings</Heading>
        <FormField label="Table">
          <TablePickerSynced globalConfigKey={ConfigKeys.TABLE_ID} />
        </FormField>
        {settings.table && (
          <Fragment>
            <FormField
              label="View"
              description="Only records in this view will be used"
            >
              <ViewPickerSynced
                table={settings.table}
                globalConfigKey={ConfigKeys.VIEW_ID}
              />
            </FormField>
            <FormField label="Question field">
              <FieldPickerSynced
                table={settings.table}
                globalConfigKey={ConfigKeys.QUESTION_FIELD_ID}
              />
            </FormField>
            <FormField label="Answer field">
              <FieldPickerSynced
                table={settings.table}
                globalConfigKey={ConfigKeys.ANSWER_FIELD_ID}
              />
            </FormField>
            <FormField label="Status field (optional)">
              <FieldPickerSynced
                table={settings.table}
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
        {/* <FormField label="Select a mode">
          <SelectButtons
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              setIsRandom(newValue == modeOptions[0] ? false : true);
              console.log(newValue);
            }}
            options={modeOptions}
          />
        </FormField> */}
      </Box>

      <Box
        flex="none"
        display="flex"
        justifyContent="flex-end"
        paddingY={3}
        marginX={3}
        borderTop="thick"
      >
        <Button
          variant="primary"
          size="large"
          onClick={() => setIsSettingsVisible(false)}
        >
          Done
        </Button>
      </Box>
    </Box>
  );
}

SettingsForm.propTypes = {
  setIsSettingsVisible: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    table: PropTypes.instanceOf(Table),
  }).isRequired,
};
