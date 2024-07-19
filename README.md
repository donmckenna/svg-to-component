# svg-to-component

A Vite plugin which generates `.tsx` and `.astro` components from `.svg` files and directories.

![svg-to-component plugin diagram](/public/docs/svg-to-component-01.jpg)


- [Example](#example)
  - [Example file references](#example-file-references)
- [Setup](#setup)
  - [Config](#config)
  - [Config params](#config-params)
    - [`inputPaths`: `string[]`](#inputpaths-string)
    - [`outputPath`: `string`](#outputpath-string)
    - [`exclude`: `ComponentType[]`](#exclude-componenttype)
    - [`include`: `ComponentType[]`](#include-componenttype)
- [Usage](#usage)
  - [Generate components](#generate-components)
  - [Use component(s) in templates](#use-components-in-templates)
  - [Component params](#component-params)
    - [`icon`: `Icons`](#icon-icons)
    - [`color?`: `string`](#color-string)
    - [`size?`: `number`](#size-number)
    - [`id`: `string`](#id-string)
    - [`class`: `string`](#class-string)
  - [Type safety](#type-safety)


## Example

Running the Astro project in this repo offers a minimal setup of the working plugin.

![svg-to-component plugin diagram](/public/docs/svg2c-eg-04.jpg)

### Example file references
- [Config](https://github.com/donmckenna/svg-to-component/blob/main/astro.config.mjs#L10-L17)
- [Plugin](https://github.com/donmckenna/svg-to-component/blob/main/plugins/svgToComponent.ts)
- [Generated Icon Directory](https://github.com/donmckenna/svg-to-component/tree/main/src/components/Icon)
- [Generated Icon Model](https://github.com/donmckenna/svg-to-component/blob/main/src/components/Icon/Icons.ts)


## Setup

### Config

At a minimum we need an `outputPath` to render our components and types to, and at least one `inputPath` to grab `.svgs` from.  
A basic Astro example may look like this:

```ts
// astro.config.mjs
export default defineConfig({
  vite: {
    plugins: [
      svgToComponent({
        inputPaths: [
          '/public/icons',
          '/public/logos',
        ],
        outputPath: '/src/components/Icon',
      })
    ]
  },
});
```

This plugin assumes the existence of a `/src/components/` directory and uses a custom path in `tsconfig.json`.  
In the future this assumption could be improved to be more versatile, but for now we just need to add `@components` to our `paths`.

```ts
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@components/*": [
        "src/components/*"
      ]
    }
  }
}
```

### Config params

```ts
type ComponentType = 'astro'|'tsx';

interface PluginConfig {
  inputPaths: string[];
  outputPath: string;
  include?: ComponentType[];
  exclude?: ComponentType[];
}
```

#### `inputPaths`: `string[]`
- Path(s) which plugin uses to find `.svgs` to convert. 

#### `outputPath`: `string`
- Path where output `<Icon />` component(s) will be created

#### `exclude`: `ComponentType[]`
- `<Icon />` component file formats to not generate.

#### `include`: `ComponentType[]`
- `<Icon />` component file formats to definitely generate.


## Usage

### Generate components

Add `.svgs` to your `inputPaths` directories and components will be automatically generated when the plugin runs.

### Use component(s) in templates

In an `.astro` file:

```tsx
---
import Icon from '@components/Icon/Icon.astro';
---

<Icon icon="astro" />
```

In a `.tsx` file:

```tsx
import { Icon } from '@components/Icon/Icon';

export const ReactComponent = () => (
  <Icon icon="react" />
);
```

We can also use the `.tsx` `<Icon />` component in an `.astro` file if we wish:

```tsx
---
import { Icon } from '@components/Icon/Icon';
---

<Icon icon="react" />
```

We could also be arbitrarily confusing and include them both in an `.astro` file:  ¯\\\_(ツ)_/¯

```tsx
---
import IconA from '@components/Icon/Icon.astro';
import { Icon as IconT } from '@components/Icon/Icon';
---

<IconA icon="astro" />
<IconT icon="react" />
```

### Component params

```ts
interface Props {
  icon: Icons;
  color?: string;
  size?: number;
  id?: string;
  class?: string;
}
```

#### `icon`: `Icons`
- An icon name from the `Icons` model generated from `.svg` file names found in `inputPaths` 

#### `color?`: `string`
- A valid color such as hex, rgb, hsla or css variable.
  - When _not_ defined, component will use `svg's` default colors, including `currentColor`.
  - When defined, component will use `svg` as a css `mask-image` and apply the `color` to its `background-color`

#### `size?`: `number`
- The icon width and height in pixels.
- Defaults to `16`

#### `id`: `string`
- Add a referenceable `id` to `<Icon />` component.

#### `class`: `string`
- Add a referenceable css `class` to `<Icon />` component.
  - If using `.tsx` component, this param will instead be called `className`


### Type safety

Types for `<Icon />'s` `icon` param are automatically generated from `.svg` file names included in `inputPaths`.

Given an asset directory structure which looks like this:

![svg-to-component plugin diagram](/public/docs/svg2c-eg-02.jpg)

An `Icons` model is generated:

![svg-to-component plugin diagram](/public/docs/svg2c-eg-03.jpg)

And we can expect our component `icon` types to look like this:

![svg-to-component plugin diagram](/public/docs/svg2c-eg-01.jpg)

