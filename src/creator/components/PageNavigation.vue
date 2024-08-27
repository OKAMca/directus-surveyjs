<template>
	<v-list nav v-if="pages">
		<v-list-item v-for="navItem in pages" :key="navItem.to" :active="navItem.uri == current" :to="navItem.to">
			<v-list-item-icon><v-icon :name="navItem.icon" :color="navItem.color" /></v-list-item-icon>
			<v-list-item-content>
				<v-text-overflow :text="navItem.label" />
			</v-list-item-content>
		</v-list-item>
		<v-list-item to="/content/module_extension_survey_settings">
			<v-list-item-icon><v-icon name="settings" /></v-list-item-icon>
			<v-list-item-content>
				<v-text-overflow :text="t('settings')" />
			</v-list-item-content>
		</v-list-item>
	</v-list>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type {TPage} from '../types'
import { useI18nFallback } from '../composables/usei18nFallback';

const { t } = useI18nFallback(useI18n())

const { pages, current } = defineProps<{
  pages: Array<TPage>
	current: string
}>()

</script>