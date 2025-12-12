import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { normalizePath } from 'vite'
import { expand, parse } from './utils'

export function getEnvFilesForMode(
  mode: string,
  envDir: string | false,
): string[] {
  if (envDir !== false) {
    return [
      // default files
      `env.js`,
      `env.ts`,
      // local files
      `env.local.js`,
      `env.local.ts`,
      // mode files
      `env.${mode}.js`,
      `env.${mode}.ts`,
      // mode local files
      `env.${mode}.local.js`,
      `env.${mode}.local.ts`,
    ].map(file => normalizePath(path.join(envDir, file)))
  }

  return []
}

export async function loadEnv(mode: string, envDir: string | false, prefixes: string | string[] = 'VITE_'): Promise<Record<string, any>> {
  if (mode === 'local') {
    throw new Error(
      `"local" cannot be used as a mode name because it conflicts with `
      + `the .local postfix for .env files.`,
    )
  }

  prefixes = Array.isArray(prefixes) ? prefixes : [prefixes]
  const env: Record<string, string> = {}
  const envFiles = getEnvFilesForMode(mode, envDir)

  const parsedEntries = await Promise.all(
    envFiles.map(async (filePath) => {
      if (!existsSync(filePath))
        return []

      const parsed = await parse(filePath)
      return Object.entries(parsed)
    }),
  )

  const parsed = Object.fromEntries(
    parsedEntries.flat(),
  )

  // test NODE_ENV override before expand as otherwise process.env.NODE_ENV would override this
  if (parsed.NODE_ENV && process.env.VITE_USER_NODE_ENV === undefined) {
    process.env.VITE_USER_NODE_ENV = parsed.NODE_ENV
  }
  // support BROWSER and BROWSER_ARGS env variables
  if (parsed.BROWSER && process.env.BROWSER === undefined) {
    process.env.BROWSER = parsed.BROWSER
  }
  if (parsed.BROWSER_ARGS && process.env.BROWSER_ARGS === undefined) {
    process.env.BROWSER_ARGS = parsed.BROWSER_ARGS
  }

  // let environment variables use each other. make a copy of `process.env` so that `dotenv-expand`
  // doesn't re-assign the expanded values to the global `process.env`.
  const processEnv = { ...process.env }
  expand({ parsed, processEnv })

  // only keys that start with prefix are exposed to client
  for (const [key, value] of Object.entries(parsed)) {
    if (prefixes.some(prefix => key.startsWith(prefix))) {
      env[key] = value
    }
  }

  // check if there are actual env variables starting with VITE_*
  // these are typically provided inline and should be prioritized
  for (const key in process.env) {
    if (prefixes.some(prefix => key.startsWith(prefix))) {
      env[key] = process.env[key] as string
    }
  }

  return env
}
