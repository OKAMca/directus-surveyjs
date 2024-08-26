/* eslint-disable @typescript-eslint/naming-convention */
import { defineEndpoint } from '@directus/extensions-sdk'
import { isEmpty } from 'lodash'
// import { Model } from 'survey-core'

export default defineEndpoint((router, { services, getSchema }) => {

  const { ItemsService } = services

  const settingsCollectionKey = "module_extension_survey_settings"

  router.post('/form-submission/:formConfigId', async (req, res) => {
    try {
      const { formConfigId } = req.params

      const settingsService = new ItemsService(settingsCollectionKey, {
        schema: await getSchema(),
				// @ts-ignore
        accountability: req.accountability,
      })
      
      const settings = await settingsService.readByQuery({
        limit: 1
      })

      const formConfigCollection = settings[0]['form_config_collection'] ?? 'form_configs'

      // Fetch the survey definition from the form_config collection
      const formConfigService = new ItemsService(formConfigCollection, {
        schema: await getSchema(),
				// @ts-ignore
        accountability: req.accountability,
      })

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

      const createItemInCollection = async (collectionName: string, itemData: object) => {
        // If validation passes, save the data to your collection
        const responseService = new ItemsService(collectionName, {
          schema: await getSchema(),
					// @ts-ignore
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
				// @ts-ignore
        accountability: req.accountability,
      })
      
      const settings = await settingsService.readByQuery({
        limit: 1
      })

      const formConfigCollection = settings[0]['form_config_collection'] ?? 'form_configs'

      // Fetch the survey definition from the form_config collection
      const formConfigService = new ItemsService(formConfigCollection, {
        schema: await getSchema(),
				// @ts-ignore
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
				// @ts-ignore
        accountability: req.accountability,
      })
      
      const settings = await settingsService.readByQuery({
        limit: 1
      })

      const formConfigCollection = settings[0]['form_config_collection'] ?? 'form_configs'

      // Fetch the survey definition from the form_config collection
      const formConfigService = new ItemsService(formConfigCollection, {
        schema: await getSchema(),
				// @ts-ignore
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
