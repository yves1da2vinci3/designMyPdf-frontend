/**
 * Bibliothèque de templates de référence (Few-Shot) pour la génération de templates PDF
 */
import type { ReferenceTemplate, TemplatePlan } from './types';

/**
 * Templates de référence optimisés pour le rendu PDF
 */
export const REFERENCE_TEMPLATES: ReferenceTemplate[] = [
  {
    id: 'invoice-minimalist-blue',
    name: 'Facture Minimaliste Bleue',
    type: 'invoice',
    code: `<div class="mx-auto bg-white">
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-blue-600 mb-2">{{companyName}}</h1>
        <p class="text-sm text-gray-600">{{companyAddress}}</p>
      </div>
      <div class="text-right">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">INVOICE</h2>
        <p class="text-sm text-gray-600">Invoice #: {{invoiceNumber}}</p>
        <p class="text-sm text-gray-600">Date: {{invoiceDate}}</p>
      </div>
    </div>
    
    <div class="mb-8">
      <div class="grid grid-cols-2 mb-4">
        <div>
          <p class="text-sm font-semibold text-gray-700 mb-2">Bill To:</p>
          <p class="text-sm text-gray-600">{{clientName}}</p>
          <p class="text-sm text-gray-600">{{clientAddress}}</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-700 mb-2">Payment Terms:</p>
          <p class="text-sm text-gray-600">{{paymentTerms}}</p>
        </div>
      </div>
    </div>
    
    <table class="w-full mb-6">
      <thead>
        <tr class="border-b-2 border-gray-300">
          <th class="text-left py-3 text-sm font-semibold text-gray-700">Description</th>
          <th class="text-right py-3 text-sm font-semibold text-gray-700">Quantity</th>
          <th class="text-right py-3 text-sm font-semibold text-gray-700">Price</th>
          <th class="text-right py-3 text-sm font-semibold text-gray-700">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr class="border-b border-gray-200">
          <td class="py-3 text-sm text-gray-700">{{this.description}}</td>
          <td class="py-3 text-sm text-right text-gray-600">{{this.quantity}}</td>
          <td class="py-3 text-sm text-right text-gray-600">{{this.price}}</td>
          <td class="py-3 text-sm text-right text-gray-900 font-semibold">{{this.total}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="py-3 text-right text-sm font-semibold text-gray-700">Subtotal:</td>
          <td class="py-3 text-right text-sm font-semibold text-gray-900">{{subtotal}}</td>
        </tr>
        <tr>
          <td colspan="3" class="py-3 text-right text-sm font-semibold text-gray-700">Tax:</td>
          <td class="py-3 text-right text-sm font-semibold text-gray-900">{{tax}}</td>
        </tr>
        <tr class="bg-blue-50">
          <td colspan="3" class="py-4 text-right text-base font-bold text-blue-600">Total:</td>
          <td class="py-4 text-right text-base font-bold text-blue-600">{{total}}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>`,
    metadata: {
      colors: ['blue-600', 'gray-900', 'gray-600', 'blue-50'],
      style: 'minimalist',
      complexity: 'simple',
    },
    variables: [
      'companyName',
      'companyAddress',
      'invoiceNumber',
      'invoiceDate',
      'clientName',
      'clientAddress',
      'paymentTerms',
      'items',
      'subtotal',
      'tax',
      'total',
    ],
  },
  {
    id: 'invoice-modern-gradient',
    name: 'Facture Moderne avec Dégradés',
    type: 'invoice',
    code: `<div class="bg-gradient-to-br from-indigo-50 to-blue-50 min-h-screen">
  <div class="max-w-4xl mx-auto bg-white shadow-lg">
    <div class="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
      <h1 class="text-4xl font-bold mb-2">{{companyName}}</h1>
      <p class="text-indigo-100">{{companyAddress}}</p>
    </div>
    
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Invoice</h2>
          <p class="text-gray-600 mt-2">#{{invoiceNumber}}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-600">Date: {{invoiceDate}}</p>
          <p class="text-sm text-gray-600">Due: {{dueDate}}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-2 mb-8">
        <div>
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Bill To:</h3>
          <p class="text-sm text-gray-600">{{clientName}}</p>
          <p class="text-sm text-gray-600">{{clientAddress}}</p>
        </div>
      </div>
      
      <div class="mb-8">
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item</th>
              <th class="text-right py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
              <th class="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
              <th class="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr class="border-b border-gray-200">
              <td class="py-3 px-4 text-sm text-gray-700">{{this.name}}</td>
              <td class="py-3 px-4 text-sm text-right text-gray-600">{{this.quantity}}</td>
              <td class="py-3 px-4 text-sm text-right text-gray-600">{{this.price}}</td>
              <td class="py-3 px-4 text-sm text-right text-gray-900 font-semibold">{{this.amount}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
      
      <div class="flex justify-end">
        <div class="w-64">
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="text-sm text-gray-600">Subtotal</span>
            <span class="text-sm font-semibold text-gray-900">{{subtotal}}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="text-sm text-gray-600">Tax</span>
            <span class="text-sm font-semibold text-gray-900">{{tax}}</span>
          </div>
          <div class="flex justify-between py-4">
            <span class="text-lg font-bold text-indigo-600">Total</span>
            <span class="text-lg font-bold text-indigo-600">{{total}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
    metadata: {
      colors: ['indigo-600', 'blue-600', 'gray-900', 'gray-600'],
      style: 'modern',
      complexity: 'medium',
    },
    variables: [
      'companyName',
      'companyAddress',
      'invoiceNumber',
      'invoiceDate',
      'dueDate',
      'clientName',
      'clientAddress',
      'items',
      'subtotal',
      'tax',
      'total',
    ],
  },
  {
    id: 'resume-classic',
    name: 'CV Classique',
    type: 'resume',
    code: `<div class="max-w-4xl mx-auto bg-white p-8">
  <header class="mb-8 border-b-2 border-gray-300 pb-6">
    <h1 class="text-4xl font-bold text-gray-900 mb-2">{{fullName}}</h1>
    <p class="text-lg text-gray-600">{{jobTitle}}</p>
    <div class="mt-4 text-sm text-gray-600">
      <p>{{email}} | {{phone}}</p>
      <p>{{address}}</p>
    </div>
  </header>
  
  <section class="mb-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Professional Summary</h2>
    <p class="text-sm text-gray-700 leading-relaxed">{{summary}}</p>
  </section>
  
  <section class="mb-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Experience</h2>
    {{#each experience}}
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-semibold text-gray-900">{{this.title}}</h3>
        <span class="text-sm text-gray-600">{{this.period}}</span>
      </div>
      <p class="text-sm font-medium text-gray-700 mb-1">{{this.company}} - {{this.location}}</p>
      <ul class="list-disc list-inside text-sm text-gray-600 ml-4">
        {{#each this.responsibilities}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    {{/each}}
  </section>
  
  <section class="mb-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Education</h2>
    {{#each education}}
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900">{{this.degree}}</h3>
      <p class="text-sm text-gray-700">{{this.school}} - {{this.year}}</p>
    </div>
    {{/each}}
  </section>
  
  <section class="mb-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Skills</h2>
    <div class="flex flex-wrap">
      {{#each skills}}
      <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded mr-2 mb-2 text-sm">{{this}}</span>
      {{/each}}
    </div>
  </section>
</div>`,
    metadata: {
      colors: ['gray-900', 'gray-600', 'gray-700'],
      style: 'classic',
      complexity: 'medium',
    },
    variables: [
      'fullName',
      'jobTitle',
      'email',
      'phone',
      'address',
      'summary',
      'experience',
      'education',
      'skills',
    ],
  },
  {
    id: 'report-dashboard',
    name: 'Rapport avec Graphiques',
    type: 'report',
    code: `<div class="bg-white p-8">
  <header class="mb-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-2">{{reportTitle}}</h1>
    <p class="text-lg text-gray-600">{{reportSubtitle}}</p>
    <p class="text-sm text-gray-500 mt-2">Generated: {{reportDate}}</p>
  </header>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
    <div class="bg-gray-50 p-6 rounded-lg">
      <p class="text-sm text-gray-700 leading-relaxed">{{executiveSummary}}</p>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Key Metrics</h2>
    <div class="grid grid-cols-3 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg text-center">
        <p class="text-3xl font-bold text-blue-600 mb-2">{{metric1.value}}</p>
        <p class="text-sm text-gray-600">{{metric1.label}}</p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg text-center">
        <p class="text-3xl font-bold text-green-600 mb-2">{{metric2.value}}</p>
        <p class="text-sm text-gray-600">{{metric2.label}}</p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg text-center">
        <p class="text-3xl font-bold text-purple-600 mb-2">{{metric3.value}}</p>
        <p class="text-sm text-gray-600">{{metric3.label}}</p>
      </div>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Charts</h2>
    <div class="mb-6">
      <canvas id="chart1" data-chart-type="bar" data-chart-data='{{charts.salesChart}}'></canvas>
    </div>
    <div class="mb-6">
      <canvas id="chart2" data-chart-type="pie" data-chart-data='{{charts.distributionChart}}'></canvas>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Detailed Analysis</h2>
    <div class="space-y-4">
      {{#each analysis}}
      <div class="border-l-4 border-blue-500 pl-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{this.title}}</h3>
        <p class="text-sm text-gray-700">{{this.content}}</p>
      </div>
      {{/each}}
    </div>
  </section>
  
  <footer class="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
    <p>{{footerText}}</p>
  </footer>
</div>`,
    metadata: {
      colors: ['blue-600', 'green-600', 'purple-600', 'gray-900'],
      style: 'dashboard',
      complexity: 'complex',
    },
    variables: [
      'reportTitle',
      'reportSubtitle',
      'reportDate',
      'executiveSummary',
      'metric1',
      'metric2',
      'metric3',
      'charts',
      'analysis',
      'footerText',
    ],
  },
  {
    id: 'invoice-detailed',
    name: 'Facture Détaillée avec Tableaux',
    type: 'invoice',
    code: `<div class="bg-white">
  <div class="p-8">
    <div class="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-300">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{companyName}}</h1>
        <p class="text-sm text-gray-600">{{companyAddress}}</p>
        <p class="text-sm text-gray-600">{{companyPhone}}</p>
        <p class="text-sm text-gray-600">{{companyEmail}}</p>
      </div>
      <div class="text-right">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">INVOICE</h2>
        <table class="text-sm text-left">
          <tr>
            <td class="pr-4 text-gray-600">Invoice #:</td>
            <td class="font-semibold text-gray-900">{{invoiceNumber}}</td>
          </tr>
          <tr>
            <td class="pr-4 text-gray-600">Date:</td>
            <td class="font-semibold text-gray-900">{{invoiceDate}}</td>
          </tr>
          <tr>
            <td class="pr-4 text-gray-600">Due Date:</td>
            <td class="font-semibold text-gray-900">{{dueDate}}</td>
          </tr>
          <tr>
            <td class="pr-4 text-gray-600">PO Number:</td>
            <td class="font-semibold text-gray-900">{{poNumber}}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div class="grid grid-cols-2 mb-8">
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Bill To:</h3>
        <p class="text-sm text-gray-900 font-semibold">{{clientName}}</p>
        <p class="text-sm text-gray-600">{{clientAddress}}</p>
        <p class="text-sm text-gray-600">{{clientCity}}, {{clientState}} {{clientZip}}</p>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Ship To:</h3>
        <p class="text-sm text-gray-900 font-semibold">{{shipToName}}</p>
        <p class="text-sm text-gray-600">{{shipToAddress}}</p>
        <p class="text-sm text-gray-600">{{shipToCity}}, {{shipToState}} {{shipToZip}}</p>
      </div>
    </div>
    
    <div class="mb-8">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 py-3 px-4 text-left text-sm font-semibold text-gray-700">Item</th>
            <th class="border border-gray-300 py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
            <th class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-700">Qty</th>
            <th class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-700">Unit Price</th>
            <th class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-700">Total</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td class="border border-gray-300 py-3 px-4 text-sm text-gray-900">{{this.item}}</td>
            <td class="border border-gray-300 py-3 px-4 text-sm text-gray-600">{{this.description}}</td>
            <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-600">{{this.quantity}}</td>
            <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-600">{{this.unitPrice}}</td>
            <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-900 font-semibold">{{this.total}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
    
    <div class="flex justify-end mb-8">
      <div class="w-80">
        <table class="w-full">
          <tr>
            <td class="py-2 text-right text-sm text-gray-600">Subtotal:</td>
            <td class="py-2 text-right text-sm font-semibold text-gray-900 pl-4">{{subtotal}}</td>
          </tr>
          <tr>
            <td class="py-2 text-right text-sm text-gray-600">Tax ({{taxRate}}%):</td>
            <td class="py-2 text-right text-sm font-semibold text-gray-900 pl-4">{{tax}}</td>
          </tr>
          <tr>
            <td class="py-2 text-right text-sm text-gray-600">Shipping:</td>
            <td class="py-2 text-right text-sm font-semibold text-gray-900 pl-4">{{shipping}}</td>
          </tr>
          <tr class="border-t-2 border-gray-300">
            <td class="py-3 text-right text-base font-bold text-gray-900">Total:</td>
            <td class="py-3 text-right text-base font-bold text-gray-900 pl-4">{{total}}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div class="mt-8 pt-6 border-t border-gray-200">
      <h3 class="text-sm font-semibold text-gray-700 mb-2">Payment Terms:</h3>
      <p class="text-sm text-gray-600">{{paymentTerms}}</p>
    </div>
  </div>
</div>`,
    metadata: {
      colors: ['gray-900', 'gray-600', 'gray-300'],
      style: 'detailed',
      complexity: 'complex',
    },
    variables: [
      'companyName',
      'companyAddress',
      'companyPhone',
      'companyEmail',
      'invoiceNumber',
      'invoiceDate',
      'dueDate',
      'poNumber',
      'clientName',
      'clientAddress',
      'clientCity',
      'clientState',
      'clientZip',
      'shipToName',
      'shipToAddress',
      'shipToCity',
      'shipToState',
      'shipToZip',
      'items',
      'subtotal',
      'taxRate',
      'tax',
      'shipping',
      'total',
      'paymentTerms',
    ],
  },
];

/**
 * Trouve le template de référence le plus proche basé sur le plan
 */
export function findClosestTemplate(plan: TemplatePlan): ReferenceTemplate | null {
  // Filtrer par type de document
  const sameType = REFERENCE_TEMPLATES.filter((t) => t.type === plan.documentType);

  if (sameType.length === 0) {
    // Si aucun template du même type, retourner le premier disponible
    return REFERENCE_TEMPLATES[0] || null;
  }

  // Score de similarité basé sur les couleurs et la complexité
  let bestMatch = sameType[0];
  let bestScore = 0;

  for (const template of sameType) {
    let score = 0;

    // Score basé sur les couleurs communes
    const planColors = Object.values(plan.colorPalette);
    const commonColors = template.metadata.colors.filter((c) =>
      planColors.some((pc) => pc.includes(c.split('-')[0])),
    );
    score += commonColors.length * 10;

    // Score basé sur le nombre de sections (complexité)
    if (template.metadata.complexity === 'simple' && plan.sections.length <= 3) {
      score += 5;
    } else if (template.metadata.complexity === 'medium' && plan.sections.length <= 5) {
      score += 5;
    } else if (template.metadata.complexity === 'complex' && plan.sections.length > 5) {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  return bestMatch;
}

/**
 * Récupère un template par son ID
 */
export function getTemplateById(id: string): ReferenceTemplate | null {
  return REFERENCE_TEMPLATES.find((t) => t.id === id) || null;
}
