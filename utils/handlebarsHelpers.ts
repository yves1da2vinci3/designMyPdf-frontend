import Handlebars from 'handlebars';

Handlebars.registerHelper('times', function (this: any, n, block) {
  if (!block || typeof block.fn !== 'function') {
    return '';
  }
  const num = typeof n === 'number' ? n : parseInt(n, 10);
  if (!isFinite(num) || num < 0) {
    return '';
  }
  let accum = '';
  for (let i = 0; i < num; ++i) {
    accum += block.fn(i, { data: { index: i } });
  }
  return accum;
});

Handlebars.registerHelper('lt', function (this: any, a: any, b: any, options: any) {
  if (!options || typeof options.fn !== 'function') {
    return '';
  }
  if (a < b) {
    return options.fn(this);
  }
  if (options.inverse && typeof options.inverse === 'function') {
    return options.inverse(this);
  }
  return '';
});

Handlebars.registerHelper('lte', function (this: any, a: any, b: any, options: any) {
  if (!options || typeof options.fn !== 'function') {
    return '';
  }
  if (a <= b) {
    return options.fn(this);
  }
  if (options.inverse && typeof options.inverse === 'function') {
    return options.inverse(this);
  }
  return '';
});

Handlebars.registerHelper('gt', function (this: any, a: any, b: any, options: any) {
  if (!options || typeof options.fn !== 'function') {
    return '';
  }
  if (a > b) {
    return options.fn(this);
  }
  if (options.inverse && typeof options.inverse === 'function') {
    return options.inverse(this);
  }
  return '';
});

Handlebars.registerHelper('gte', function (this: any, a: any, b: any, options: any) {
  if (!options || typeof options.fn !== 'function') {
    return '';
  }
  if (a >= b) {
    return options.fn(this);
  }
  if (options.inverse && typeof options.inverse === 'function') {
    return options.inverse(this);
  }
  return '';
});

Handlebars.registerHelper('eq', function (this: any, a: any, b: any, options: any) {
  if (!options || typeof options.fn !== 'function') {
    return '';
  }
  if (a === b) {
    return options.fn(this);
  }
  if (options.inverse && typeof options.inverse === 'function') {
    return options.inverse(this);
  }
  return '';
});

Handlebars.registerHelper('ne', function (this: any, a: any, b: any, options: any) {
  if (!options || typeof options.fn !== 'function') {
    return '';
  }
  if (a !== b) {
    return options.fn(this);
  }
  if (options.inverse && typeof options.inverse === 'function') {
    return options.inverse(this);
  }
  return '';
});

Handlebars.registerHelper('if_eq', function (this: any, a: any, b: any, c: any, d: any) {
  const len = arguments.length;
  let operator = 'eq';
  let options;

  if (len >= 5 && typeof arguments[len - 1] === 'object' && arguments[len - 1].fn) {
    options = arguments[len - 1];
    if (typeof arguments[3] === 'string') {
      operator = arguments[3];
    }
  } else if (len >= 4 && typeof arguments[len - 1] === 'object' && arguments[len - 1].fn) {
    options = arguments[len - 1];
  } else {
    return '';
  }

  if (!options || typeof options.fn !== 'function') {
    return '';
  }

  if (options.hash && options.hash.operator) {
    operator = options.hash.operator;
  }

  let result = false;
  switch (operator) {
    case 'eq':
      result = a === b;
      break;
    case 'ne':
      result = a !== b;
      break;
    case 'lt':
      result = a < b;
      break;
    case 'lte':
      result = a <= b;
      break;
    case 'gt':
      result = a > b;
      break;
    case 'gte':
      result = a >= b;
      break;
  }

  if (result) {
    return options.fn(this);
  }
  if (options.inverse && typeof options.inverse === 'function') {
    return options.inverse(this);
  }
  return '';
});

Handlebars.registerHelper('range', function (from: number, to: number) {
  const result: number[] = [];
  for (let i = from; i <= to; i++) {
    result.push(i);
  }
  return result;
});

Handlebars.registerHelper('eq', function (this: any, a: any, b: any, options: any) {
  if (!options || typeof options.fn !== 'function') {
    return a === b;
  }
  if (a === b) {
    return options.fn(this);
  }
  if (options.inverse && typeof options.inverse === 'function') {
    return options.inverse(this);
  }
  return '';
});
