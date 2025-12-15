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
import typenv from 'vite-plugin-typenv'

export default defineConfig({
  plugins: [
    typenv(),
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

To get TypeScript IntelliSense, create an `vite-env.d.ts` in `src` directory, and augment `UserDefinedEnvVariables` (instead of `ImportMetaEnv`, see [Intellisense for TypeScript](https://vite.dev/guide/env-and-mode#intellisense-for-typescript) for more details):

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

Then add `vite/client` and `vite-plugin-typenv/client` to your `tsconfig.json`:

```
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client", "vite-plugin-typenv/client"]
  }
}
```

<details>
  <summary>Using triple-slash directive</summary>

  Alternatively, you can add the following directive to your `vite-env.d.ts` file:

  ```ts
  // src/vite-env.d.ts
  /// <reference types="vite/client" />
  /// <reference types="vite-plugin-typenv/client" />
  ```

</details>

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

Also, variables expansion is supported and enabled by default. The core logic is directly copied from [dotenv-expand](https://github.com/motdotla/dotenv-expand), refer to [their docs](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow) to learn more about the syntax.

Note that if you want to use `$` in your env variables, you need to escape it with `\`.

```js
// env.local.js
import { defineVariables } from 'vite-plugin-typenv'

export default defineVariables({
  VITE_USERNAME: 'keroz',
  VITE_MESSAGE: 'Hello $VITE_USERNAME', // Hello keroz
  VITE_ESCAPED_MESSAGE: '\\$foo', // $foo
})
```

> [!NOTE]
> - `env.*.local.js/ts` files are local-only and can contain sensitive variables. You should add `*.local.js/ts` to your `.gitignore` to avoid them being checked into git.
> - Since any variables exposed to your Vite source code will end up in your client bundle, `VITE_*` variables should not contain any sensitive information.

To use environment variables in Vite config file, you can use `loadEnv` helper function:

```js
// vite.config.js
import { defineConfig } from 'vite'
import { loadEnv } from 'vite-plugin-typenv'

export default defineConfig(async ({ mode }) => {
  const env = await loadEnv(mode)

  return {
    base: env.VITE_BASE_URL
  }
})
```

See also [Using Environment Variables in Config](https://vite.dev/config/#using-environment-variables-in-config) in Vite docs.
