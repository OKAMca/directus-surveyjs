import { DeepPartial, Field, Collection } from '@directus/types'

export const getFieldsStoreUtils = (collectionKey: string, fieldsStore: any) => {

  type TFieldMetaOptions = {
    required?: boolean | undefined
    readonly?: boolean | undefined
    hidden?: boolean | undefined
    default_value?: string | number | boolean | null | undefined
  }

  const createBooleanField = async (name: string, meta?: TFieldMetaOptions) => {
    const { default_value, ...rest } = meta ?? {}
    await fieldsStore.createField(collectionKey, {
      collection: collectionKey,
      field: name,
      type: "boolean",
      schema: {
        name: name,
        default_value,
      },
      meta: {
        special: [
          "cast-boolean"
        ],
        interface: "boolean",
        ...rest
      }
    } as DeepPartial<Field>);
  }
  
  type TDropdownOption = {
    text: string
    value: string
  }
  
  const createDropdownField = async (name: string, options: Array<TDropdownOption>, meta?: TFieldMetaOptions) => {
    const { default_value, ...rest } = meta ?? {}
    await fieldsStore.createField(collectionKey, {
      collection: collectionKey,
      field: name,
      type: "string",
      meta: {
        interface: "select-dropdown",
        options: {
          choices: options,
        },
        ...rest
      },
      schema: {
        name: name,
        default_value,
      }
    } as DeepPartial<Field>);
  }

  const createTextField = async (name: string, meta?: TFieldMetaOptions) => {
    const { default_value, ...rest } = meta ?? {}
    await fieldsStore.createField(collectionKey, {
      collection: collectionKey,
      field: name,
      type: "string",
      schema: {
        name: name,
        default_value,
      },
      meta: {
        interface: "input",
        ...rest
      }
    } as DeepPartial<Field>);
  }
  
  const createNumberField = async (name: string, meta?: TFieldMetaOptions) => {
    const { default_value, ...rest } = meta ?? {}
    await fieldsStore.createField(collectionKey, {
      collection: collectionKey,
      field: name,
      type: "integer",
      schema: {
        name: name,
        default_value,
      },
      meta: {
        interface: "input",
        ...rest
      }
    } as DeepPartial<Field>);
  }

  const createJSONField = async (name: string, meta?: TFieldMetaOptions) => {
    const { default_value, ...rest } = meta ?? {}
    await fieldsStore.createField(collectionKey, {
      collection: collectionKey,
      field: name,
      type: "json",
      meta: {
        interface: "input-code",
        special: [
          "cast-json"
        ],
        ...rest
      },
      schema: {
        data_type: "json",
        name: name,
        default_value
      }
    } as DeepPartial<Field>);
  }

  const createUUIDField = async (name: string) => {
    await fieldsStore.createField(collectionKey, {
      collection: collectionKey,
      field: name,
      type: "uuid",
      schema: {
        has_auto_increment: false,
        is_primary_key: true,
        name: name,
      }
    } as DeepPartial<Field>);
  }

  const createDateUpdatedField = async () => {
    await fieldsStore.createField(collectionKey, {
      collection: collectionKey,
      field: "date_updated",
      type: "timestamp",
      meta: {
        special: [
            "date-updated"
        ],
        interface: "datetime",
        readonly: true,
        hidden: true,
        width: "half",
        display: "datetime",
        display_options: {
            "relative": true
        }
      },
      schema: {}
    } as DeepPartial<Field>);
  }

  const createDateCreatedField = async () => {
    await fieldsStore.createField(collectionKey, {
      collection: collectionKey,
      field: "date_created",
      type: "timestamp",
      meta: {
        special: [
            "date-created"
        ],
        interface: "datetime",
        readonly: true,
        hidden: true,
        width: "half",
        display: "datetime",
        display_options: {
            "relative": true
        }
      },
      schema: {}
    } as DeepPartial<Field>);
  }

  const createAutocompleteInput = async (name: string, url: string) => {
    await fieldsStore.createField(collectionKey, {
      collection: collectionKey,
      field: name,
      type: "string",
      meta: {
        collection: collectionKey,
        field: name,
        interface: "input-autocomplete-api",
        options: {
          url,
        },
        display: "collection",
      },
      schema: {
        name,
        table: collectionKey,
      }
    } as DeepPartial<Field>);
  }



  return { 
    createBooleanField, 
    createDropdownField, 
    createNumberField, 
    createTextField, 
    createJSONField, 
    createUUIDField,
    createDateCreatedField,
    createDateUpdatedField,
    createAutocompleteInput
  }
}