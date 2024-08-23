export type TFormConfig = {
  id?: string
  title?: string;
  friendly_id?: string;
  schema?: string;
}

export type TDirectusUser = {
  email?: string
  id?: string
  language?: string
}

export type TDirectusLanguage = {
  code?: string
  direction?: string
  name?: string
}

export type TBreadcrumb = {
  name: string
  to: string
}

export type TPage = {
  label: string
  uri: string
  to?: string
  icon?: string
  color?: string
}