<template>
  <private-view :title="pageTitle">
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
    <slot></slot>
  </private-view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TBreadcrumb, TPage } from '../types';
import PageNavigation from './PageNavigation.vue'
import { useI18n } from 'vue-i18n';
import { useI18nFallback } from '../composables/usei18nFallback';


const { page, breadcrumb } = defineProps<{
  page: TPage
  breadcrumb: Array<TBreadcrumb>
}>()

const current = ref(page?.uri)
const pageTitle = ref(page?.label)

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