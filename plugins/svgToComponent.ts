import type { Plugin } from 'vite';
import fs from 'fs';

import { c } from './cliColor';

interface FileData {
  path: string;
  fileName: string;
  componentName: string;
}

interface SvgData {
  directory: string;
  files: FileData[];
}

const pluginName = 'svg-to-component';

// ----------------------------------------
// CLI messages

const logOnBuild = () => {
  console.log(`${c.gr(`${pluginName}:`)}`);
};

// ----------------------------------------
// Structure the data

const getSvgData = (paths: string[]) => {
  // get directory
  const directoryParams = paths[0].split('/');
  const directory = directoryParams[directoryParams.length - 2];
  // get icons
  const icons = paths.map(p => {
    const path = `.${p}`;
    const fileNames = path.split('/');
    const fileName = fileNames[fileNames.length - 1].split('.svg')[0];
    const componentName = `${fileName.split('-').map(f => f.replace(f[0], f[0].toUpperCase())).join('')}Icon`;
    const fileData: FileData = { path, fileName, componentName };
    return fileData;
  });
  const svgDataGroup: SvgData = {
    directory,
    files: icons,
  };
  return svgDataGroup;
};

// ----------------------------------------
// Output directory

const createDirectoryIfNoneExists = (directoryName: string) => {
  if (!fs.existsSync(directoryName)) {
    fs.mkdir(directoryName, (err) => {
      if (err)
        console.log(err);
      else {
        console.log(`${c.g('🗸')} Directory created:  ${directoryName}`);
      }
    });
  }
};

// ----------------------------------------
// [model].ts

const createIconModelFileContentSection = (svgData: SvgData) => {
  const dataLines = svgData.files.map(ic => `| '${ic.fileName}'`);
  return `  // ${svgData.directory}\n  ${dataLines.join('\n  ')}`;
};

const createIconModelFileContent = (svgData: SvgData[],) => (
`export type Icons =
${svgData.map(sd => `${createIconModelFileContentSection(sd)}\n`).join('')};
`);

const createIconModelFile = (svgData: SvgData[], outputPath: string) => {
  const iconModelFilePath = `.${outputPath}/Icons.ts`;
  const iconModelFileContent = createIconModelFileContent(svgData);
  const toWriteCount = svgData.map(s => s.files.length).reduce((a, b) => +a + +b);
  fs.writeFile(
    iconModelFilePath,
    iconModelFileContent,
    (err) => {
      if (err)
        console.log(err);
      else {``
        console.log(`Converting ${c.c(`${toWriteCount}`)} files in ${c.c(`${svgData.length}`)} directories`);
        console.log(`${c.g('🗸')} Icon types written successfully`);
      }
    }
  );
};

// ----------------------------------------
// .tsx

const createIconTsxFilesContent = (componentName: string, svgData: string) => (
`export const ${componentName} = () => ${svgData};`
);

const createIconTsxFiles = (svgData: SvgData[], outputPath: string) => {
  let writeCount = 0;
  const toWriteCount = svgData.map(s => s.files.length).reduce((a, b) => +a + +b);
  svgData.map(s => {
    createDirectoryIfNoneExists(`.${outputPath}/${s.directory}`);
    createDirectoryIfNoneExists(`.${outputPath}/${s.directory}/tsx`);
    s.files.map(file => {
      const svgData = fs.readFileSync(`${file.path}`)
        .toString('utf8')
        .replace(/[\n\r\t\s]+/g, ' ')
        .replace(/class=/g, 'className=')
        .replace(/xml:space/g, 'xmlSpace')
        .replace(/clip-path/g, 'clipPath')
        .replace(/clip-rule/g, 'clipRule')
        .replace(/fill-opacity/g, 'fillOpacity')
        .replace(/fill-rule/g, 'fillRule')
        .replace(/stop-color/g, 'stopColor')
        .replace(/stop-opacity/g, 'stopOpacity')
        .replace(/width="([^"]+)"/, '')
        .replace(/height="([^"]+)"/, '')
        .replace(`<svg `, `<svg style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} `);
      const tsxFile = createIconTsxFilesContent(file.componentName, svgData);
      fs.writeFile(`.${outputPath}/${s.directory}/tsx/${file.fileName}.tsx`, tsxFile, (err) => {
        if (err)
          console.log(err);
        else {
          writeCount += 1;
          if (writeCount === toWriteCount) {
            console.log(`${c.g('🗸')} [Icon].tsx files written successfully`);
          }
        }
      });
    });
  });
};

