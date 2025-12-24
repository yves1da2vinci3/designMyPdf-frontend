/**
 * Utilitaires pour l'extraction et la construction de variables Handlebars
 * Adapté depuis generate-template.ts
 */
import { faker } from '@faker-js/faker';

const CHART_TYPES = {
  line: 'line',
  bar: 'bar',
  pie: 'pie',
  doughnut: 'doughnut',
  radar: 'radar',
  polarArea: 'polarArea',
  bubble: 'bubble',
  scatter: 'scatter',
} as const;

function generateChartData(type: keyof typeof CHART_TYPES): { labels: string[]; datasets: any[] } {
  const labels = Array.from({ length: 6 }, () => faker.date.month());

  switch (type) {
    case 'line':
    case 'bar':
      return {
        labels,
        datasets: [
          {
            label: faker.commerce.department(),
            data: labels.map(() => faker.number.int({ min: 0, max: 100 })),
            borderColor: faker.color.rgb(),
            backgroundColor: faker.color.rgb(),
          },
        ],
      };
    case 'pie':
    case 'doughnut':
    case 'polarArea':
      return {
        labels: labels.slice(0, 4),
        datasets: [
          {
            data: Array.from({ length: 4 }, () => faker.number.int({ min: 10, max: 100 })),
            backgroundColor: Array.from({ length: 4 }, () => faker.color.rgb()),
          },
        ],
      };
    default:
      return {
        labels,
        datasets: [
          {
            label: faker.commerce.department(),
            data: labels.map(() => faker.number.int({ min: 0, max: 100 })),
          },
        ],
      };
  }
}

export function extractVariablesFromTemplate(
  template: string,
): Map<
  string,
  { type: 'array' | 'object' | 'value'; path: string[]; arrayItemStructure?: Record<string, any> }
