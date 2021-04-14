import { useBase, useGlobalConfig } from "@airtable/blocks/ui";
import { STATUS_TYPES } from "./config";
export const ConfigKeys = Object.freeze({
  TABLE_ID: "tableId",
  VIEW_ID: "viewId",
  QUESTION_FIELD_ID: "questionFieldId",
  ANSWER_FIELD_ID: "answerFieldId",
  STATUS_FIELD_ID: "statusFieldId",
  NUMBERS_FIELD_ID: "numbersFieldId",
});

/**
 * A React hook to validate and access settings configured in SettingsForm.
 * @returns {{
 *  settings: {
 *      table: Table | null,
 *      view: View | null,
 *      questionField: Field | null,
 *      answerField: Field | null,
 *  },
 *  isValid: boolean,
 *  message?: string}}
 */

export function useSettings() {
  /**
   * 读取当前view全部数据
   * 可以选择 status 为 single select
   *
   * 要求设置status，获取status的颜色（status必须是single select）
   * 要求设置“mastered”和“learning”状态对应status哪一项
   * 要求设置numbers，如果设置的是
   *
   * 读取当前status 为 mastered ｜ learning ｜ 状态的数据
   * 逻辑是 状态设置为多少级，就会有多少个选项 刚开始应该获取status列表
   * 例如：status：{mastered，untouched}；status：{mastered}
   */
  const base = useBase();
  const globalConfig = useGlobalConfig();
  const table = base.getTableByIdIfExists(
    globalConfig.get(ConfigKeys.TABLE_ID)
  );
  const view = table
    ? table.getViewByIdIfExists(globalConfig.get(ConfigKeys.VIEW_ID))
    : null;
  const questionField = table
    ? table.getFieldByIdIfExists(globalConfig.get(ConfigKeys.QUESTION_FIELD_ID))
    : null;
  const answerField = table
    ? table.getFieldByIdIfExists(globalConfig.get(ConfigKeys.ANSWER_FIELD_ID))
    : null;
  const statusField = table
    ? table.getFieldByIdIfExists(globalConfig.get(ConfigKeys.STATUS_FIELD_ID))
    : null;
  const numbersField = table
    ? table.getFieldByIdIfExists(globalConfig.get(ConfigKeys.NUMBERS_FIELD_ID))
    : null;
  const settings = {
    table,
    view,
    questionField,
    answerField,
    statusField,
    numbersField,
  };

  if (!table || !view || !questionField) {
    return {
      isValid: false,
      message:
        "Pick a table, view, and question field; records cannot be empty.",
      settings,
    };
  }
  return {
    isValid: true,
    settings,
  };
}
