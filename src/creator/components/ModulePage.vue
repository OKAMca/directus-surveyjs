<template>
  <private-view :title="pageTitle">
    <template #actions>
      <slot name="actions"></slot>
    </template>
    <template v-if="breadcrumb" #headline>
      <v-breadcrumb :items="breadcrumb" />
    </template>
    <template #navigation>
      <page-navigation :current :pages="pages"/>
    </template>
    <template #sidebar>
      <sidebar-detail icon="info" :title="t('information')" close>
          <div class="page-description" />
      </sidebar-detail>
    </template>
    <slot name="content"></slot>
  </private-view>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue';
import { TBreadcrumb, TPage } from '../types';
import PageNavigation from './PageNavigation.vue'
import { useI18n } from 'vue-i18n';
import { useI18nFallback } from '../composables/usei18nFallback';


const props = defineProps<{
  page: TPage
  breadcrumb: Array<TBreadcrumb>
}>()

const { page, breadcrumb } = toRefs(props)

const current = ref(page?.value.uri)
const pageTitle = ref(page?.value.label)

watch( 
  () => page,
  (newPage) => {
    current.value = newPage.value.uri;
    pageTitle.value = newPage.value.label;
  },
  { deep: true }
)

const { t } = useI18nFallback(useI18n())

const pages = ref<Array<TPage>>([
  {
    label: t('form_creator'),
    uri: 'forms',
    to: '/surveys',
    icon: 'edit_document'
  }
])

</script>