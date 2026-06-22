import {
  ElementFactory,
  QuestionCheckboxModel,
  QuestionRadiogroupModel,
  Serializer,
} from "survey-core";
import { editorLocalization } from "survey-creator-core";

// Two distinct question types mirroring how SurveyJS separates single-select
// (`radiogroup`) from multi-select (`checkbox`). A list box is the same data
// model rendered as an always-visible, scrollable selectable list instead of
// radio buttons / checkboxes.
export const LISTBOX_TYPE = "listbox";
export const LISTBOX_MULTIPLE_TYPE = "multilistbox";

// Single-select list box. Inherits every choice option from `radiogroup`
// (choices, choicesByUrl, choicesFromQuestion, showNoneItem, visibleIf,
// validators, …) so non-developers get the exact same editing experience as
// the built-in choice questions.
export class QuestionListBoxModel extends QuestionRadiogroupModel {
  getType() {
    return LISTBOX_TYPE;
  }

  // In the creator designer, render with the parent's component so the question
  // gets the native, fully-wired choice editor (inline add / remove / edit and
  // the property-grid choices editor). Everywhere else (preview, runtime) use
  // the custom `survey-listbox` renderer. The designer-vs-preview distinction
  // is exactly `isDesignMode`.
  getTemplate() {
    return this.isDesignMode ? "radiogroup" : LISTBOX_TYPE;
  }

  // Read by the renderer to decide single vs. multi selection semantics.
  get allowMultiple() {
    return false;
  }
}

// Multi-select list box. Inherits every choice option from `checkbox`
// (including showSelectAllItem, min/maxSelectedChoices, …).
export class QuestionListBoxMultipleModel extends QuestionCheckboxModel {
  getType() {
    return LISTBOX_MULTIPLE_TYPE;
  }

  getTemplate() {
    return this.isDesignMode ? "checkbox" : LISTBOX_MULTIPLE_TYPE;
  }

  get allowMultiple() {
    return true;
  }
}

const TITLES: Record<string, { en: string; fr: string }> = {
  [LISTBOX_TYPE]: { en: "List Box", fr: "Liste de sélection" },
  [LISTBOX_MULTIPLE_TYPE]: {
    en: "List Box (multiple)",
    fr: "Liste à sélection multiple",
  },
};

// Localizes the toolbox / property-grid labels for the new types. SurveyJS
// already localizes every inherited property, so only the type titles need
// strings of their own. Falls back silently if a locale is not loaded.
function registerLocalization() {
  (["en", "fr"] as const).forEach((locale) => {
    const strings = editorLocalization.getLocale(locale);
    if (!strings?.qt) return;
    Object.entries(TITLES).forEach(([type, byLocale]) => {
      strings.qt[type] = byLocale[locale];
    });
  });
}

let registered = false;

// Registers the models, their serialization metadata and localization. Safe to
// call more than once — the SurveyJS factories are global singletons.
export function registerListBoxModels() {
  if (registered) return;
  registered = true;

  ElementFactory.Instance.registerElement(
    LISTBOX_TYPE,
    (name) => new QuestionListBoxModel(name),
  );
  ElementFactory.Instance.registerElement(
    LISTBOX_MULTIPLE_TYPE,
    (name) => new QuestionListBoxMultipleModel(name),
  );

  // No own properties — inherit the full choice-question schema from the
  // respective parent class.
  Serializer.addClass(
    LISTBOX_TYPE,
    [],
    () => new QuestionListBoxModel(""),
    "radiogroup",
  );
  Serializer.addClass(
    LISTBOX_MULTIPLE_TYPE,
    [],
    () => new QuestionListBoxMultipleModel(""),
    "checkbox",
  );

  registerLocalization();
}
