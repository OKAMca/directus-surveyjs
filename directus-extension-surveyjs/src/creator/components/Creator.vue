<template>
  <SurveyCreatorComponent :model="creator" />
</template>

<script setup lang="ts">
  import { SurveyCreatorModel } from "survey-creator-core";
  import { surveyLocalization, setLicenseKey } from "survey-core";
  import "survey-core/survey.i18n.js";
  import "survey-creator-core/survey-creator-core.i18n.js";
  import "survey-core/defaultV2.css";
  import "survey-creator-core/survey-creator-core.css";

  import type { TDirectusLanguage, TDirectusUser, TFormConfig } from '../types';
  import { useApi } from '@directus/extensions-sdk';
  import { settingsToCreatorOptions } from "../lib/settings";

  const props = defineProps<{
    form: string
    formConfig: TFormConfig
    user: TDirectusUser
    languages: Array<TDirectusLanguage>
    api: ReturnType<typeof useApi>
    settings: Record<string, any>
  }>()

  const { form, formConfig, api, user, languages, settings } = props

  console.log(props)

  const getLanguageCode = (string: string | undefined) => {
    return string?.split('-')[0]
  }

  const directusLanguageCodes = languages?.map(language => getLanguageCode(language?.code))
  const userLanguageCode = getLanguageCode(user?.language)
  const defaultFormLanguage = getLanguageCode(settings['default_form_language'])
  setLicenseKey(settings['license_key'] ?? '')

  surveyLocalization.supportedLocales = directusLanguageCodes
  surveyLocalization.defaultLocale = defaultFormLanguage ?? directusLanguageCodes[0] ?? 'en'
  
  const options = settingsToCreatorOptions(settings)

  const creator = new SurveyCreatorModel(options)
  creator.locale = userLanguageCode ?? 'en'

  if (formConfig?.schema) {
    creator.text = JSON.stringify(formConfig?.schema)
  }

  creator.saveSurveyFunc = async () => { 
    const formTitle = creator.JSON.title as string | undefined
    const response = await api.patch<any, any, TFormConfig>(
      `/survey-api/form-config-update/${form}`, 
      { title: formTitle, schema: creator.text }, 
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  };
</script>