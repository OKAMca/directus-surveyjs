<template>
  <div
    :id="optionId"
    class="sv-listbox__option"
    :class="{
      'sv-listbox__option--selected': selected,
      'sv-listbox__option--active': active,
      'sv-listbox__option--disabled': !item.isEnabled,
    }"
    role="option"
    :data-index="index"
    :aria-selected="selected ? 'true' : 'false'"
    :aria-disabled="!item.isEnabled ? 'true' : undefined"
  >
    <span class="sv-listbox__option-text">{{ item.text }}</span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { ItemValue, QuestionSelectBase } from "survey-core";

  // Purely presentational option row. All interaction is handled by the parent
  // list box via event delegation, so this component carries no handlers — that
  // keeps it agnostic to the design-time `svc-item-value` adorner that wraps it
  // (which adds the add / remove / inline-edit controls). The `data` prop is the
  // adorner payload and is consumed by that wrapper, not here.
  const props = defineProps<{
    question: QuestionSelectBase;
    item: ItemValue;
    index?: number;
    active?: boolean;
    data?: unknown;
  }>();

  const selected = computed(() => props.question.isItemSelected(props.item));
  const optionId = computed(
    () => `${props.question.inputId}_opt_${props.index ?? 0}`,
  );
</script>
