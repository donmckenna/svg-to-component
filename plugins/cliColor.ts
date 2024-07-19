const consoleColor = () => {
  //@ts-ignore
  const { r, g, b, w, c, m, y, k, gr } = [
    ['r', 1], ['g', 2], ['b', 4], ['w', 7],
    ['c', 6], ['m', 5], ['y', 3], ['k', 0],
    ['gr', 0],
  ].reduce((cols, col) => ({
    //@ts-ignore
    ...cols,  [col[0]]: f => f === 'gr' ? `\x1b[90m${f}\x1b[0m` : `\x1b[3${col[1]}m${f}\x1b[0m`
  }), {});
  return { r, g, b, w, c, m, y, k, gr };
};

export const c = {
  r: consoleColor().r,
  g: consoleColor().g,
  b: consoleColor().b,
  w: consoleColor().w,
  c: consoleColor().c,
  m: consoleColor().m,
  y: consoleColor().y,
  k: consoleColor().k,
  gr: consoleColor().gr,
};
