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
