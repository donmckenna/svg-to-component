import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svgToComponent from './plugins/svgToComponent';


// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [svgToComponent({
      inputPaths: ['/public/icons', '/public/logos'],
      outputPath: '/src/components/Icon'
    })]
  },
  integrations: [react()]
});
