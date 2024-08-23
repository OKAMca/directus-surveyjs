
![Design sans titre](https://github.com/user-attachments/assets/90bcacdf-c118-44c1-a61c-c297280f8720)

# Directus Extension for SurveyJS

A Directus Module extension that integrates the SurveyJS Creator into Directus.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration](#configuration)
- [Using the Builder](#using-the-builder)
- [API Endpoints](#api-endpoints)
- [Handling Form Submissions](#handling-form-submissions)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This extension allows you to create and manage surveys using the SurveyJS Creator directly within Directus. It provides a seamless interface for building, updating, and storing survey configurations.

## Installation

- [Official Guide](https://docs.directus.io/extensions/installing-extensions.html)
- NPM Package not released yet so you need to use the source code directly

## Configuration

### Basic Setup

After installation, the first time you will open the module page, you will be prompted with a form to finish the basic configuration.
The first field allows you to give the name to the collection that will be used to store all your form configurations. Default is `form_configs`

If you don't already have the `languages` collection made by directus, make sure to create one. <br/>
**languages**
   - `code` (String): Text.
   - `name` (String): Text.
   - `direction` (String): Text. <br/>
   See video for more details :


https://github.com/user-attachments/assets/019e914a-3284-472c-a9a1-38c92ff33aec

Clicking the `Finish setup` button will create the basic necessary collections for the creator to work.
Collections created :
- form_configs
- module_extension_survey_settings <br />


### Translations

The translations available in the creator are based on the languages you have setup in your directus instance https://docs.directus.io/guides/headless-cms/content-translations.html#create-a-languages-collection

Module translations strings to add to your directus instance : 
- `$t:extension_survey_form_creator` : Title used in the page navigation of the module "Form Creator"
- `$t:extension_survey_no_forms` : Message displayed when no forms are found, should be something like "No forms available"
- `$t:extension_survey_module_name` : Name of the module, should be something like "Forms"

Handle default form creator form language:
Add a field M2O inside the `module_extension_survey_settings` collection named `default_form_language`.
From there, choose in the settings your default language.

### Settings
The settings provide the default SurveyJS options available to the creator listed here https://surveyjs.io/survey-creator/documentation/api-reference/icreatoroptions
In addition, there is the `licence_key` option that allows you to put your license for SurveyJS.
You can also add manually a field with the key `default_form_language` M2O to `languages` collection to handle the default form language


### Activation

Activate the module by navigating to:
`Settings -> Settings -> Modules` and enabling the Survey module.


https://github.com/user-attachments/assets/977c7ede-6f3c-41ff-a82b-4cf1ffd3942e



## Using the Builder

### Creating / updating and saving a form

1. **Create Form Configuration**: Create a `form_configs` content object and assign it a `friendly_id`.
2. **Access Surveys Tab**: Navigate to the Surveys Tab on the far left sidebar of Directus. All `form_configs` content objects will be listed with their `friendly_id` as the title.
3. **Open the Builder**: Click on a form configuration to access its builder.
4. **Build Your Form**: Use the builder to create your form. Remember to save your work!
5. **Verify Schema**: After saving, go back to your Directus content and find the modified `form_config`. The `schema` should be updated with the new schema generated from the builder.


https://github.com/user-attachments/assets/df76c801-f0a7-469d-8a19-d9f20782fecb

### How translations work

- Builder interface language : The interface language of the builder is based on the language selected by the user inside his directus settings.
- How to translate a form :
  1. The available languages provided to translate the form are based on the instances of your `languages` directus collection. So if you only have one language, your forms won't be translatable.
  2. Having 2 languages setup, all translations are handled inside the `Translations` tab of the builder. There you can add languages you wish to translate your forms in the left sidebar. For each language added, a new column will be added to translate every 
     string your form could contain.

## API Endpoints

The extension provides several API endpoints for interacting with surveys. To access each route, you need to use the domain where your directus instance is hosted followed by `/survey-api` followed by the route. <br/>
Example: `https://directus-domain-example/survey-api/form-config-create`

### Create Form Entry

- **Endpoint**: `POST /survey-submission/:formConfigId/:formCollection`
- **Description**: Creates a form entry from a form submission.
- **URL Parameters**:
  - `formConfigId`: The ID of the `form_configs` object.
  - `formCollection`: The collection you wish to create an object from.
- **Request Requirements**:
  - **Body**: The data from the form.
  - **Headers**: `{'Content-Type': 'application/json'}`

### Update Form Configuration

- **Endpoint**: `PATCH /form-config-update/:formConfigId`
- **Description**: Used internally by the extension to update a `form_config` when saved inside the builder.

### Create Form Configuration

- **Endpoint**: `POST /form-config-create`
- **Description**: Used internally to potentially add a create form button inside the listing of the module.

## Handling Form Submissions

To handle form submissions, you need to create to create a collection that will be used as a type of submission.
Each form configuration accepts one type of form submission.
To make the process easier, create a collection called `base_form_submissions` that will be used as base for each type.

### Create `base_form_submissions`
Fields: 
- `form_data`: (JSON Code)
- `form_language`: (M2O) with `languages`
- `form_config`: (M2O) with `form_configs`
- `form_config_version_data`: (Date / Hour)

### Create your form submission collection
This collection can take the name you wish.
Add the fields you wish to the collection to collect the data in a presentable way (optionnal)

#### Using `base_form_submission`
1. Install https://github.com/hanneskuettner/directus-extension-inline-form-interface
2. Add a field called `default_fields` and link it to `base_form_submissions`

### Example code for submission 
```tsx
  const saveSurveyResults = (url: string, json: JSONObject) => {
    const entriesFieldMap = Object.entries(fieldMap ?? {})

    const mappedFields = entriesFieldMap
      .map(([key, value]: string[]) => {
        if (json?.[value]) {
          return [key, json?.[value]]
        }
        return null
      })
      .filter((el) => el !== null)

    const body = {
      ...Object.fromEntries(mappedFields),
      ...additionalData,
      default_fields: {
        form_data: {
          ...json,
          ...additionalData,
        },
        form_config: formConfigId,
        form_language: locale,
        form_config_version_date: versionDate,
      },
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (response.ok) {
          // Handle success
        } else {
          // Handle error
        }
      })
      .catch((error) => {
        // Handle error
      })
  }

  const handleComplete = useCallback((form: Model) => {
    saveSurveyResults(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/survey-api/form-submission/${formConfigId}`, form.data)
  }, [])

  survey.onComplete.add(handleComplete)

  return <Survey model={survey} />
```


## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to contribute or suggest improvements!

