<template>
  <main class="container">
    <div class="search-form">
      <v-input v-model="searchValue" :placeholder="t('search_forms')" autofocus>
        <template #prepend>
          <v-icon name="search" />
        </template>
        <template #append>
					<v-progress-circular v-if="loading" indeterminate />
				</template>
      </v-input>
    </div>
    <section class="search-results">
      <v-list v-if="results.length > 0 && !loading" class="search-results-list">
          <template v-for="{ collection, hits, displayTemplate, descriptionField } in results" :key="collection">
						<collection-results
							v-if="hits.length > 0"
							:collection="collection"
							:hits="hits"
							:searchValue="searchValue"
							:displayTemplate="displayTemplate"
							:descriptionField="descriptionField"
						/>
					</template>
				</v-list>
    </section>
  </main>
</template>

<script setup lang="ts" async>
import { useApi } from '@directus/extensions-sdk'
import { ref, onMounted, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core';
import { settingsCollectionKey } from '../lib/settings';
import { useI18n } from 'vue-i18n';
import { useI18nFallback } from '../composables/usei18nFallback';
import CollectionResults from './FormsResults.vue';

const api = useApi()

const settings = ref()
const results = ref<{collection: string, hits: any, displayTemplate: string, descriptionField: string}[]>([]);
const searchValue = ref<string>('');
const loading = ref(false);

const displayTemplate = '{{title}} • {{friendly_id}}'
const descriptionField = 'description'

const debouncedSearch = useDebounceFn(() => {
	if (searchValue.value) {
		search(searchValue.value);
	}
}, 500);


async function search(value: string) {
	try {
    loading.value = true;
    results.value = [];
    const collection = `${settings.value['form_config_collection'] ?? 'form_configs'}`
    const { data } = await api.get(`/items/${collection}`, {
        params: {
            search: value
        }
    })

    if(data.data.length > 0) {
      results.value.push({
        collection, 
        hits: data.data,
        displayTemplate,
        descriptionField,
      })
    }

    loading.value = false;
	} catch (error) {
		console.error(error);
	}
}

watch(searchValue, () => {
	debouncedSearch();
});

const { t } = useI18nFallback(useI18n())

onMounted(async () => {
  try {
    const settingsRes = await api.get(`/items/${settingsCollectionKey}`)
    
    settings.value = (settingsRes?.data?.data)

    const collection = `${settings.value['form_config_collection'] ?? 'form_configs'}`
    
    const {data} = await api.get(`/items/${collection}`)
    results.value.push({
      collection, 
      hits: data.data,
      displayTemplate,
      descriptionField,
    })
  } catch (error) {
    console.error('Failed to fetch forms:', error)
  }
})
</script>

<style scoped>
  .container {
    padding: var(--content-padding);
    padding-top: 0;
    width: 100%;
    max-width: 1024px;

    & > div + * {
      margin-bottom: var(--content-padding);
    }
  }

  .search-form {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .search-results {
    margin-top: var(--content-padding / 2);
  }
  #form-list {
    display: flex;
    flex-direction: column;
    padding-top: 2rem;
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

  .form-list-item > p, code {
    padding: 1rem;
  }
</style>