> {
  const variables = new Map<
    string,
    { type: 'array' | 'object' | 'value'; path: string[]; arrayItemStructure?: Record<string, any> }
  >();

  const eachBlockRegex = /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g;
  let eachMatch;

  while ((eachMatch = eachBlockRegex.exec(template)) !== null) {
    const arrayName = eachMatch[1];
    const blockContent = eachMatch[2];
    const itemProps = new Set<string>();

    const thisRegex = /{{this\.(\w+)}}/g;
    let propMatch;

    while ((propMatch = thisRegex.exec(blockContent)) !== null) {
      itemProps.add(propMatch[1]);
    }

    const arrayItemStructure = Array.from(itemProps).reduce(
      (obj, prop) => {
        obj[prop] = getExampleValue(prop);
        return obj;
      },
      {} as Record<string, any>,
    );

    variables.set(arrayName, {
      type: 'array',
      path: [arrayName],
      arrayItemStructure,
    });
  }

  const variableRegex = /\{\{(?!#|\/|else)([^}]+)\}\}/g;
  let match;

  while ((match = variableRegex.exec(template)) !== null) {
    const content = match[1].trim();

    if (
      !(content.startsWith('if ') || content.startsWith('unless ') || content.includes('this.'))
    ) {
      const rawVariable = content.split(/\s/)[0];

      if (rawVariable) {
        const varPath = rawVariable.split('.');
        const rootVar = varPath[0];

        if (!variables.has(rootVar)) {
          if (varPath.length > 1) {
            variables.set(rootVar, { type: 'object', path: [rootVar] });
          } else {
            variables.set(rootVar, { type: 'value', path: [rootVar] });
          }
        }

        if (varPath.length > 1 && !variables.has(rawVariable)) {
          variables.set(rawVariable, { type: 'value', path: varPath });
        }
      }
    }
  }

  return variables;
}

function getExampleValue(prop: string): any {
  const propLower = prop.toLowerCase().replace(/[_\s-]/g, '');

  if (propLower.includes('firstname') || propLower.includes('fname')) {
    return faker.person.firstName();
  }
  if (
    propLower.includes('lastname') ||
    propLower.includes('lname') ||
    propLower.includes('surname')
  ) {
    return faker.person.lastName();
  }
  if (
    propLower.includes('fullname') ||
    propLower.includes('name') ||
    propLower.includes('author') ||
    propLower.includes('client')
  ) {
    return faker.person.fullName();
  }
  if (
    propLower.includes('jobtitle') ||
    propLower.includes('position') ||
    propLower.includes('role')
  ) {
    return faker.person.jobTitle();
  }
  if (propLower.includes('email') || propLower.includes('mail')) {
    return faker.internet.email();
  }
  if (
    propLower.includes('phone') ||
    propLower.includes('tel') ||
    propLower.includes('mobile') ||
    propLower.includes('contact')
  ) {
    return faker.phone.number();
  }
  if (propLower.includes('address')) return faker.location.streetAddress();
  if (propLower.includes('street') || propLower.includes('road') || propLower.includes('avenue')) {
    return faker.location.street();
  }
  if (propLower.includes('city') || propLower.includes('town')) {
    return faker.location.city();
  }
  if (propLower.includes('country') || propLower.includes('nation')) {
    return faker.location.country();
  }
  if (
    propLower.includes('state') ||
    propLower.includes('province') ||
    propLower.includes('region')
  ) {
    return faker.location.state();
  }
  if (propLower.includes('zipcode') || propLower.includes('zip') || propLower.includes('postal')) {
    return faker.location.zipCode();
  }
  if (
    propLower.includes('company') ||
    propLower.includes('organization') ||
    propLower.includes('business')
  ) {
    return faker.company.name();
  }
  if (
    propLower.includes('price') ||
    propLower.includes('unitprice') ||
    propLower.includes('cost')
  ) {
    return Number(faker.commerce.price());
  }
  if (
    propLower.includes('amount') &&
    !propLower.includes('qty') &&
    !propLower.includes('quantity')
  ) {
    return Number(faker.commerce.price());
  }
  if (
    propLower.includes('product') ||
    propLower.includes('item') ||
    propLower.includes('service')
  ) {
    return faker.commerce.productName();
  }
  if (
    propLower.includes('description') ||
    propLower.includes('details') ||
    propLower.includes('notes')
  ) {
    return faker.commerce.productDescription();
  }
  if (
    propLower.includes('quantity') ||
    propLower.includes('qty') ||
    propLower.includes('count') ||
    propLower.includes('units')
  ) {
    return faker.number.int({ min: 1, max: 100 });
  }
  if (
    propLower.includes('total') ||
    propLower.includes('subtotal') ||
    propLower.includes('grandtotal') ||
    propLower.includes('sum')
  ) {
    return Number(faker.commerce.price({ min: 100, max: 1000 }));
  }
  if (propLower.includes('tax') || propLower.includes('vat') || propLower.includes('gst')) {
    return Number(faker.commerce.price({ min: 0, max: 100 }));
  }
  if (
    propLower.includes('discount') ||
    propLower.includes('rebate') ||
    propLower.includes('reduction')
  ) {
    return Number(faker.commerce.price({ min: 0, max: 50 }));
  }
  if (propLower.includes('currency') || propLower.includes('currencycode')) {
    return faker.finance.currencyCode();
  }
  if (
    propLower.includes('issuedate') ||
    propLower.includes('createdate') ||
    propLower.includes('startdate')
  ) {
    return faker.date.recent({ days: 30 }).toISOString().split('T')[0];
  }
  if (
    propLower.includes('duedate') ||
    propLower.includes('enddate') ||
    propLower.includes('expirydate')
  ) {
    return faker.date.soon({ days: 30 }).toISOString().split('T')[0];
  }
  if (propLower.includes('date')) {
    return faker.date.recent().toISOString().split('T')[0];
  }
  if (propLower.includes('year')) {
    return faker.date.past().getFullYear();
  }
  if (propLower.includes('month')) return faker.date.month();
  if (propLower.includes('invoicenumber') || propLower.includes('invoice_number')) {
    return `INV-${faker.number.int({ min: 10000, max: 99999 })}`;
  }
  if (propLower.includes('ordernumber') || propLower.includes('order_number')) {
    return `ORD-${faker.number.int({ min: 10000, max: 99999 })}`;
  }
  if (propLower.includes('id')) return faker.string.alphanumeric(8).toUpperCase();
  if (propLower.includes('reference')) return faker.string.alphanumeric(10).toUpperCase();
  if (propLower.includes('number')) return faker.number.int({ min: 1000, max: 9999 });
  if (
    propLower.includes('title') ||
    propLower.includes('heading') ||
    propLower.includes('header')
  ) {
    return faker.lorem.sentence();
  }
  if (propLower.includes('subtitle') || propLower.includes('subheading')) {
    return faker.lorem.sentence();
  }
  if (
    propLower.includes('summary') ||
    propLower.includes('abstract') ||
    propLower.includes('overview')
  ) {
    return faker.lorem.paragraph();
  }
  if (propLower.includes('content') || propLower.includes('body') || propLower.includes('text')) {
    return faker.lorem.paragraphs();
  }
  if (
    propLower.includes('image') ||
    propLower.includes('picture') ||
    propLower.includes('photo') ||
    propLower.includes('avatar')
  ) {
    return faker.image.url();
  }
  if (propLower.includes('url') || propLower.includes('link') || propLower.includes('website')) {
    return faker.internet.url();
  }
  if (
    propLower.startsWith('is') ||
    propLower.startsWith('has') ||
    propLower.startsWith('show') ||
    propLower.includes('enabled') ||
    propLower.includes('visible')
  ) {
    return faker.datatype.boolean();
  }
  if (propLower.includes('status') || propLower.includes('state')) {
    return faker.helpers.arrayElement(['Active', 'Pending', 'Completed', 'Cancelled']);
  }
  if (propLower.includes('type') || propLower.includes('category') || propLower.includes('kind')) {
    return faker.helpers.arrayElement(['Type A', 'Type B', 'Type C']);
  }
  if (propLower.includes('color') || propLower.includes('colour')) {
    return faker.color.human();
  }
  if (
    propLower.includes('comment') ||
    propLower.includes('message') ||
    propLower.includes('feedback')
  ) {
    return faker.lorem.sentence();
  }

  return faker.lorem.word();
}

export function buildVariableStructure(
  variables: Map<
    string,
    { type: 'array' | 'object' | 'value'; path: string[]; arrayItemStructure?: Record<string, any> }
  >,
  template?: string,
): Record<string, any> {
  const structure: Record<string, any> = {};

  // First pass: Create base structure
  for (const [key, value] of Array.from(variables.entries())) {
    if (value.path.length === 1) {
      if (value.type === 'array') {
        const itemCount = faker.number.int({ min: 2, max: 4 });
        structure[key] = Array.from({ length: itemCount }, () => {
          const baseItem = value.arrayItemStructure || {};
          return Object.entries(baseItem).reduce(
            (obj, [prop]) => {
              obj[prop] = getExampleValue(prop);
              return obj;
            },
            {} as Record<string, any>,
          );
        });
      } else if (value.type === 'object') {
        structure[key] = {};
      } else {
        structure[key] = getExampleValue(key);
      }
    }
  }

  // Second pass: Fill in nested values
  for (const [, value] of Array.from(variables.entries())) {
    if (value.path.length > 1) {
      let current = structure;
      for (const segment of value.path.slice(0, -1)) {
        if (!current[segment]) {
          current[segment] = {};
        }
        current = current[segment];
      }
      current[value.path[value.path.length - 1]] = getExampleValue(
        value.path[value.path.length - 1],
      );
    }
  }

  if (template) {
    const chartRegex = /data-chart-type=["'](\w+)["']\s+data-chart-data=["']{{charts\.(\w+)}}["']/g;
    let chartMatch;
    const detectedCharts = new Map<string, string>();

    while ((chartMatch = chartRegex.exec(template)) !== null) {
      const chartType = chartMatch[1];
      const chartName = chartMatch[2];
      detectedCharts.set(chartName, chartType);
    }

    if (detectedCharts.size > 0 || variables.has('charts')) {
      structure.charts = structure.charts || {};

      Array.from(detectedCharts.entries()).forEach(([chartName, chartType]) => {
        if (chartType && CHART_TYPES[chartType as keyof typeof CHART_TYPES]) {
          structure.charts[chartName] = generateChartData(chartType as keyof typeof CHART_TYPES);
        }
      });

      if (Object.keys(structure.charts).length === 0 && variables.has('charts')) {
        structure.charts.salesChart = generateChartData('bar');
        structure.charts.statsChart = generateChartData('pie');
      }
    }
  }

  return structure;
}
