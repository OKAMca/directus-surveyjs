import type { App } from "vue";
import type { SurveyCreatorModel } from "survey-creator-core";
import { editorLocalization } from "survey-creator-core";
import ListBoxQuestion from "./ListBoxQuestion.vue";
import {
  LISTBOX_MULTIPLE_TYPE,
  LISTBOX_TYPE,
  registerListBoxModels,
} from "./models";

export {
  LISTBOX_TYPE,
  LISTBOX_MULTIPLE_TYPE,
  registerListBoxModels,
} from "./models";

// Vue plugin: maps the question types to their renderer. SurveyJS Vue3 resolves
// a question to the global component named `survey-<type>`; both list box types
// share the same accessible renderer.
export const listBoxPlugin = {
  install(app: App) {
    app.component(`survey-${LISTBOX_TYPE}`, ListBoxQuestion);
    app.component(`survey-${LISTBOX_MULTIPLE_TYPE}`, ListBoxQuestion);
  },
};

// Ensures the toolbox shows exactly one entry per type with a choice-question
// icon and localized title, regardless of any auto-registration.
function upsertToolboxItem(
  creator: SurveyCreatorModel,
  type: string,
  iconName: string,
) {
  creator.toolbox.removeItem(type);
  creator.toolbox.addItem({
    name: type,
    iconName,
    json: { type },
    title: editorLocalization.getString(`qt.${type}`),
  });
}

// Registers the list box models and adds the toolbox items to a creator
// instance. Call after `new SurveyCreatorModel(...)`.
export function setupListBoxToolbox(creator: SurveyCreatorModel) {
  registerListBoxModels();
  upsertToolboxItem(creator, LISTBOX_TYPE, "icon-radiogroup");
  upsertToolboxItem(creator, LISTBOX_MULTIPLE_TYPE, "icon-checkbox");
}
