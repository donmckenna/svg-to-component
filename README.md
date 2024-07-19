# `svg-to-component`

A Vite plugin which generates `.tsx` and `.astro` components from `.svg` files and directories.

![svg-to-component plugin diagram](/public/docs/svg-to-component-01.jpg)

## Config setup

At a minimum we need an `outputPath` and at least one `inputPath` array value.
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

```json
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

### Component Params



### Type safety

Types are automatically generated from `.svg` names to restrict the `<Icon icon={} />` param to only accept icon names from chosen `inputPaths`.

Given an asset directory structure which looks like this:

![svg-to-component plugin diagram](/public/docs/svg2c-eg-02.jpg)

An `Icons` model is generated:

![svg-to-component plugin diagram](/public/docs/svg2c-eg-03.jpg)

And we can expect our component `icon` types to look like this:

![svg-to-component plugin diagram](/public/docs/svg2c-eg-01.jpg)







## Parameters

### `inputPaths: string[]`
Path(s) which plugin uses to find `.svgs` to convert. 

### `outputPath: string`
Path where output `<Icon />` component(s) will be created

### `exclude?: ('astro'|'tsx')[]`
`<Icon />` component file formats to not generate.

### `include?: ('astro'|'tsx')[]`
`<Icon />` component file formats to definitely generate.
