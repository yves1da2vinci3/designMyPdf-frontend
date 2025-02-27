export enum cssframeworkTypes {
  TAILWIND = 1,
  BOOTSTRAP = 2,
  UNKNOWN = -1,
}

export const cssframeworkTypesMapper = new Map();
cssframeworkTypesMapper.set(cssframeworkTypes.TAILWIND, 'Tailwind');
