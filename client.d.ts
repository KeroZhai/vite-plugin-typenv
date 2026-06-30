interface UserDefinedEnvVariables extends Record<string, any> {}

interface ImportMetaEnv extends UserDefinedEnvVariables {}

declare module 'virtual:typenv/runtime' {
  const env: UserDefinedEnvVariables
  export default env
}