const createIconTsxFileContent = (fileImports: string, fileImportsObject: string) => (
`import type { FC } from 'react';
import type { Icons } from './Icons';

import cn from 'classnames';
import s from './Icon.module.scss';

${fileImports}

const icons: {[key in Icons]: () => JSX.Element} = {
${fileImportsObject}
};

interface Props {
  icon: Icons;
  color?: string;
  size?: number;
  id?: string;
  className?: string;
}

export const Icon: FC<Props> = ({
  icon,
  color,
  size = 16,
  id,
  className,
}) => {
  const SvgIcon = icons[icon];
  return (
    <div
      className={cn(
        s.icon,
        color && s.isFlat,
        color && s[icon],
        className && className
      )}
      style={{
        ['--icon-size' as string]: size,
        backgroundColor: color ? \`\${color}\` : 'transparent'
      }}
      id={id}
    >
      {!color && <SvgIcon />}
    </div>
  );
};
`);
  
const createIconTsxFile = (svgData: SvgData[], outputPath: string) => {
  // construct icon import list
  const fileImports = svgData.map(d => {
    const files = d.files.map(f => {
      const tsPath = outputPath.replace(`/src/components`, `@components`);
      const fileImportPath = `${tsPath}/${d.directory}/tsx/${f.fileName}`;
      return `import { ${f.componentName} } from '${fileImportPath}';`;
    });
    return [`// ${d.directory}`, ...files];
  }).flat().join('\n');
  // construct key/component object
  const fileImportsObject = svgData.map(d => {
    const files = d.files.map(f => {
      const propertyFileName = f.fileName.includes('-') ? `'${f.fileName}'` : f.fileName;
      return `  ${propertyFileName}: ${f.componentName},`;
    });
    return [`  // ${d.directory}`, ...files];
  }).flat().join('\n');

  const iconTsxFile = createIconTsxFileContent(fileImports, fileImportsObject)

  fs.writeFile(`.${outputPath}/Icon.tsx`, iconTsxFile, (err) => {
    if (err)
      console.log(err);
    else {
      console.log(`${c.g('🗸')} Icon.tsx written successfully`);
    }
  });
};

// ----------------------------------------
// Icon.module.scss

const createIconStyleContent = (fileClasses: string) => (
`.icon {
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: ease 0.1s;
  transition-property: background-color, color;
  &.isFlat {
    width: calc(var(--icon-size)  * 1px);
    height: calc(var(--icon-size)  * 1px);
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: contain;
${fileClasses}
  }
}`);

const createScssLines = (svgData: SvgData[]) => svgData.map(d => {
  const files = d.files.map(f => (
    `    &.${f.fileName} {\n      mask-image: url('/${d.directory}/${f.fileName}.svg');\n    }`
  ));
  return [`    // ----------------------------------------\n    // ${d.directory}`, ...files];
}).flat().join('\n');

const createIconSCSSModuleFile = (svgData: SvgData[], outputPath: string) => {
  const scssLines = createScssLines(svgData);
  const iconScssFile = createIconStyleContent(scssLines);
  fs.writeFile(`.${outputPath}/Icon.module.scss`, iconScssFile, (err) => {
    if (err)
      console.log(err);
    else {
      console.log(`${c.g('🗸')} Icon.module.scss written successfully`);
    }
  });
};

// ----------------------------------------
// Icon.astro

const createIconAstroFilesContent = (svgData: string) => `${svgData}`;

const createIconAstroFiles = (svgData: SvgData[], outputPath: string) => {
  let writeCount = 0;
  const toWriteCount = svgData.map(s => s.files.length).reduce((a, b) => +a + +b);
  svgData.map(s => {
    createDirectoryIfNoneExists(`.${outputPath}/${s.directory}`);
    createDirectoryIfNoneExists(`.${outputPath}/${s.directory}/astro`);
    s.files.map(file => {
      const svgData = fs.readFileSync(`${file.path}`)
        .toString('utf8')
        .replace(/[\n\r\t\s]+/g, ' ')
        .replace(/width="([^"]+)"/, '')
        .replace(/height="([^"]+)"/, '')
        .replace('<svg ', `<svg style={{ width: 'var(--icon-size)', height: 'var(--icon-size)' }} `);
      const astroFile = createIconAstroFilesContent(svgData);
      fs.writeFile(`.${outputPath}/${s.directory}/astro/${file.fileName}.astro`, astroFile, (err) => {
        if (err)
          console.log(err);
        else {
          writeCount += 1;
          if (writeCount === toWriteCount) {
            console.log(`${c.g('🗸')} [Icon].astro files written successfully`);
          }
        }
      });
    });
  });
};

