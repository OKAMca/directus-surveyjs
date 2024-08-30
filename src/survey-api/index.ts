/* eslint-disable @typescript-eslint/naming-convention */
import { defineEndpoint } from '@directus/extensions-sdk'
import { isEmpty } from 'lodash'

export default defineEndpoint((router, { services, getSchema }) => {

  const { ItemsService } = services

  const settingsCollectionKey = "module_extension_survey_settings"

  const catchError = (error: unknown, res: any, message: string) => {
    const e = error as {name?: string, status?: number, code?: string}
    const status = e?.status
    return res?.status(status ?? 404).json({...e, details: message})
  }

  const getSettings = async (req: any, res: any): Promise<Record<string, any>[]> => {
    try {
      const settingsService = new ItemsService(settingsCollectionKey, {
        schema: await getSchema(),
				// @ts-ignore
        accountability: req.accountability,
      })
        return await settingsService.readByQuery({
          limit: 1
        })
      } catch (error) {
        return catchError(error, res, 'Your module_extension_survey_settings or related collection READ permissions must be allowed.')
      }
  }

  router.post('/form-submission/:formConfigId', async (req, res) => {

    const settings = await getSettings(req, res)

    try {
      const { formConfigId } = req.params 

      const formConfigCollection = settings?.[0]?.['form_config_collection'] ?? 'form_configs'

      let formConfig
      try {
        // Fetch the survey definition from the form_config collection
        const formConfigService = new ItemsService(formConfigCollection, {
          schema: await getSchema(),
          // @ts-ignore
          accountability: req.accountability,
        })
  
        formConfig = await formConfigService.readOne(formConfigId)

      } catch (error) {
        return catchError(error, res, `Your ${formConfigCollection} or related collection READ permissions must be allowed.`)
      }
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
        let newItem
        try {
          newItem = await responseService.createOne(itemData)
        } catch (error) {
          return catchError(error, res, `Your ${collectionName} or related collection CREATE permissions must be allowed.`)
        }

        res.status(201).json({
          message: 'Survey submitted successfully',
          item: newItem,
        })
      }

      await createItemInCollection(formSubmissionCollection, data)
      
    } catch (error) {
      const e = error as {name?: string, status?: number, code?: string}
      const status = e?.status
      res?.status(status ?? 404).json(error)
    }
  })

  router.patch('/form-config-update/:formConfigId', async (req, res) => {
    try {
      const { formConfigId } = req.params

      const settings = await getSettings(req, res)

      const formConfigCollection = settings?.[0]?.['form_config_collection'] ?? 'form_configs'

      let data
      try {
      // Fetch the survey definition from the form_config collection
      const formConfigService = new ItemsService(formConfigCollection, {
        schema: await getSchema(),
				// @ts-ignore
        accountability: req.accountability,
      })

      data = await formConfigService.updateOne(formConfigId, {
        ...req.body
      })
    } catch (error) {
      return catchError(error, res, `Your ${formConfigCollection} or related collection PATCH permissions must be allowed.`)
    }

      res.json({
        id: data,
        updatedSchema: req.body,
      })

    } catch (error) {
      const e = error as {name?: string, status?: number, code?: string}
      const status = e?.status
      res?.status(status ?? 404).json(error)
    }
  })

  router.post('/form-config-create', async (req, res) => {
    try {

      const settings = await getSettings(req, res)

      const formConfigCollection = settings?.[0]?.['form_config_collection'] ?? 'form_configs'
      let data
      try {

        // Fetch the survey definition from the form_config collection
        const formConfigService = new ItemsService(formConfigCollection, {
          schema: await getSchema(),
          // @ts-ignore
          accountability: req.accountability,
        })
        data = await formConfigService.createOne({
          ...req.body
        })
      } catch (error) {
        return catchError(error, res, `Your ${formConfigCollection} or related collection CREATE permissions must be allowed.`)
      }

      res.json(data)

    } catch (error) {
      const e = error as {name?: string, status?: number, code?: string}
      const status = e?.status
      res?.status(status ?? 404).json(error)
    }
  })
})
