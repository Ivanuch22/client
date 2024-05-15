const { NEXT_HOST } = process.env;

export const $ = (_: string) => _ === 'ua' ? 'uk' : _;
