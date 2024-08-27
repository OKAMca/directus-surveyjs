<template>
  <module-page :page :breadcrumb>
		<div ref="creatorApp" id="sub-app"></div>
	</module-page>
</template>

<script setup lang="ts">
	import { createApp, onMounted, ref, watch } from 'vue'
	import SurveyCreator from './Creator.vue'
	import { surveyPlugin } from "survey-vue3-ui";
	import { surveyCreatorPlugin } from "survey-creator-vue";
	import { useApi } from '@directus/extensions-sdk';
	import type { TBreadcrumb, TDirectusLanguage, TDirectusUser, TFormConfig, TPage } from '../types';
	import ModulePage from './ModulePage.vue'
	import { settingsCollectionKey } from '../lib/settings';
	import { useI18n } from 'vue-i18n';
	import { useI18nFallback } from '../composables/usei18nFallback';
import { SurveyCreatorModel } from 'survey-creator-core';
	
	const creatorApp = ref()

	const props = defineProps({
		form: String
	})

	const api = useApi()
	const formConfig = ref<TFormConfig>()
	const user = ref<TDirectusUser>()
	const languages = ref()
	const settings = ref()

	const { t } = useI18nFallback(useI18n())
	const page = ref<TPage>({label: `${t('form_creator')}`, uri: 'creator'})
	const breadcrumb = ref<Array<TBreadcrumb>>([
		{
			name: t('home'),
			to: '/surveys'
		},
		{
			name: t('form_creator'),
			to: `/surveys/${props.form}`
		}
	])


	const saveForm = async (creator: SurveyCreatorModel) => { 
    const formTitle = creator.JSON.title as string | undefined
    const response = await api.patch<any, any, TFormConfig>(
      `/survey-api/form-config-update/${props.form}`, 
      { title: formTitle, schema: creator.text }, 
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
		if (formTitle) {
			page.value.label = formTitle
		}
  }

	onMounted(async () => {
		try {
			const userRes = await api.get('/users/me')
			const languagesRes = await api.get('/items/languages')
			const settingsRes = await api.get(`/items/${settingsCollectionKey}`)
			
			user.value = (userRes?.data?.data as TDirectusUser)
			languages.value = (languagesRes?.data?.data as Array<TDirectusLanguage>)
			settings.value = (settingsRes?.data?.data)
			
			const formsRes = await api.get(`/items/${settings.value['form_config_collection'] ?? 'form_configs'}`)
			const formConfigs = (formsRes?.data?.data as Array<TFormConfig>)
			formConfig.value = formConfigs?.find(config => config?.id == props.form)
			page.value = {label: `${formConfig.value?.title ?? formConfig.value?.friendly_id}`, uri: 'creator'}

		} catch (error) {
			console.error('Failed to fetch forms:', error)
		}

		const app = createApp(SurveyCreator, {
			...props,
			formConfig: formConfig.value,
			user: user.value,
			languages: languages.value, 
			settings: settings.value,
			api,
			saveForm,
		}).use(surveyPlugin).use(surveyCreatorPlugin)

		if (creatorApp.value) {
			// Initialize another Vue app inside this component
			app.mount(creatorApp.value)
		} else {
			// Hot load if reloaded from url
			setTimeout(() => {
				app.mount('#sub-app')
			}, 100);
		}
	})
</script>

<style>
	#sub-app {
		height: 100%;
	}
</style>