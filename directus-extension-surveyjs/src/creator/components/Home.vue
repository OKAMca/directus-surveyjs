<template>
  <module-page :page :breadcrumb>
    <div v-if="hasSettings">
      <forms />
    </div>
    <div class="button-container" v-else>
      <label for="formConfigCollection">Collection key for form configuration collection : </label>
      <input class="input" id="formConfigCollection" v-model="formConfigCollectionKey" type="text"/>
      <VButton @click="finishSetup">
        {{t('finish_setup')}}
      </VButton>
    </div>
  </module-page>
</template>

<script setup lang="ts" async>
import { useStores } from '@directus/extensions-sdk'

import { ref } from 'vue'
import { TPage, type TBreadcrumb } from '../types';
import ModulePage from './ModulePage.vue'
import Forms from './Forms.vue'
import { createSettingsCollection, settingsCollectionKey } from '../lib/settings';
import { createFormConfigsCollection } from '../lib/config';
import { useI18n } from "vue-i18n";
import { useI18nFallback } from '../composables/usei18nFallback';

const { useCollectionsStore, useFieldsStore } = useStores()
const collectionsStore = useCollectionsStore()
const fieldsStore = useFieldsStore()
const { t } = useI18nFallback(useI18n())

const formConfigCollectionKey = ref('form_configs')

const hasSettings = ref(!!collectionsStore.getCollection(settingsCollectionKey))

const finishSetup = async () => {
  console.log(formConfigCollectionKey.value)
  await createSettingsCollection(collectionsStore, fieldsStore)
  await createFormConfigsCollection(collectionsStore, fieldsStore, formConfigCollectionKey.value)
  hasSettings.value = true
}

const page = ref<TPage>({label: t('home'), uri: 'forms'})
const breadcrumb = ref<Array<TBreadcrumb>>([
  {
    name: page.value.label,
    to: '/surveys'
  }
])

</script>

<style>
  .button-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    align-items: center;
  } 
  
  .input {
    width: 80%;
  }

  .button {
    width: 80%;
    text-align: center;
    background-color: white;
    color: black;
    padding: 1rem;
    border-radius: 5px;
    cursor: pointer;
  }

  #form-list {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    gap: 0.5rem;
    list-style: none;
  }
  .form-list-item {
    width: 100%;
    border: 1px solid gray;
  }

  .create {
    cursor: pointer;
    background-color: purple;
    border: none;
  }

  .form-list-item p {
    padding: 1rem;
  }
</style>