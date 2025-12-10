/* eslint-disable ts/ban-ts-comment */
import process from 'node:process'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)

export async function loadEnvFile(filePath: string, target: Record<string, any>): Promise<void> {
  try {
    const moduleDefault = await jiti.import(filePath, { default: true })

    if (moduleDefault && typeof moduleDefault === 'object') {
      Object.assign(target, moduleDefault)
    }
  }
  catch (error) {
    console.error(`[vite-plugin-typenv] Error loading env file: ${filePath}`, error)
  }
}

/*
 * Variables expansion, copied directly from dotenv-expand.
 */

export function expand(options: { parsed: Record<string, any>, processEnv?: Record<string, any> }): { parsed: Record<string, any>, processEnv?: Record<string, any> } {
  // for use with progressive expansion
  const runningParsed: Record<string, any> = {}

  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  // dotenv.config() ran before this so the assumption is process.env has already been set
  for (const key in options.parsed) {
    let value = options.parsed[key]

    // short-circuit scenario: process.env was already set prior to the file value
    if (processEnv[key] && processEnv[key] !== value) {
      value = processEnv[key]
    }
    else if (typeof value === 'string') {
      value = expandValue(value, processEnv, runningParsed)
    }

    if (typeof value === 'string') {
      value = _resolveEscapeSequences(value)
    }

    options.parsed[key] = value

    // for use with progressive expansion
    runningParsed[key] = value
  }

  for (const processKey in options.parsed) {
    processEnv[processKey] = options.parsed[processKey]
  }

  return options
}

function _resolveEscapeSequences(value: string): string {
  return value.replace(/\\\$/g, '$')
}

function expandValue(value: string, processEnv: Record<string, any>, runningParsed: Record<string, any>): string {
  const env = { ...runningParsed, ...processEnv } // process.env wins

  const regex = /(?<!\\)\$\{([^{}]+)\}|(?<!\\)\$([A-Z_]\w*)/gi

  let result = value
  let match
  const seen = new Set() // self-referential checker

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(result)) !== null) {
    seen.add(result)

    const [template, bracedExpression, unbracedExpression] = match
    const expression = bracedExpression || unbracedExpression

    // match the operators `:+`, `+`, `:-`, and `-`
    const opRegex = /(:\+|\+|:-|-)/
    // find first match
    const opMatch = expression.match(opRegex)
    const splitter = opMatch ? opMatch[0] : null

    // @ts-expect-error
    const r = expression.split(splitter)

    let defaultValue
    let value

    const key = r.shift()

    // @ts-expect-error
    if ([':+', '+'].includes(splitter)) {
      // @ts-expect-error
      defaultValue = env[key] ? r.join(splitter) : ''
      value = null
    }
    else {
      // @ts-expect-error
      defaultValue = r.join(splitter)
      // @ts-expect-error
      value = env[key]
    }

    if (value) {
      // self-referential check
      if (seen.has(value)) {
        result = result.replace(template, defaultValue)
      }
      else {
        result = result.replace(template, value)
      }
    }
    else {
      result = result.replace(template, defaultValue)
    }

    // if the result equaled what was in process.env and runningParsed then stop expanding
    // @ts-expect-error
    if (result === runningParsed[key]) {
      break
    }

    regex.lastIndex = 0 // reset regex search position to re-evaluate after each replacement
  }

  return result
}
