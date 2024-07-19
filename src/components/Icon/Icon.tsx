import type { FC } from 'react';
import type { Icons } from './Icons';

import cn from 'classnames';
import s from './Icon.module.scss';

// icons
import { MoonIcon } from '@components/Icon/icons/tsx/moon';
import { SunIcon } from '@components/Icon/icons/tsx/sun';
// logos
import { AstroIcon } from '@components/Icon/logos/tsx/astro';
import { ReactIcon } from '@components/Icon/logos/tsx/react';
import { TypescriptIcon } from '@components/Icon/logos/tsx/typescript';
import { ViteIcon } from '@components/Icon/logos/tsx/vite';

const icons: {[key in Icons]: () => JSX.Element} = {
  // icons
  moon: MoonIcon,
  sun: SunIcon,
  // logos
  astro: AstroIcon,
  react: ReactIcon,
  typescript: TypescriptIcon,
  vite: ViteIcon,
};

interface Props {
  icon: Icons;
  color?: string;
  size?: number;
  id?: string;
}

export const Icon: FC<Props> = ({
  icon,
  color,
  size = 16,
  id,
}) => {
  const SvgIcon = icons[icon];
  return (
    <div
      className={cn(
        s.icon,
        color && s.isFlat,
        color && s[icon]
      )}
      style={{
        ['--icon-size' as string]: size,
        backgroundColor: color ? `${color}` : 'transparent'
      }}
      id={id}
    >
      {!color && <SvgIcon />}
    </div>
  );
};