const createIconAstroFileContent = (fileImports: string, fileImportsObject: string, fileStyles: string) => (
`---
import type { Icons } from './Icons';

${fileImports}

interface Props {
  icon: Icons;
  color?: string;
  size?: number;
  id?: string;
  class?: string;
}

const { icon, color, size, id, class: className, ...rest } = Astro.props;

const icons: {[key in Icons]: any} = {
${fileImportsObject}
};

const Component = icons[icon];
---
  
<div
  class:list={[
    'icon',
    {
      isFlat: color,
      [icon]: color,
    },
    className
  ]}
  {...rest}
  style={{
    ['--icon-size' as string]: size,
    backgroundColor: color ? color : 'transparent'
  }}
  id={id}
>
  {!color && <Component />}
</div>

<style lang="scss">
${fileStyles}
</style>
`);
  
const createIconAstroFile = (svgData: SvgData[], outputPath: string, solo: boolean) => {
  // construct icon import list
  const fileImports = svgData.map(d => {
    const files = d.files.map(f => {
      const tsPath = outputPath.replace(`/src/components`, `@components`);
      const fileImportPath = `${tsPath}/${d.directory}/astro/${f.fileName}.astro`;
      return `import ${f.componentName} from '${fileImportPath}';`;
    });
    return [`// ${d.directory}`, ...files];
  }).flat().join('\n');
  // construct key/component object
  const fileImportsObject = svgData.map(d => {
    const files = d.files.map(f => {
      const propertyFileName = f.fileName.includes('-') ? `'${f.fileName}'` : f.fileName;
      return `  ${propertyFileName}: ${f.componentName},`;
    });
    return [`  // ${d.directory}`, ...files];
  }).flat().join('\n');

  const scssLines = createScssLines(svgData);
  const fileStyles = solo ? createIconStyleContent(scssLines) : `@import './Icon.module.scss';`;
  const iconTsxFile = createIconAstroFileContent(fileImports, fileImportsObject, fileStyles)

  fs.writeFile(`.${outputPath}/Icon.astro`, iconTsxFile, (err) => {
    if (err)
      console.log(err);
    else {
      console.log(`${c.g('🗸')} Icon.astro written successfully`);
    }
  });
};

// ----------------------------------------
// Plugin

type ComponentType = 'astro'|'tsx';

interface Props {
  inputPaths: string[];
  outputPath: string;
  include?: ComponentType[];
  exclude?: ComponentType[];
}

export default function svgToComponent({
  inputPaths,
  outputPath,
  include,
  exclude
}: Props): Plugin {
  // filter all svgs by `inputPaths`
  const allSvgs = import.meta.glob('/**/*.svg');
  const getGlobSvgData = () => inputPaths.map(glob => {
    const globSvgs = Object.keys(allSvgs).filter((svgPath: string) => svgPath.startsWith(glob));
    const globSvgData = getSvgData(globSvgs);
    return globSvgData;
  });

  const svgData = getGlobSvgData();

  const convertSvgToComponent = () => {
    logOnBuild();
    // TODO: make include/exclude logic cleaner
    const hasAstro = (include?.includes('astro') && !exclude?.includes('astro')) || false;
    const hasTsx =  (include?.includes('tsx') && !exclude?.includes('tsx')) || false;
    const doesntHaveAstro = exclude?.includes('astro') || false;
    const doesntHaveTsx = exclude?.includes('tsx') || false;
    const onlyAstro = include?.length === 1 && hasAstro;
    const onlyTsx = include?.length === 1 && hasTsx;
    const allowAll = (!include && !exclude) || (hasAstro && hasTsx);
    if (svgData) {
      createDirectoryIfNoneExists(`.${outputPath}`);
      createIconModelFile(svgData, outputPath);
      if ((allowAll || onlyTsx || !onlyAstro) && !doesntHaveTsx) {
        createIconSCSSModuleFile(svgData, outputPath);
      }
      if ((allowAll || hasTsx || !doesntHaveTsx) && !onlyAstro) {
        createIconTsxFiles(svgData, outputPath);
        createIconTsxFile(svgData, outputPath);
      }
      if ((allowAll || hasAstro || !doesntHaveAstro) && !onlyTsx) {
        createIconAstroFiles(svgData, outputPath);
        createIconAstroFile(svgData, outputPath, (onlyAstro || doesntHaveTsx) && !doesntHaveAstro);
      }
    }
  };

  convertSvgToComponent();

  return {
    name: pluginName, 
  }
};
