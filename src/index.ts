import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import process from 'node:process'
import { loadEnv } from './env'

export function defineDefaultVariables(vars: UserDefinedEnvVariables): UserDefinedEnvVariables {
  return vars
}

export function defineVariables(vars: Partial<UserDefinedEnvVariables>): Partial<UserDefinedEnvVariables> {
  return vars
}

export { loadEnv }

export default function envPlugin(): Plugin {
  let envDir: string
  let envPrefix: string | string[] = 'VITE_'

  return {
    name: 'vite-plugin-typenv',

    async config(config, { mode }) {
      if (config.envDir !== false) {
        envDir = resolve(config.envDir ?? config.root ?? process.cwd())
        envPrefix = config.envPrefix ?? envPrefix

        return {
          define: Object.fromEntries(
            Object.entries(await loadEnv(mode, envDir, envPrefix))
              .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
          ),
        }
      }
    },
  }
}
