# vite-plugin-typenv
Use JS/TS files for environment variables over `.env` files, and provides complete TypeScript type support.

## Usage

Install the plugin:

```bash
npm install -D vite-plugin-typenv
```

Add it to your Vite config:

```js
// vite.config.js
import { defineConfig } from 'vite'
import Typenv from 'vite-plugin-typenv'

export default defineConfig({
  plugins: [
    Typenv(),
  ],
})
```

The plugin will load additional environment variables from the following files in your [environment directory](https://vite.dev/config/shared-options#envdir):

```
env.js              # loaded in all cases
env.local.js        # loaded in all cases, ignored by git
env.[mode].js       # only loaded in specified mode
env.[mode].local.js # only loaded in specified mode, ignored by git
```

To get TypeScript IntelliSense, create an `vite-env.d.ts` in `src` directory, and augment `UserDefinedEnvVariables`(instead of `ImportMetaEnv`, see [Intellisense for TypeScript](https://vite.dev/guide/env-and-mode#intellisense-for-typescript) for more info) like this:

```ts
// src/vite-env.d.ts
interface UserDefinedEnvVariables {
  /**
   * App title
   */
  readonly VITE_APP_TITLE: string
  // more env variables...
}
```

> [!NOTE]
> After doing this, `import.meta.env` will also be typed.

Replace your original `.env` files with `env.js` or `env.ts` files, and use the `defineDefaultVariables` function to define env variables:

```js
// env.js
import { defineDefaultVariables } from 'vite-plugin-typenv'

export default defineDefaultVariables({
  VITE_APP_TITLE: 'Vite App', // Now fully type-safe with IntelliSense
})
```

Local env files and mode-specific env files are also supported, use the `defineVariables` function to define env variables:

```js
// env.local.js
import { defineVariables } from 'vite-plugin-typenv'

export default defineVariables({
  VITE_APP_TITLE: 'Vite App Local', // All env variables here are optional
})
```

> [!NOTE]
> By default, only variables prefixed with `VITE_` are exposed to your Vite-processed code. You can customize this behavior by setting the [`envPrefix`](https://vite.dev/config/shared-options#envprefix) option.
