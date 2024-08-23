import { DeepPartial, Field, Collection } from '@directus/types'
import { getFieldsStoreUtils } from './store'

const createFormConfigsFields = async (fieldsStore: any, collectionKey: string) => {
  const { 
    createTextField,
    createJSONField,
    createAutocompleteInput,
    createDateUpdatedField,
    createDateCreatedField,
  } = getFieldsStoreUtils(collectionKey, fieldsStore)

  const tasks = [
    createDateCreatedField(),
    createDateUpdatedField(),
    createTextField("title", {readonly: true}),
    createTextField("friendly_id", {required: true}),
    createJSONField("field_map"),
    createJSONField("schema", {readonly: true}),
    createAutocompleteInput("form_submission_collection", `/survey-api/form-submissions-collections/{{value}}`)
  ]

  await Promise.all(tasks)
}

export const createFormConfigsCollection = async (collectionsStore: any, fieldsStore: any, collectionKey: string = 'form_configs') => {
  if (!!collectionsStore.getCollection(collectionKey)) {
    return
  }
  await collectionsStore.upsertCollection(collectionKey, {
    collection: collectionKey,
    schema: {
      name: collectionKey,
      comment: null
    },
    meta: {
      icon: "receipt_long",
    },
    fields: [
      {
        field: "id",
        type: "uuid",
        meta: {
          hidden: true,
          interface: "input",
          readonly: true,
          special: [
            "uuid"
          ]
        },
        schema: {
          has_auto_increment: false,
          is_primary_key: true,
        }
      }
    ]
  } as DeepPartial<Collection & {fields: Field[]}>)
  await createFormConfigsFields(fieldsStore, collectionKey)
}