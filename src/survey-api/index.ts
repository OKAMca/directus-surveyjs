/* eslint-disable @typescript-eslint/naming-convention */
import { defineEndpoint } from '@directus/extensions-sdk'
import { isEmpty } from 'lodash'

export default defineEndpoint((router, { services, getSchema, logger }) => {

  const { ItemsService } = services

  const settingsCollectionKey = "module_extension_survey_settings"

  const errorStatus = (error: unknown) => {
    const status = (error as {status?: unknown} | null)?.status
    return typeof status === 'number' && status >= 400 && status < 600 ? status : 404
  }

  // Sends a status and a fixed message, never the error object, and never a second response.
  const sendError = (res: any, status: number, message: string) => {
    if (res.headersSent) return
    res.status(status).json({ details: message })
  }

  const catchError = (error: unknown, res: any, message: string) => {
    logger.warn(error, `[survey-api] ${message}`)
    sendError(res, errorStatus(error), message)
  }

  // Express 4 does not catch a rejected async handler, and an unhandled rejection stops Directus.
  const handle = (handler: (req: any, res: any) => Promise<void>) => async (req: any, res: any) => {
    try {
      await handler(req, res)
    } catch (error) {
      logger.error(error, '[survey-api] Unexpected error')
      sendError(res, errorStatus(error), 'The request could not be completed.')
    }
  }

  // Returns null after sending an error response; the caller must stop.
  const getSettings = async (req: any, res: any): Promise<Record<string, any>[] | null> => {
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
        catchError(error, res, 'Your module_extension_survey_settings or related collection READ permissions must be allowed.')
        return null
      }
  }

  router.post('/form-submission/:formConfigId', handle(async (req, res) => {

    const settings = await getSettings(req, res)
    if (!settings) return

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
      const formSubmissionCollection = formConfig?.form_submission_collection

      if (!formConfig || !formSubmissionCollection) {
        return sendError(res, 404, 'No form config found.')
      }

      const data = req.body
      if (!data || typeof data !== 'object') {
        return sendError(res, 404, 'Body should be an object encoded in JSON.')
      }

      if (isEmpty(data)) {
        return sendError(res, 404, 'Body is empty')
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
  }))

  router.patch('/form-config-update/:formConfigId', handle(async (req, res) => {
      const { formConfigId } = req.params

      const settings = await getSettings(req, res)
      if (!settings) return

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
  }))

  router.post('/form-config-create', handle(async (req, res) => {

      const settings = await getSettings(req, res)
      if (!settings) return

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
  }))
})
