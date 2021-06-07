# vite-plugin-require-context

Support `require.context` in `vite`

## Install
```shell
npm install @originjs/vite-plugin-require-context --save-dev
```
or
```shell
yarn add @originjs/vite-plugin-require-context --dev
```

## Usage
```js
import ViteRequireContext from '@originjs/vite-plugin-require-context'

export default {
    plugins: [
        ViteRequireContext()
    ]
}
```

### Options

- `projectBasePath: string`
   The base path of your project. Default to be `process.cwd()`
  
- `defaultRegExp: RegExp`
   The default RegExp used in `require.context` if the third parameter of `require.context` is not specified. Default to be `/\.(json|js)$/`