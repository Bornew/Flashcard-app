import React, { useEffect, useState } from "react";
import { viewport } from "@airtable/blocks";
import {
  initializeBlock,
  Box,
  useRecords,
  useSettingsButton,
  Text,
} from "@airtable/blocks/ui";

import FlashcardContainer from "./FlashcardContainer";
import { useSettings } from "./settings";
import SettingsForm from "./SettingsForm";
import SettingDialog from "./SettingDialog";

// Determines the maximum size of the app in fullscreen mode.
viewport.addMaxFullscreenSize({
  height: 680,
  width: 900,
});

viewport.addMinSize({
  height: 300,
  width: 400,
});

/**
 * A simple flashcard app that displays records from a chosen view.
 * Supports choosing a question field which is displayed by default and an optional answer field that
 * is hidden until shown by the user.
 */
function FlashcardApp() {
  const { isValid, message, settings } = useSettings();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isRandom, setIsRandom] = useState(true);
  const [shouldReset, setShouldReset] = useState(false);

  useSettingsButton(() => {
    if (!isSettingsVisible) {
      viewport.enterFullscreenIfPossible();
    }
    setIsSettingsVisible(!isSettingsVisible);
  });

  // Open the SettingsForm whenever the settings are not valid
  useEffect(() => {
    if (!isValid) {
      setIsSettingsVisible(true);
    }
  }, [isValid]);

  const records = useRecords(settings.view);

  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      bottom="0"
      right="0"
      display="flex"
    >
      <Box display="flex" flexDirection="column" flex="auto">
        {isValid && records ? (
          <FlashcardContainer
            records={records}
            settings={settings}
            isRandom={isRandom}
            setIsRandom={setIsRandom}
          />
        ) : (
          <Box
            display="flex"
            flex="auto"
            alignItems="center"
            justifyContent="center"
          >
            <Text textColor="light">{message}</Text>
          </Box>
        )}
      </Box>
      {isSettingsVisible && (
        <SettingsForm
          setIsSettingsVisible={setIsSettingsVisible}
          settings={settings}
          isRandom={isRandom}
          setIsRandom={setIsRandom}
        />
      )}
    </Box>
  );
}

initializeBlock(() => <FlashcardApp />);
