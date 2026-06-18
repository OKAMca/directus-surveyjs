<template>
  <div ref="root" class="sv-listbox-root">
    <div
      ref="listboxEl"
      class="sv-listbox"
      :class="{ 'sv-listbox--disabled': isReadOnly, 'sv-listbox--error': hasErrors }"
      role="listbox"
      :aria-multiselectable="allowMultiple ? 'true' : undefined"
      :aria-labelledby="question.ariaTitleId || undefined"
      :aria-required="question.isRequired ? 'true' : undefined"
      :aria-invalid="hasErrors ? 'true' : undefined"
      :aria-disabled="isReadOnly ? 'true' : undefined"
      :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
      :tabindex="isReadOnly ? undefined : 0"
      @focus="onFocus"
      @blur="activeIndex = -1"
      @keydown="onKeyDown"
    >
      <div
        v-for="(item, index) in choices"
        :id="optionId(index)"
        :key="item.id"
        class="sv-listbox__option"
        :class="{
          'sv-listbox__option--selected': isSelected(item),
          'sv-listbox__option--active': index === activeIndex,
          'sv-listbox__option--disabled': !item.isEnabled,
        }"
        role="option"
        :aria-selected="isSelected(item) ? 'true' : 'false'"
        :aria-disabled="!item.isEnabled ? 'true' : undefined"
        @click="onItemClick(item, index)"
      >
        <span class="sv-listbox__option-text">{{ item.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import type { ItemValue, QuestionSelectBase } from "survey-core";
  import { useQuestion } from "survey-vue3-ui";

  // The same component renders both the single- and multi-select list box; the
  // model's `allowMultiple` getter drives the selection semantics.
  // `clickItemHandler` lives on the concrete radiogroup/checkbox models rather
  // than `QuestionSelectBase`, so it is declared explicitly here.
  type ListBoxLikeQuestion = QuestionSelectBase & {
    allowMultiple: boolean;
    clickItemHandler: (item: ItemValue, checked?: boolean) => void;
  };

  const props = defineProps<{
    question: ListBoxLikeQuestion;
  }>();

  const root = ref<HTMLElement>();
  const listboxEl = ref<HTMLElement>();
  // Wires SurveyJS model reactivity into Vue so value / choice changes re-render.
  useQuestion(props, root);

  const allowMultiple = computed(() => props.question.allowMultiple);
  const isReadOnly = computed(() => props.question.isReadOnly);
  const hasErrors = computed(() => props.question.errors.length > 0);
  const choices = computed<Array<ItemValue>>(() => props.question.visibleChoices);

  // The active (focused) option for the `aria-activedescendant` pattern: focus
  // stays on the list box while arrow keys move the active descendant.
  const activeIndex = ref(-1);

  const optionId = (index: number) => `${props.question.inputId}_opt_${index}`;
  const isSelected = (item: ItemValue) => props.question.isItemSelected(item);

  function select(item: ItemValue | undefined) {
    if (!item || !item.isEnabled || isReadOnly.value) return;
    if (allowMultiple.value) {
      props.question.clickItemHandler(item, !isSelected(item));
    } else {
      props.question.clickItemHandler(item);
    }
  }

  function onItemClick(item: ItemValue, index: number) {
    if (isReadOnly.value) return;
    activeIndex.value = index;
    listboxEl.value?.focus();
    select(item);
  }

  function onFocus() {
    if (activeIndex.value >= 0) return;
    const selected = choices.value.findIndex((item) => isSelected(item));
    activeIndex.value = selected >= 0 ? selected : firstEnabledFrom(0, 1);
  }

  // Returns the next enabled option index in the given direction, or the
  // current active index when none is found.
  function firstEnabledFrom(start: number, step: number) {
    const items = choices.value;
    for (let i = start; i >= 0 && i < items.length; i += step) {
      if (items[i]?.isEnabled) return i;
    }
    return activeIndex.value;
  }

  function moveActive(step: number) {
    const from = activeIndex.value < 0 ? (step > 0 ? -1 : choices.value.length) : activeIndex.value;
    activeIndex.value = firstEnabledFrom(from + step, step);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (isReadOnly.value) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        activeIndex.value = firstEnabledFrom(0, 1);
        break;
      case "End":
        event.preventDefault();
        activeIndex.value = firstEnabledFrom(choices.value.length - 1, -1);
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        if (activeIndex.value >= 0) select(choices.value[activeIndex.value]);
        break;
      default:
    }
  }
</script>

<style>
  .sv-listbox {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 16em;
    overflow-y: auto;
    padding: 4px;
    border: 1px solid var(--sjs-border-default, rgba(0, 0, 0, 0.16));
    border-radius: var(--sjs-corner-radius, 4px);
    background: var(--sjs-general-backcolor, #fff);
    outline: none;
  }

  .sv-listbox:focus-visible {
    border-color: var(--sjs-primary-backcolor, #19b394);
    box-shadow: 0 0 0 2px var(--sjs-primary-backcolor-light, rgba(25, 179, 148, 0.25));
  }

  .sv-listbox--error {
    border-color: var(--sjs-special-red, #e60a3e);
  }

  .sv-listbox--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .sv-listbox__option {
    padding: 8px 12px;
    border-radius: var(--sjs-corner-radius, 4px);
    cursor: pointer;
    color: var(--sjs-general-forecolor, rgba(0, 0, 0, 0.91));
    user-select: none;
  }

  .sv-listbox__option:hover {
    background: var(--sjs-general-backcolor-dim, rgba(0, 0, 0, 0.05));
  }

  .sv-listbox__option--active {
    box-shadow: inset 0 0 0 2px var(--sjs-primary-backcolor, #19b394);
  }

  .sv-listbox__option--selected,
  .sv-listbox__option--selected:hover {
    background: var(--sjs-primary-backcolor, #19b394);
    color: var(--sjs-primary-forecolor, #fff);
  }

  .sv-listbox__option--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
