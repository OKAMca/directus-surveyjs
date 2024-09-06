<script setup lang="ts">
import { useCollection } from '@directus/extensions-sdk';
import { Ref, unref } from 'vue';

const props = defineProps<{
	collection: string;
	searchValue: string;
	displayTemplate: string;
	descriptionField: string;
	hits: any[];
}>();


// useCollection is a helper for working with a collection. Here we're using it to get the collection's info and primary key field (in case it's not the default "id").
const { info, primaryKeyField } = useCollection(unref(props.collection));

const displayTemplate = props.displayTemplate ?? info.value?.meta?.display_template ?? '{{title}}';
</script>

<template>
	<v-detail :label="info?.name" start-open>
		<v-list-item
			v-for="(hit, index) in hits"
			:key="hit[primaryKeyField?.field ?? index]"
			block
			clickable
			:query="searchValue"
			:title="hit.name"
			:to="`/surveys/${hit[primaryKeyField?.field ?? index]}`"
		>
			<v-icon :name="info?.icon" left />
			<div>
        <!-- We're digging deep into the codebase here. Using the same component that the Studio uses to render display templates. So we can retain that rich UI that you see elsewhere in Directus -->
				<render-template :collection="info?.collection" :item="hit" :template="displayTemplate" />
				<v-text-overflow :text="hit[descriptionField]" :highlight="searchValue" class="hit-description" />
			</div>
      <v-button :to="`/content/${collection}/${hit[primaryKeyField?.field ?? index]}`" icon rounded class="open-in-new">
        <v-icon name="settings" />
      </v-button>
		</v-list-item>
	</v-detail>
</template> 

<style scoped>
.hit-description {
	color: var(--theme--foreground-subdued);
}
.open-in-new {
  margin-left: auto;
}
</style>