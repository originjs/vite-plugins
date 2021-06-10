# vite-plugin-commonjs

Support commonJS to esm in `vite`

## Install
```shell
npm install @originjs/vite-plugin-commonjs --save-dev
```
or
```shell
yarn add @originjs/vite-plugin-commonjs --dev
```

## Usage
```js
import commonjs from '@originjs/vite-plugin-commonjs'

export default {
    plugins: [
        commonjs()
    ]
}
```

### Options

- `exclude: string[]`
  Dependencies to exclude from transform.

-  `include: string[]`
  Dependencies that only need to be transform.
  