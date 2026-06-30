import type { Plugin, ResolvedConfig } from 'vite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { loadEnv } from './env'

export interface VitePluginTypenvOptions {
  /**
   * Runtime config options.
   * When enabled, a JSON config file will be written to the output directory during build,
   * which can be modified on the server without rebuilding.
   * The virtual module `virtual:typenv` provides the runtime env values.
   */
  runtimeEnv?: {
    /**
     * Whether to enable the runtime config.
     */
    enabled: boolean
    /**
     * Base name of the config file (`.json` is always appended).
     * @default 'config'
     */
    name?: string
    /**
     * Keys to include in the runtime config. If omitted, all exposed variables are included.
     * Use this to limit which variables can be modified at runtime after deployment.
     */
    include?: string[]
  }
}

export function defineDefaultVariables(vars: UserDefinedEnvVariables): UserDefinedEnvVariables {
  return vars
}

export function defineVariables(vars: Partial<UserDefinedEnvVariables>): Partial<UserDefinedEnvVariables> {
  return vars
}

export { loadEnv }

const VIRTUAL_MODULE_ID = 'virtual:typenv/runtime'
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

function resolveRuntimeEnv(
  env: Record<string, any>,
  include: string[] | undefined,
): Record<string, any> {
  if (!include || include.length === 0) {
    return env
  }
  return Object.fromEntries(
    include.filter(key => key in env).map(key => [key, env[key]]),
  )
}

export default function envPlugin(options: VitePluginTypenvOptions = {}): Plugin {
  let envDir: string
  let envPrefix: string | string[] = 'VITE_'
  let resolvedEnv: Record<string, any> = {}
  let resolvedConfig: ResolvedConfig | null = null
  let command: 'build' | 'serve' = 'serve'

  return {
    name: 'vite-plugin-typenv',

    async config(config, { command: cmd, mode }) {
      command = cmd

      if (config.envDir !== false) {
        envDir = resolve(config.envDir ?? config.root ?? process.cwd())
        envPrefix = config.envPrefix ?? envPrefix

        resolvedEnv = await loadEnv(mode, envDir, envPrefix)

        return {
          define: Object.fromEntries(
            Object.entries(resolvedEnv)
              .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
          ),
        }
      }
    },

    configResolved(config) {
      resolvedConfig = config
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID || !resolvedEnv) {
        return
      }

      const filename = `${options.runtimeEnv?.name ?? 'config'}.json`
      const runtimeEnv = resolveRuntimeEnv(resolvedEnv, options.runtimeEnv?.include)

      if (command === 'serve') {
        // Dev mode: return env values directly, synchronous.
        return `export default ${JSON.stringify(runtimeEnv)}`
      }

      // Build mode: fetch the config file at runtime.
      return `
let _env
try {
  const res = await fetch('/${filename}')
  if (res.ok) {
    _env = await res.json()
  } else {
    throw new Error(\`HTTP \${res.status}\`)
  }
} catch (err) {
  console.warn('[vite-plugin-typenv] Failed to load runtime config from /${filename}.', err)
  _env = {}
}
export default _env
`.trimStart()
    },

    writeBundle() {
      if (options.runtimeEnv?.enabled && resolvedEnv && command === 'build') {
        const filename = `${options.runtimeEnv.name ?? 'config'}.json`
        const runtimeEnv = resolveRuntimeEnv(resolvedEnv, options.runtimeEnv.include)
        const outDir = resolvedConfig!.build.outDir
        const configPath = join(outDir, filename)

        mkdirSync(outDir, { recursive: true })
        writeFileSync(configPath, JSON.stringify(runtimeEnv, null, 2))
      }
    },
  }
}
