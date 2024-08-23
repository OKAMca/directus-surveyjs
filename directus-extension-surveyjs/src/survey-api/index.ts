/* eslint-disable @typescript-eslint/naming-convention */
import { defineEndpoint } from '@directus/extensions-sdk'
import { isEmpty } from 'lodash'
// import { Model } from 'survey-core'

export default defineEndpoint((router, { services, getSchema, logger }) => {
  const { ItemsService, CollectionsService } = services

  const settingsCollectionKey = "module_extension_survey_settings"

  router.get('/form-submissions-collections', async (req, res) => {
    try {
      const schema = await getSchema()

      const collections = schema.relations.filter((col) => col.related_collection === 'base_form_submissions')
      const collectionNames = collections?.map(col => col.collection)
      
      res.json(collectionNames)

    } catch(error) {
      res.status(404).json(error)
    }
  })
  router.get('/form-submissions-collections/:value', async (req, res) => {
    try {
      const { value } = req.params
      const schema = await getSchema()

      const collections = schema.relations.filter((col) => col.related_collection === 'base_form_submissions')
      const collectionNames = collections?.map(col => col.collection)

      const filteredNames = collectionNames.filter(name => name.includes(value))
      
      res.json(filteredNames)

    } catch(error) {
      res.status(404).json(error)
    }
  })

  router.post('/form-submission/:formConfigId', async (req, res) => {
    try {
      const { formConfigId } = req.params

      const settingsService = new ItemsService(settingsCollectionKey, {
        schema: await getSchema(),
        accountability: req.accountability,
      })
      
      const settings = await settingsService.readByQuery({
        limit: 1
      })

      const formConfigCollection = settings[0]['form_config_collection'] ?? 'form_configs'

      // Fetch the survey definition from the form_config collection
      const formConfigService = new ItemsService(formConfigCollection, {
        schema: await getSchema(),
        accountability: req.accountability,
      })

      const languageService = new ItemsService('languages', {
        schema: await getSchema(),
        accountability: req.accountability,
      })

      const allLanguages = await languageService.readByQuery({
        limit: -1
      });

      const formConfig = await formConfigService.readOne(formConfigId)
      const formSubmissionCollection = formConfig.form_submission_collection

      if (!formConfig || !formSubmissionCollection) {
        throw new Error('No form config found.')
      }

      const data = req.body
      if (!data || typeof data !== 'object') {
        throw new Error('Body should be an object encoded in JSON.')
      }

      if (isEmpty(data)) {
        throw new Error('Body is empty')
      }

      const language = data?.default_fields?.language
      
      if (language && typeof language === 'string') {
        const foundLanguage = allLanguages.find((lng: {code: string}) => lng.code.includes(language))
        const languageObject = foundLanguage ? {code: foundLanguage.code} : null
        data.default_fields.language = languageObject
      }

      const createItemInCollection = async (collectionName: string, itemData: object) => {
        // If validation passes, save the data to your collection
        const responseService = new ItemsService(collectionName, {
          schema: await getSchema(),
          accountability: req.accountability,
        })

        const newItem = await responseService.createOne(itemData)

        res.status(201).json({
          message: 'Survey submitted successfully',
          item: newItem,
        })
      }

      await createItemInCollection(formSubmissionCollection, data)
      
    } catch (error) {
      res.status(404).json(error)
    }
  })

  router.patch('/form-config-update/:formConfigId', async (req, res) => {
    try {
      const { formConfigId } = req.params

      const settingsService = new ItemsService(settingsCollectionKey, {
        schema: await getSchema(),
        accountability: req.accountability,
      })
      
      const settings = await settingsService.readByQuery({
        limit: 1
      })

      const formConfigCollection = settings[0]['form_config_collection'] ?? 'form_configs'

      // Fetch the survey definition from the form_config collection
      const formConfigService = new ItemsService(formConfigCollection, {
        schema: await getSchema(),
        accountability: req.accountability,
      })

      const data = await formConfigService.updateOne(formConfigId, {
        ...req.body
      })

      res.json({
        id: data,
        updatedSchema: req.body,
      })

    } catch (error) {
      res.status(404).json(error)
    }
  })

  router.post('/form-config-create', async (req, res) => {
    try {

      const settingsService = new ItemsService(settingsCollectionKey, {
        schema: await getSchema(),
        accountability: req.accountability,
      })
      
      const settings = await settingsService.readByQuery({
        limit: 1
      })

      const formConfigCollection = settings[0]['form_config_collection'] ?? 'form_configs'

      // Fetch the survey definition from the form_config collection
      const formConfigService = new ItemsService(formConfigCollection, {
        schema: await getSchema(),
        accountability: req.accountability,
      })


      const data = await formConfigService.createOne({
        ...req.body
      })

      res.json(data)

    } catch (error) {
      res.status(404).json(error)
    }
  })
})
