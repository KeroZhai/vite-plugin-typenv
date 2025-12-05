import type { Plugin } from 'vite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { loadEnvFile } from './utils'

export function defineDefaultVariables(vars: UserDefinedEnvVariables): UserDefinedEnvVariables {
  return vars
}

export function defineVariables(vars: Partial<UserDefinedEnvVariables>): Partial<UserDefinedEnvVariables> {
  return vars
}

export default function envPlugin(): Plugin {
  let envDir: string
  let envPrefix: string | string[] = 'VITE_'
  const envVariables: Record<string, any> = {}

  return {
    name: 'vite-plugin-typenv',

    async config(config, { mode }) {
      if (config.envDir !== false) {
        envDir = resolve(config.envDir ?? config.root ?? cwd())
        envPrefix = config.envPrefix ?? envPrefix
        const prefixes = Array.isArray(envPrefix) ? envPrefix : [envPrefix]

        // load env files by priority
        const envFiles = [
          'env.js',
          'env.ts',
          'env.local.js',
          'env.local.ts',
          `env.${mode}.js`,
          `env.${mode}.ts`,
          `env.${mode}.local.js`,
          `env.${mode}.local.ts`,
        ]

        for (const file of envFiles) {
          const filePath = resolve(envDir, file)

          if (!existsSync(filePath))
            continue

          await loadEnvFile(filePath, envVariables)
        }

        // convert to vite define
        const definitions: Record<string, any> = {}

        for (const [key, value] of Object.entries(envVariables)) {
          const hasPrefix = prefixes.some(prefix => key.startsWith(prefix))

          if (hasPrefix) {
            definitions[`import.meta.env.${key}`] = JSON.stringify(value)
          }
        }

        return {
          define: {
            ...definitions,
          },
        }
      }
    },
  }
}
