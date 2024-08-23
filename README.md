
![Design sans titre](https://github.com/user-attachments/assets/90bcacdf-c118-44c1-a61c-c297280f8720)

# Directus Extension for SurveyJS

A Directus Module extension that integrates the SurveyJS Creator into Directus.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Configuration](#configuration)
- [Using the Builder](#using-the-builder)
- [API Endpoints](#api-endpoints)
- [TODOs](#todos)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This extension allows you to create and manage surveys using the SurveyJS Creator directly within Directus. It provides a seamless interface for building, updating, and storing survey configurations.

## Installation

- [Official Guide](https://docs.directus.io/extensions/installing-extensions.html)
- NPM Package not released yet so you need to use the source code directly

## Configuration

After installation, add the required collections and fields:

### Collections

1. **form_configs**
   - `schema` (JSON): JSON code; should be readonly.
   - `friendly_id` (String): Text input. <br/>
   Follow this video to see in details how to configure it : 

https://github.com/user-attachments/assets/4e09c136-99e3-4083-9aa1-7f1596e411af

2. **languages**
   - `code` (String): Text.
   - `name` (String): Text.
   - `direction` (String): Text. <br/>
   See video for more details :


https://github.com/user-attachments/assets/019e914a-3284-472c-a9a1-38c92ff33aec


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

## TODOs

- Add breadcrumb Directus Navigation inside the Module.
- Add Page navigation inside the Module.
- Add Dynamic collection name for `form_configs`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to contribute or suggest improvements!
