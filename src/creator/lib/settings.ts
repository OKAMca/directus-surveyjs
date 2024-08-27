import { DeepPartial, Collection } from '@directus/types'
import { snakeCase } from 'lodash';
import { ICreatorOptions } from 'survey-creator-core';
import { getFieldsStoreUtils } from './store';

export const settingsCollectionKey = "module_extension_survey_settings"

const createSettingsFields = async (fieldsStore: any, formConfigKey: string) => {
  const { 
    createBooleanField, 
    createDropdownField,
    createNumberField,
    createTextField,
  } = getFieldsStoreUtils(settingsCollectionKey, fieldsStore)

  const tasks = [
    createBooleanField(snakeCase("showDesignerTab"), {default_value: true}),
    createBooleanField(snakeCase("showPreviewTab"), {default_value: true}),
    createBooleanField(snakeCase("showJSONEditorTab"), {default_value: true}),
    createBooleanField(snakeCase("showLogicTab"), {default_value: false}),
    createBooleanField(snakeCase("showTranslationTab"), {default_value: true}),
    createBooleanField(snakeCase("showThemeTab"), {default_value: false}),
    createBooleanField(snakeCase("isAutoSave"), {default_value: false}),
    createBooleanField(snakeCase("isRTL"), {default_value: false}),
    createBooleanField(snakeCase("showSurveyTitle"), {default_value: true}),
    createBooleanField(snakeCase("allowEditExpressionsInTextEditor"), {default_value: true}),
    createBooleanField(snakeCase("showTitlesInExpressions"), {default_value: false}),
    createBooleanField(snakeCase("showErrorOnFailedSave"), {default_value: true}),
    createBooleanField(snakeCase("generateValidJSON"), {default_value: true}),
    createBooleanField(snakeCase("readOnly"), {default_value: false}),
    createBooleanField(snakeCase("showPagesInPreviewTab"), {default_value: false}),
    createDropdownField(snakeCase("themeForPreview"), [
      {text: "Modern", value: "modern"},
      {text: "Default", value: "default"},
      {text: "Default V2", value: "defaultV2"}
    ], {default_value: "defaultV2"}),
    createBooleanField(snakeCase("showSimulatorInPreviewTab"), {default_value: true}),
    createDropdownField(snakeCase("showDefaultLanguageInPreviewTab"), [
      {text: "Auto", value: "auto"},
      {text: "True", value: "true"},
      {text: "False", value: "false"},
      {text: "All", value: "all"},
    ], {default_value: "auto"}),
    createBooleanField(snakeCase("showInvisibleElementsInPreviewTab"), {default_value: true}),
    createBooleanField(snakeCase("showObjectTitles"), {default_value: false}),
    createNumberField(snakeCase("maxVisibleChoices"), {default_value: 10}),
    createBooleanField(snakeCase("showHeaderInEmptySurvey"), {default_value: false}),
    createBooleanField(snakeCase("allowModifyPages"), {default_value: true}),
    createNumberField(snakeCase("maximumColumnsCount"), {default_value: 0}),
    createNumberField(snakeCase("minimumChoicesCount"), {default_value: 0}),
    createNumberField(snakeCase("maximumChoicesCount"), {default_value: 0}),
    createNumberField(snakeCase("maximumRowsCount"), {default_value: 0}),
    createNumberField(snakeCase("maximumRateValues"), {default_value: 0}),
    createNumberField(snakeCase("maxLogicItemsInCondition"), {default_value: -1}),
    createNumberField(snakeCase("maxNestedPanels"), {default_value: -1}),
    createBooleanField(snakeCase("allowChangeThemeInPreview"), {default_value: true}),
    createDropdownField(snakeCase("previewOrientation"), [
      {text: "Landscape", value: "landscape"},
      {text: "Portrait", value: "portrait"},
    ], {default_value: "landscape"}),
    createBooleanField(snakeCase("addNewQuestionLast"), {default_value: true}),
    createDropdownField(snakeCase("pageEditMode"), [
      {text: "Standard", value: "standard"},
      {text: "Single", value: "single"},
      {text: "By page", value: "bypage"},
    ], {default_value: "standard"}),
    createTextField("license_key"),
    createTextField("form_config_collection", {default_value: formConfigKey})
  ];

  await Promise.all(tasks);
}

export const createSettingsCollection = async (collectionsStore: any, fieldsStore: any, formConfigKey: string = 'form_configs') => {
  if (!!collectionsStore.getCollection(settingsCollectionKey)) {
    return
  }
  await collectionsStore.upsertCollection(settingsCollectionKey, {
    collection: settingsCollectionKey,
    schema: {
      name: settingsCollectionKey,
      comment: null
    },
    meta: {
      icon: "settings",
      hidden: true,
      singleton: true,
    }
  } as DeepPartial<Collection>)
  await createSettingsFields(fieldsStore, formConfigKey)
}

export const settingsToCreatorOptions = (settings: Record<string, any>) => {
  const options: ICreatorOptions = {
    addNewQuestionLast: settings['add_new_question_last'],
    allowChangeThemeInPreview: settings['allow_change_theme_in_preview'],
    allowEditExpressionsInTextEditor: settings['allow_edit_expressions_in_text_editor'],
    allowModifyPages: settings['allow_modify_pages'],
    generateValidJSON: settings['generate_valid_json'],
    isAutoSave: settings['is_auto_save'],
    isRTL: settings['is_rtl'],
    maxLogicItemsInCondition: settings['max_logic_items_in_condition'],
    maxNestedPanels: settings['max_nested_panels'],
    maxVisibleChoices: settings['max_visible_choices'],
    maximumChoicesCount: settings['maximum_choices_count'],
    maximumColumnsCount: settings['maximum_columns_count'],
    maximumRateValues: settings['maximum_rate_values'],
    maximumRowsCount: settings['maximum_rows_count'],
    minimumChoicesCount: settings['minimum_choices_count'],
    pageEditMode: settings['page_edit_mode'],
    previewOrientation: settings['preview_orientation'],
    readOnly: settings['read_only'],
    showDefaultLanguageInPreviewTab: settings['show_default_language_in_preview_tab'],
    showDesignerTab: settings['show_designer_tab'],
    showErrorOnFailedSave: settings['show_error_on_failed_save'],
    showHeaderInEmptySurvey: settings['show_header_in_empty_survey'],
    showInvisibleElementsInPreviewTab: settings['show_invisible_elements_in_preview_tab'],
    showJSONEditorTab: settings['show_json_editor_tab'],
    showLogicTab: settings['show_logic_tab'],
    showObjectTitles: settings['show_object_titles'],
    showPagesInPreviewTab: settings['show_pages_in_preview_tab'],
    showPreviewTab: settings['show_preview_tab'],
    showSimulatorInPreviewTab: settings['show_simulator_in_preview_tab'],
    showSurveyTitle: settings['show_survey_title'],
    showThemeTab: settings['show_theme_tab'],
    showTitlesInExpressions: settings['show_titles_in_expressions'],
    showTranslationTab: settings['show_translation_tab'],
    themeForPreview: settings['theme_for_preview'] ?? 'default'
  };

  return options
}