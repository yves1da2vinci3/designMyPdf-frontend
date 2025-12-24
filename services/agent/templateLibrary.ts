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
  {
    id: 'proposal-business',
    name: 'Proposition Commerciale',
    type: 'other',
    code: `<div class="bg-white">
  <div class="p-8">
    <header class="mb-8 pb-6 border-b-2 border-blue-700">
      <h1 class="text-4xl font-bold text-blue-700 mb-2">{{companyName}}</h1>
      <p class="text-lg text-gray-600">{{proposalTitle}}</p>
      <p class="text-sm text-gray-500 mt-2">Date: {{proposalDate}} | Valid until: {{validUntil}}</p>
    </header>
    
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
      <div class="bg-blue-50 p-6 rounded-lg">
        <p class="text-sm text-gray-700 leading-relaxed">{{executiveSummary}}</p>
      </div>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Services</h2>
      <div class="space-y-4">
        {{#each services}}
        <div class="border-l-4 border-blue-700 pl-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{this.name}}</h3>
          <p class="text-sm text-gray-600 mb-2">{{this.description}}</p>
          <ul class="list-disc list-inside text-sm text-gray-600 ml-4">
            {{#each this.features}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
        </div>
        {{/each}}
      </div>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Investment</h2>
      <div class="bg-gray-50 p-6 rounded-lg">
        <table class="w-full mb-4">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="text-left py-2 text-sm font-semibold text-gray-700">Service</th>
              <th class="text-right py-2 text-sm font-semibold text-gray-700">Price</th>
            </tr>
          </thead>
          <tbody>
            {{#each pricing}}
            <tr class="border-b border-gray-200">
              <td class="py-2 text-sm text-gray-700">{{this.service}}</td>
              <td class="py-2 text-sm text-right text-gray-900 font-semibold">{{this.price}}</td>
            </tr>
            {{/each}}
          </tbody>
          <tfoot>
            <tr class="bg-blue-700 text-white">
              <td class="py-3 text-left text-base font-bold">Total Investment</td>
              <td class="py-3 text-right text-base font-bold">{{totalPrice}}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Timeline</h2>
      <div class="space-y-3">
        {{#each timeline}}
        <div class="flex items-start">
          <div class="flex-shrink-0 w-3 h-3 bg-blue-700 rounded-full mt-2 mr-4"></div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900">{{this.phase}}</h3>
            <p class="text-sm text-gray-600">{{this.duration}}</p>
            <p class="text-sm text-gray-500">{{this.description}}</p>
          </div>
        </div>
        {{/each}}
      </div>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Terms & Conditions</h2>
      <div class="bg-gray-50 p-6 rounded-lg">
        <ul class="list-disc list-inside text-sm text-gray-700 space-y-2">
          {{#each terms}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
    </section>
    
    <footer class="mt-8 pt-6 border-t border-gray-200">
      <p class="text-sm text-gray-600">{{contactInfo}}</p>
      <p class="text-sm text-gray-600 mt-2">{{signature}}</p>
    </footer>
  </div>
</div>`,
    metadata: {
      colors: ['blue-700', 'gray-900', 'gray-600', 'blue-50'],
      style: 'business',
      complexity: 'medium',
    },
    variables: [
      'companyName',
      'proposalTitle',
      'proposalDate',
      'validUntil',
      'executiveSummary',
      'services',
      'pricing',
      'totalPrice',
      'timeline',
      'terms',
      'contactInfo',
      'signature',
    ],
  },
  {
    id: 'quote-estimate',
    name: 'Devis/Estimation',
    type: 'other',
    code: `<div class="bg-white p-8">
  <div class="mb-8 pb-6 border-b-2 border-teal-600">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-teal-600 mb-2">{{companyName}}</h1>
        <p class="text-sm text-gray-600">{{companyAddress}}</p>
        <p class="text-sm text-gray-600">{{companyPhone}} | {{companyEmail}}</p>
      </div>
      <div class="text-right">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">QUOTE</h2>
        <p class="text-sm text-gray-600">Quote #: {{quoteNumber}}</p>
        <p class="text-sm text-gray-600">Date: {{quoteDate}}</p>
      </div>
    </div>
  </div>
  
  <div class="mb-8">
    <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Client Information</h3>
    <div class="bg-gray-50 p-4 rounded">
      <p class="text-sm text-gray-900 font-semibold">{{clientName}}</p>
      <p class="text-sm text-gray-600">{{clientAddress}}</p>
      <p class="text-sm text-gray-600">{{clientCity}}, {{clientState}} {{clientZip}}</p>
      <p class="text-sm text-gray-600">{{clientEmail}}</p>
    </div>
  </div>
  
  <div class="mb-8">
    <h3 class="text-sm font-semibold text-gray-700 mb-4 uppercase">Items</h3>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-teal-600 text-white">
          <th class="border border-teal-700 py-3 px-4 text-left text-sm font-semibold">Description</th>
          <th class="border border-teal-700 py-3 px-4 text-right text-sm font-semibold">Quantity</th>
          <th class="border border-teal-700 py-3 px-4 text-right text-sm font-semibold">Unit Price</th>
          <th class="border border-teal-700 py-3 px-4 text-right text-sm font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td class="border border-gray-300 py-3 px-4 text-sm text-gray-700">{{this.description}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-600">{{this.quantity}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-600">{{this.unitPrice}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-900 font-semibold">{{this.total}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-700">Subtotal</td>
          <td class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-900">{{subtotal}}</td>
        </tr>
        <tr>
          <td colspan="3" class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-700">Tax ({{taxRate}}%)</td>
          <td class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-900">{{tax}}</td>
        </tr>
        <tr class="bg-teal-50">
          <td colspan="3" class="border border-teal-300 py-4 px-4 text-right text-base font-bold text-teal-700">Total</td>
          <td class="border border-teal-300 py-4 px-4 text-right text-base font-bold text-teal-700">{{total}}</td>
        </tr>
      </tfoot>
    </table>
  </div>
  
  <div class="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
    <p class="text-sm text-yellow-800">
      <span class="font-semibold">Validity Period:</span> This quote is valid until {{validUntil}}
    </p>
  </div>
  
  <div class="mt-8 pt-6 border-t border-gray-200">
    <p class="text-sm text-gray-600">{{notes}}</p>
  </div>
</div>`,
    metadata: {
      colors: ['teal-600', 'gray-700', 'white', 'teal-50'],
      style: 'professional',
      complexity: 'simple',
    },
    variables: [
      'companyName',
      'companyAddress',
      'companyPhone',
      'companyEmail',
      'quoteNumber',
      'quoteDate',
      'clientName',
      'clientAddress',
      'clientCity',
      'clientState',
      'clientZip',
      'clientEmail',
      'items',
      'subtotal',
      'taxRate',
      'tax',
      'total',
      'validUntil',
      'notes',
    ],
  },
  {
    id: 'purchase-order',
    name: 'Bon de Commande',
    type: 'other',
    code: `<div class="bg-white p-8">
  <header class="mb-8 pb-6 border-b-2 border-indigo-700">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-indigo-700 mb-2">{{companyName}}</h1>
        <p class="text-sm text-gray-600">{{companyAddress}}</p>
      </div>
      <div class="text-right">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">PURCHASE ORDER</h2>
        <table class="text-sm text-left">
          <tr>
            <td class="pr-4 text-gray-600">PO Number:</td>
            <td class="font-semibold text-gray-900">{{poNumber}}</td>
          </tr>
          <tr>
            <td class="pr-4 text-gray-600">Date:</td>
            <td class="font-semibold text-gray-900">{{poDate}}</td>
          </tr>
          <tr>
            <td class="pr-4 text-gray-600">Required Date:</td>
            <td class="font-semibold text-gray-900">{{requiredDate}}</td>
          </tr>
        </table>
      </div>
    </div>
  </header>
  
  <div class="grid grid-cols-2 mb-8">
    <div class="mr-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Supplier</h3>
      <div class="bg-gray-50 p-4 rounded">
        <p class="text-sm text-gray-900 font-semibold">{{supplierName}}</p>
        <p class="text-sm text-gray-600">{{supplierAddress}}</p>
        <p class="text-sm text-gray-600">{{supplierCity}}, {{supplierState}} {{supplierZip}}</p>
        <p class="text-sm text-gray-600">{{supplierPhone}}</p>
        <p class="text-sm text-gray-600">{{supplierEmail}}</p>
      </div>
    </div>
    <div>
      <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Ship To</h3>
      <div class="bg-gray-50 p-4 rounded">
        <p class="text-sm text-gray-900 font-semibold">{{shipToName}}</p>
        <p class="text-sm text-gray-600">{{shipToAddress}}</p>
        <p class="text-sm text-gray-600">{{shipToCity}}, {{shipToState}} {{shipToZip}}</p>
      </div>
    </div>
  </div>
  
  <div class="mb-8">
    <h3 class="text-sm font-semibold text-gray-700 mb-4 uppercase">Items Ordered</h3>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-indigo-700 text-white">
          <th class="border border-indigo-800 py-3 px-4 text-left text-sm font-semibold">Item #</th>
          <th class="border border-indigo-800 py-3 px-4 text-left text-sm font-semibold">Description</th>
          <th class="border border-indigo-800 py-3 px-4 text-right text-sm font-semibold">Quantity</th>
          <th class="border border-indigo-800 py-3 px-4 text-right text-sm font-semibold">Unit Price</th>
          <th class="border border-indigo-800 py-3 px-4 text-right text-sm font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td class="border border-gray-300 py-3 px-4 text-sm text-gray-900">{{this.itemNumber}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-gray-700">{{this.description}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-600">{{this.quantity}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-600">{{this.unitPrice}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-900 font-semibold">{{this.total}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4" class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-700">Subtotal</td>
          <td class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-900">{{subtotal}}</td>
        </tr>
        <tr>
          <td colspan="4" class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-700">Shipping</td>
          <td class="border border-gray-300 py-3 px-4 text-right text-sm font-semibold text-gray-900">{{shipping}}</td>
        </tr>
        <tr class="bg-indigo-50">
          <td colspan="4" class="border border-indigo-300 py-4 px-4 text-right text-base font-bold text-indigo-700">Total</td>
          <td class="border border-indigo-300 py-4 px-4 text-right text-base font-bold text-indigo-700">{{total}}</td>
        </tr>
      </tfoot>
    </table>
  </div>
  
  <div class="mb-8">
    <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Delivery Information</h3>
    <div class="bg-gray-50 p-4 rounded">
      <p class="text-sm text-gray-700 mb-2"><span class="font-semibold">Delivery Method:</span> {{deliveryMethod}}</p>
      <p class="text-sm text-gray-700 mb-2"><span class="font-semibold">Payment Terms:</span> {{paymentTerms}}</p>
      <p class="text-sm text-gray-700"><span class="font-semibold">Special Instructions:</span> {{specialInstructions}}</p>
    </div>
  </div>
  
  <div class="mt-8 pt-6 border-t border-gray-200">
    <p class="text-sm text-gray-600 mb-4">{{terms}}</p>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Authorized By:</p>
        <p class="text-sm text-gray-600">{{authorizedBy}}</p>
        <p class="text-sm text-gray-600">{{authorizedTitle}}</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-600 mb-8">{{signature}}</p>
        <p class="text-sm text-gray-500">Date: {{signatureDate}}</p>
      </div>
    </div>
  </div>
</div>`,
    metadata: {
      colors: ['indigo-700', 'gray-800', 'white', 'indigo-50'],
      style: 'formal',
      complexity: 'medium',
    },
    variables: [
      'companyName',
      'companyAddress',
      'poNumber',
      'poDate',
      'requiredDate',
      'supplierName',
      'supplierAddress',
      'supplierCity',
      'supplierState',
      'supplierZip',
      'supplierPhone',
      'supplierEmail',
      'shipToName',
      'shipToAddress',
      'shipToCity',
      'shipToState',
      'shipToZip',
      'items',
      'subtotal',
      'shipping',
      'total',
      'deliveryMethod',
      'paymentTerms',
      'specialInstructions',
      'terms',
      'authorizedBy',
      'authorizedTitle',
      'signature',
      'signatureDate',
    ],
  },
  {
    id: 'contract-agreement',
    name: 'Contrat/Accord',
    type: 'other',
    code: `<div class="bg-white p-8">
  <header class="mb-8 text-center pb-6 border-b-2 border-gray-900">
    <h1 class="text-4xl font-bold text-gray-900 mb-2">{{contractTitle}}</h1>
    <p class="text-lg text-gray-600">{{contractType}}</p>
    <p class="text-sm text-gray-500 mt-2">Effective Date: {{effectiveDate}}</p>
  </header>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Parties</h2>
    <div class="grid grid-cols-2 mb-4">
      <div class="mr-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Party A</h3>
        <div class="bg-gray-50 p-4 rounded">
          <p class="text-sm text-gray-900 font-semibold">{{partyAName}}</p>
          <p class="text-sm text-gray-600">{{partyAAddress}}</p>
          <p class="text-sm text-gray-600">{{partyACity}}, {{partyAState}} {{partyAZip}}</p>
          <p class="text-sm text-gray-600">{{partyAEmail}}</p>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Party B</h3>
        <div class="bg-gray-50 p-4 rounded">
          <p class="text-sm text-gray-900 font-semibold">{{partyBName}}</p>
          <p class="text-sm text-gray-600">{{partyBAddress}}</p>
          <p class="text-sm text-gray-600">{{partyBCity}}, {{partyBState}} {{partyBZip}}</p>
          <p class="text-sm text-gray-600">{{partyBEmail}}</p>
        </div>
      </div>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Recitals</h2>
    <div class="bg-gray-50 p-6 rounded-lg">
      <p class="text-sm text-gray-700 leading-relaxed mb-4">{{recitals}}</p>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
    <div class="space-y-6">
      {{#each terms}}
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{this.section}}</h3>
        <p class="text-sm text-gray-700 leading-relaxed">{{this.content}}</p>
        {{#if this.subsections}}
        <ul class="list-disc list-inside text-sm text-gray-600 ml-4 mt-2">
          {{#each this.subsections}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
        {{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Obligations</h2>
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Party A Obligations</h3>
        <ul class="list-disc list-inside text-sm text-gray-700 ml-4">
          {{#each partyAObligations}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Party B Obligations</h3>
        <ul class="list-disc list-inside text-sm text-gray-700 ml-4">
          {{#each partyBObligations}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Duration and Termination</h2>
    <div class="bg-gray-50 p-6 rounded-lg">
      <p class="text-sm text-gray-700 leading-relaxed mb-4">
        <span class="font-semibold">Term:</span> {{termDuration}}
      </p>
      <p class="text-sm text-gray-700 leading-relaxed">
        <span class="font-semibold">Termination:</span> {{terminationClause}}
      </p>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Signatures</h2>
    <div class="grid grid-cols-2 mt-8">
      <div class="mr-4">
        <p class="text-sm font-semibold text-gray-700 mb-2">Party A</p>
        <div class="border-t-2 border-gray-300 pt-4 mt-16">
          <p class="text-sm text-gray-900">{{partyASignature}}</p>
          <p class="text-sm text-gray-600">{{partyATitle}}</p>
          <p class="text-sm text-gray-500 mt-2">Date: {{partyADate}}</p>
        </div>
      </div>
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Party B</p>
        <div class="border-t-2 border-gray-300 pt-4 mt-16">
          <p class="text-sm text-gray-900">{{partyBSignature}}</p>
          <p class="text-sm text-gray-600">{{partyBTitle}}</p>
          <p class="text-sm text-gray-500 mt-2">Date: {{partyBDate}}</p>
        </div>
      </div>
    </div>
  </section>
</div>`,
    metadata: {
      colors: ['gray-900', 'gray-700', 'white', 'gray-50'],
      style: 'legal',
      complexity: 'medium',
    },
    variables: [
      'contractTitle',
      'contractType',
      'effectiveDate',
      'partyAName',
      'partyAAddress',
      'partyACity',
      'partyAState',
      'partyAZip',
      'partyAEmail',
      'partyBName',
      'partyBAddress',
      'partyBCity',
      'partyBState',
      'partyBZip',
      'partyBEmail',
      'recitals',
      'terms',
      'partyAObligations',
      'partyBObligations',
      'termDuration',
      'terminationClause',
      'partyASignature',
      'partyATitle',
      'partyADate',
      'partyBSignature',
      'partyBTitle',
      'partyBDate',
    ],
  },
  {
    id: 'nda-confidentiality',
    name: 'Accord de Confidentialité (NDA)',
    type: 'other',
    code: `<div class="bg-white p-8">
  <header class="mb-8 text-center pb-6 border-b-2 border-slate-900">
    <h1 class="text-4xl font-bold text-slate-900 mb-2">NON-DISCLOSURE AGREEMENT</h1>
    <p class="text-lg text-gray-600">Confidentiality Agreement</p>
    <p class="text-sm text-gray-500 mt-2">Date: {{agreementDate}}</p>
  </header>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Parties</h2>
    <div class="grid grid-cols-2 mb-4">
      <div class="mr-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Disclosing Party</h3>
        <div class="bg-gray-50 p-4 rounded">
          <p class="text-sm text-gray-900 font-semibold">{{disclosingPartyName}}</p>
          <p class="text-sm text-gray-600">{{disclosingPartyAddress}}</p>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2">Receiving Party</h3>
        <div class="bg-gray-50 p-4 rounded">
          <p class="text-sm text-gray-900 font-semibold">{{receivingPartyName}}</p>
          <p class="text-sm text-gray-600">{{receivingPartyAddress}}</p>
        </div>
      </div>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Purpose</h2>
    <div class="bg-gray-50 p-6 rounded-lg">
      <p class="text-sm text-gray-700 leading-relaxed">{{purpose}}</p>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Definition of Confidential Information</h2>
    <div class="space-y-4">
      <p class="text-sm text-gray-700 leading-relaxed">{{confidentialDefinition}}</p>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Confidential Information includes but is not limited to:</h3>
        <ul class="list-disc list-inside text-sm text-gray-700 ml-4">
          {{#each confidentialItems}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Obligations of Receiving Party</h2>
    <div class="space-y-3">
      {{#each obligations}}
      <div class="border-l-4 border-slate-900 pl-4">
        <p class="text-sm text-gray-700 leading-relaxed">{{this}}</p>
      </div>
      {{/each}}
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Exceptions</h2>
    <div class="bg-gray-50 p-6 rounded-lg">
      <p class="text-sm text-gray-700 leading-relaxed mb-4">The obligations set forth above shall not apply to information that:</p>
      <ul class="list-disc list-inside text-sm text-gray-700 ml-4">
        {{#each exceptions}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Duration</h2>
    <div class="bg-gray-50 p-6 rounded-lg">
      <p class="text-sm text-gray-700 leading-relaxed">
        This Agreement shall remain in effect for a period of {{duration}} from the date of execution, unless terminated earlier in accordance with its terms.
      </p>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Signatures</h2>
    <div class="grid grid-cols-2 mt-8">
      <div class="mr-4">
        <p class="text-sm font-semibold text-gray-700 mb-2">Disclosing Party</p>
        <div class="border-t-2 border-gray-300 pt-4 mt-16">
          <p class="text-sm text-gray-900">{{disclosingSignature}}</p>
          <p class="text-sm text-gray-600">{{disclosingTitle}}</p>
          <p class="text-sm text-gray-500 mt-2">Date: {{disclosingDate}}</p>
        </div>
      </div>
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Receiving Party</p>
        <div class="border-t-2 border-gray-300 pt-4 mt-16">
          <p class="text-sm text-gray-900">{{receivingSignature}}</p>
          <p class="text-sm text-gray-600">{{receivingTitle}}</p>
          <p class="text-sm text-gray-500 mt-2">Date: {{receivingDate}}</p>
        </div>
      </div>
    </div>
  </section>
</div>`,
    metadata: {
      colors: ['slate-900', 'gray-600', 'white', 'gray-50'],
      style: 'legal',
      complexity: 'simple',
    },
    variables: [
      'agreementDate',
      'disclosingPartyName',
      'disclosingPartyAddress',
      'receivingPartyName',
      'receivingPartyAddress',
      'purpose',
      'confidentialDefinition',
      'confidentialItems',
      'obligations',
      'exceptions',
      'duration',
      'disclosingSignature',
      'disclosingTitle',
      'disclosingDate',
      'receivingSignature',
      'receivingTitle',
      'receivingDate',
    ],
  },
  {
    id: 'presentation-slide',
    name: 'Slide de Présentation',
    type: 'other',
    code: `<div class="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 min-h-screen p-8">
  <div class="bg-white rounded-xl shadow-2xl p-8">
    <header class="mb-8 text-center">
      <h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">{{slideTitle}}</h1>
      {{#if slideSubtitle}}
      <p class="text-2xl text-gray-600">{{slideSubtitle}}</p>
      {{/if}}
    </header>
    
    <div class="mb-8">
      {{#each contentBlocks}}
      <div class="mb-6 p-6 rounded-lg {{this.bgColor}}">
        <h2 class="text-2xl font-bold {{this.titleColor}} mb-3">{{this.title}}</h2>
        <p class="text-base {{this.textColor}} leading-relaxed">{{this.content}}</p>
        {{#if this.bulletPoints}}
        <ul class="list-disc list-inside mt-4 {{this.textColor}}">
          {{#each this.bulletPoints}}
          <li class="mb-2">{{this}}</li>
          {{/each}}
        </ul>
        {{/if}}
      </div>
      {{/each}}
    </div>
    
    {{#if visualElements}}
    <div class="mb-8 grid grid-cols-2">
      {{#each visualElements}}
      <div class="p-4 {{this.bgColor}} rounded-lg mr-4 mb-4">
        <h3 class="text-lg font-semibold {{this.titleColor}} mb-2">{{this.label}}</h3>
        <p class="text-3xl font-bold {{this.valueColor}}">{{this.value}}</p>
      </div>
      {{/each}}
    </div>
    {{/if}}
    
    {{#if imageUrl}}
    <div class="mb-8 text-center">
      <img src="{{imageUrl}}" alt="{{imageAlt}}" class="max-w-full h-auto mx-auto rounded-lg shadow-lg">
    </div>
    {{/if}}
    
    <footer class="mt-8 pt-6 border-t border-gray-200 text-center">
      <p class="text-sm text-gray-500">{{footerText}}</p>
      {{#if slideNumber}}
      <p class="text-xs text-gray-400 mt-2">Slide {{slideNumber}}</p>
      {{/if}}
    </footer>
  </div>
</div>`,
    metadata: {
      colors: ['blue-500', 'purple-500', 'pink-500', 'blue-600', 'purple-600'],
      style: 'modern',
      complexity: 'medium',
    },
    variables: [
      'slideTitle',
      'slideSubtitle',
      'contentBlocks',
      'visualElements',
      'imageUrl',
      'imageAlt',
      'footerText',
      'slideNumber',
    ],
  },
  {
    id: 'pitch-deck',
    name: 'Pitch Deck d\'Entreprise',
    type: 'other',
    code: `<div class="bg-white p-8">
  <header class="mb-8 pb-6 border-b-2 border-purple-600">
    <h1 class="text-4xl font-bold text-purple-600 mb-2">{{companyName}}</h1>
    <p class="text-lg text-gray-600">{{tagline}}</p>
  </header>
  
  <section class="mb-8">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">The Problem</h2>
    <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded">
      <p class="text-base text-gray-700 leading-relaxed mb-4">{{problem}}</p>
      <ul class="list-disc list-inside text-sm text-gray-600">
        {{#each problemPoints}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Solution</h2>
    <div class="bg-green-50 border-l-4 border-green-500 p-6 rounded">
      <p class="text-base text-gray-700 leading-relaxed mb-4">{{solution}}</p>
      <div class="grid grid-cols-3 mt-4">
        {{#each solutionFeatures}}
        <div class="text-center p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{this.title}}</h3>
          <p class="text-sm text-gray-600">{{this.description}}</p>
        </div>
        {{/each}}
      </div>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">Market Opportunity</h2>
    <div class="bg-blue-50 p-6 rounded-lg">
      <div class="grid grid-cols-3 mb-4">
        <div class="text-center">
          <p class="text-4xl font-bold text-blue-600 mb-2">{{marketSize}}</p>
          <p class="text-sm text-gray-600">Market Size</p>
        </div>
        <div class="text-center">
          <p class="text-4xl font-bold text-blue-600 mb-2">{{growthRate}}</p>
          <p class="text-sm text-gray-600">Growth Rate</p>
        </div>
        <div class="text-center">
          <p class="text-4xl font-bold text-blue-600 mb-2">{{targetCustomers}}</p>
          <p class="text-sm text-gray-600">Target Customers</p>
        </div>
      </div>
      <p class="text-sm text-gray-700">{{marketDescription}}</p>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">Business Model</h2>
    <div class="space-y-4">
      <div class="border-l-4 border-purple-500 pl-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Revenue Streams</h3>
        <ul class="list-disc list-inside text-sm text-gray-700">
          {{#each revenueStreams}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
      <div class="border-l-4 border-purple-500 pl-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Pricing Strategy</h3>
        <p class="text-sm text-gray-700">{{pricingStrategy}}</p>
      </div>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">Team</h2>
    <div class="grid grid-cols-3">
      {{#each team}}
      <div class="text-center p-4">
        {{#if this.photo}}
        <img src="{{this.photo}}" alt="{{this.name}}" class="w-24 h-24 rounded-full mx-auto mb-3">
        {{/if}}
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{this.name}}</h3>
        <p class="text-sm text-gray-600 mb-2">{{this.role}}</p>
        <p class="text-xs text-gray-500">{{this.experience}}</p>
      </div>
      {{/each}}
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">Financial Projections</h2>
    <div class="bg-gray-50 p-6 rounded-lg">
      <table class="w-full mb-4">
        <thead>
          <tr class="border-b border-gray-300">
            <th class="text-left py-2 text-sm font-semibold text-gray-700">Year</th>
            <th class="text-right py-2 text-sm font-semibold text-gray-700">Revenue</th>
            <th class="text-right py-2 text-sm font-semibold text-gray-700">Expenses</th>
            <th class="text-right py-2 text-sm font-semibold text-gray-700">Profit</th>
          </tr>
        </thead>
        <tbody>
          {{#each financials}}
          <tr class="border-b border-gray-200">
            <td class="py-2 text-sm text-gray-700">{{this.year}}</td>
            <td class="py-2 text-sm text-right text-gray-900 font-semibold">{{this.revenue}}</td>
            <td class="py-2 text-sm text-right text-gray-600">{{this.expenses}}</td>
            <td class="py-2 text-sm text-right text-green-600 font-semibold">{{this.profit}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">The Ask</h2>
    <div class="bg-purple-50 border-l-4 border-purple-600 p-6 rounded">
      <p class="text-2xl font-bold text-purple-700 mb-4">We are raising {{fundingAmount}}</p>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Use of Funds:</h3>
      <ul class="list-disc list-inside text-sm text-gray-700 mb-4">
        {{#each useOfFunds}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
      <p class="text-sm text-gray-700">{{contactInfo}}</p>
    </div>
  </section>
</div>`,
    metadata: {
      colors: ['purple-600', 'red-500', 'green-500', 'blue-600', 'gray-900'],
      style: 'startup',
      complexity: 'complex',
    },
    variables: [
      'companyName',
      'tagline',
      'problem',
      'problemPoints',
      'solution',
      'solutionFeatures',
      'marketSize',
      'growthRate',
      'targetCustomers',
      'marketDescription',
      'revenueStreams',
      'pricingStrategy',
      'team',
      'financials',
      'fundingAmount',
      'useOfFunds',
      'contactInfo',
    ],
  },
  {
    id: 'receipt-payment',
    name: 'Reçu de Paiement',
    type: 'other',
    code: `<div class="bg-white p-8">
  <header class="mb-8 pb-6 border-b-2 border-green-600 text-center">
    <h1 class="text-4xl font-bold text-green-600 mb-2">PAYMENT RECEIPT</h1>
    <p class="text-sm text-gray-500">Receipt #: {{receiptNumber}}</p>
    <p class="text-sm text-gray-500">Date: {{receiptDate}}</p>
  </header>
  
  <div class="mb-8">
    <div class="grid grid-cols-2 mb-6">
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Received From</h3>
        <div class="bg-gray-50 p-4 rounded">
          <p class="text-sm text-gray-900 font-semibold">{{payerName}}</p>
          <p class="text-sm text-gray-600">{{payerAddress}}</p>
          <p class="text-sm text-gray-600">{{payerEmail}}</p>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Payment Details</h3>
        <div class="bg-gray-50 p-4 rounded">
          <p class="text-sm text-gray-700 mb-2"><span class="font-semibold">Amount:</span> {{amount}}</p>
          <p class="text-sm text-gray-700 mb-2"><span class="font-semibold">Payment Method:</span> {{paymentMethod}}</p>
          <p class="text-sm text-gray-700 mb-2"><span class="font-semibold">Reference:</span> {{referenceNumber}}</p>
          <p class="text-sm text-gray-700"><span class="font-semibold">Status:</span> <span class="text-green-600 font-bold">{{status}}</span></p>
        </div>
      </div>
    </div>
  </div>
  
  {{#if items}}
  <div class="mb-8">
    <h3 class="text-sm font-semibold text-gray-700 mb-4 uppercase">Items Paid</h3>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-green-600 text-white">
          <th class="border border-green-700 py-3 px-4 text-left text-sm font-semibold">Description</th>
          <th class="border border-green-700 py-3 px-4 text-right text-sm font-semibold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td class="border border-gray-300 py-3 px-4 text-sm text-gray-700">{{this.description}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-900 font-semibold">{{this.amount}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr class="bg-green-50">
          <td class="border border-green-300 py-4 px-4 text-right text-base font-bold text-green-700">Total</td>
          <td class="border border-green-300 py-4 px-4 text-right text-base font-bold text-green-700">{{totalAmount}}</td>
        </tr>
      </tfoot>
    </table>
  </div>
  {{/if}}
  
  <div class="mb-8 bg-green-50 border-l-4 border-green-600 p-6 rounded">
    <p class="text-sm text-green-800 mb-2">
      <span class="font-semibold">Payment Confirmed:</span> This receipt confirms that payment of {{amount}} has been received and processed successfully.
    </p>
    {{#if notes}}
    <p class="text-sm text-gray-700 mt-4"><span class="font-semibold">Notes:</span> {{notes}}</p>
    {{/if}}
  </div>
  
  <footer class="mt-8 pt-6 border-t border-gray-200">
    <div class="grid grid-cols-2">
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Issued By</p>
        <p class="text-sm text-gray-900">{{issuedBy}}</p>
        <p class="text-sm text-gray-600">{{companyName}}</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-500 mb-4">{{signature}}</p>
        <p class="text-sm text-gray-500">Date: {{signatureDate}}</p>
      </div>
    </div>
  </footer>
</div>`,
    metadata: {
      colors: ['green-600', 'gray-700', 'white', 'green-50'],
      style: 'simple',
      complexity: 'simple',
    },
    variables: [
      'receiptNumber',
      'receiptDate',
      'payerName',
      'payerAddress',
      'payerEmail',
      'amount',
      'paymentMethod',
      'referenceNumber',
      'status',
      'items',
      'totalAmount',
      'notes',
      'issuedBy',
      'companyName',
      'signature',
      'signatureDate',
    ],
  },
  {
    id: 'delivery-note',
    name: 'Bon de Livraison',
    type: 'other',
    code: `<div class="bg-white p-8">
  <header class="mb-8 pb-6 border-b-2 border-orange-600">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-orange-600 mb-2">{{companyName}}</h1>
        <p class="text-sm text-gray-600">{{companyAddress}}</p>
      </div>
      <div class="text-right">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">DELIVERY NOTE</h2>
        <p class="text-sm text-gray-600">DN #: {{deliveryNumber}}</p>
        <p class="text-sm text-gray-600">Date: {{deliveryDate}}</p>
        <p class="text-sm text-gray-600">Order #: {{orderNumber}}</p>
      </div>
    </div>
  </header>
  
  <div class="grid grid-cols-2 mb-8">
    <div class="mr-4">
      <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Deliver To</h3>
      <div class="bg-gray-50 p-4 rounded">
        <p class="text-sm text-gray-900 font-semibold">{{deliverToName}}</p>
        <p class="text-sm text-gray-600">{{deliverToAddress}}</p>
        <p class="text-sm text-gray-600">{{deliverToCity}}, {{deliverToState}} {{deliverToZip}}</p>
        <p class="text-sm text-gray-600">{{deliverToPhone}}</p>
      </div>
    </div>
    <div>
      <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase">Delivery Information</h3>
      <div class="bg-gray-50 p-4 rounded">
        <p class="text-sm text-gray-700 mb-2"><span class="font-semibold">Delivery Date:</span> {{deliveryDate}}</p>
        <p class="text-sm text-gray-700 mb-2"><span class="font-semibold">Carrier:</span> {{carrier}}</p>
        <p class="text-sm text-gray-700 mb-2"><span class="font-semibold">Tracking #:</span> {{trackingNumber}}</p>
        <p class="text-sm text-gray-700"><span class="font-semibold">Status:</span> <span class="text-orange-600 font-bold">{{status}}</span></p>
      </div>
    </div>
  </div>
  
  <div class="mb-8">
    <h3 class="text-sm font-semibold text-gray-700 mb-4 uppercase">Items Delivered</h3>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-orange-600 text-white">
          <th class="border border-orange-700 py-3 px-4 text-left text-sm font-semibold">Item #</th>
          <th class="border border-orange-700 py-3 px-4 text-left text-sm font-semibold">Description</th>
          <th class="border border-orange-700 py-3 px-4 text-right text-sm font-semibold">Quantity Ordered</th>
          <th class="border border-orange-700 py-3 px-4 text-right text-sm font-semibold">Quantity Delivered</th>
          <th class="border border-orange-700 py-3 px-4 text-left text-sm font-semibold">Condition</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td class="border border-gray-300 py-3 px-4 text-sm text-gray-900">{{this.itemNumber}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-gray-700">{{this.description}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-600">{{this.quantityOrdered}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-right text-gray-900 font-semibold">{{this.quantityDelivered}}</td>
          <td class="border border-gray-300 py-3 px-4 text-sm text-gray-600">{{this.condition}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
  
  {{#if specialInstructions}}
  <div class="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
    <h3 class="text-sm font-semibold text-yellow-800 mb-2">Special Instructions</h3>
    <p class="text-sm text-yellow-700">{{specialInstructions}}</p>
  </div>
  {{/if}}
  
  <div class="mb-8">
    <h3 class="text-sm font-semibold text-gray-700 mb-4 uppercase">Signatures</h3>
    <div class="grid grid-cols-2">
      <div class="mr-4">
        <p class="text-sm font-semibold text-gray-700 mb-2">Delivered By (Carrier)</p>
        <div class="border-t-2 border-gray-300 pt-4 mt-16">
          <p class="text-sm text-gray-900">{{carrierSignature}}</p>
          <p class="text-sm text-gray-600">{{carrierName}}</p>
          <p class="text-sm text-gray-500 mt-2">Date: {{carrierDate}}</p>
        </div>
      </div>
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Received By (Customer)</p>
        <div class="border-t-2 border-gray-300 pt-4 mt-16">
          <p class="text-sm text-gray-900">{{customerSignature}}</p>
          <p class="text-sm text-gray-600">{{customerName}}</p>
          <p class="text-sm text-gray-500 mt-2">Date: {{customerDate}}</p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="mt-8 pt-6 border-t border-gray-200">
    <p class="text-sm text-gray-600">{{notes}}</p>
  </div>
</div>`,
    metadata: {
      colors: ['orange-600', 'gray-800', 'white', 'orange-50'],
      style: 'structured',
      complexity: 'simple',
    },
    variables: [
      'companyName',
      'companyAddress',
      'deliveryNumber',
      'deliveryDate',
      'orderNumber',
      'deliverToName',
      'deliverToAddress',
      'deliverToCity',
      'deliverToState',
      'deliverToZip',
      'deliverToPhone',
      'carrier',
      'trackingNumber',
      'status',
      'items',
      'specialInstructions',
      'carrierSignature',
      'carrierName',
      'carrierDate',
      'customerSignature',
      'customerName',
      'customerDate',
      'notes',
    ],
  },
  {
    id: 'certificate-achievement',
    name: 'Certificat/A attestation',
    type: 'other',
    code: `<div class="bg-white p-12 border-8 border-yellow-400">
  <div class="text-center mb-8">
    <div class="mb-6">
      {{#if logoUrl}}
      <img src="{{logoUrl}}" alt="Logo" class="h-20 w-auto mx-auto mb-4">
      {{/if}}
      <h1 class="text-5xl font-bold text-yellow-600 mb-2 uppercase tracking-wide">Certificate</h1>
      <h2 class="text-3xl font-bold text-gray-900 mb-4">of {{certificateType}}</h2>
    </div>
  </div>
  
  <div class="text-center mb-8">
    <p class="text-lg text-gray-700 mb-6 leading-relaxed">
      This is to certify that
    </p>
    <div class="border-b-4 border-yellow-400 inline-block mb-6">
      <h3 class="text-4xl font-bold text-gray-900 py-4 px-8">{{recipientName}}</h3>
    </div>
    <p class="text-lg text-gray-700 mb-6 leading-relaxed">
      has successfully completed
    </p>
    <div class="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6 inline-block">
      <h4 class="text-2xl font-bold text-gray-900 mb-2">{{achievementTitle}}</h4>
      <p class="text-base text-gray-700">{{achievementDescription}}</p>
    </div>
  </div>
  
  <div class="mb-8 text-center">
    <div class="grid grid-cols-3">
      <div>
        <p class="text-sm text-gray-600 mb-2">Date of Completion</p>
        <p class="text-base font-semibold text-gray-900">{{completionDate}}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-2">Certificate Number</p>
        <p class="text-base font-semibold text-gray-900">{{certificateNumber}}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-2">Issued Date</p>
        <p class="text-base font-semibold text-gray-900">{{issuedDate}}</p>
      </div>
    </div>
  </div>
  
  {{#if criteria}}
  <div class="mb-8 bg-gray-50 p-6 rounded-lg">
    <h4 class="text-lg font-semibold text-gray-900 mb-3 text-center">Achievement Criteria</h4>
    <ul class="list-disc list-inside text-sm text-gray-700 text-center">
      {{#each criteria}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
  {{/if}}
  
  <div class="mt-12 grid grid-cols-2">
    <div class="text-center">
      <div class="border-t-2 border-gray-900 pt-4 mt-16">
        <p class="text-sm font-semibold text-gray-900 mb-2">{{issuerSignature}}</p>
        <p class="text-sm text-gray-600">{{issuerName}}</p>
        <p class="text-sm text-gray-500">{{issuerTitle}}</p>
      </div>
    </div>
    <div class="text-center">
      <div class="border-t-2 border-gray-900 pt-4 mt-16">
        <p class="text-sm font-semibold text-gray-900 mb-2">{{authoritySignature}}</p>
        <p class="text-sm text-gray-600">{{authorityName}}</p>
        <p class="text-sm text-gray-500">{{authorityTitle}}</p>
      </div>
    </div>
  </div>
  
  {{#if sealUrl}}
  <div class="mt-8 text-center">
    <img src="{{sealUrl}}" alt="Official Seal" class="h-24 w-24 mx-auto opacity-50">
  </div>
  {{/if}}
  
  <footer class="mt-8 pt-6 border-t border-gray-200 text-center">
    <p class="text-xs text-gray-500">{{footerText}}</p>
    {{#if verificationUrl}}
    <p class="text-xs text-gray-500 mt-2">Verify at: {{verificationUrl}}</p>
    {{/if}}
  </footer>
</div>`,
    metadata: {
      colors: ['yellow-400', 'yellow-600', 'gray-900', 'gray-700'],
      style: 'elegant',
      complexity: 'medium',
    },
    variables: [
      'logoUrl',
      'certificateType',
      'recipientName',
      'achievementTitle',
      'achievementDescription',
      'completionDate',
      'certificateNumber',
      'issuedDate',
      'criteria',
      'issuerSignature',
      'issuerName',
      'issuerTitle',
      'authoritySignature',
      'authorityName',
      'authorityTitle',
      'sealUrl',
      'footerText',
      'verificationUrl',
    ],
  },
  {
    id: 'resume-modern',
    name: 'CV Moderne',
    type: 'resume',
    code: `<div class="max-w-5xl mx-auto bg-white">
  <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-4xl font-bold mb-2">{{fullName}}</h1>
        <p class="text-xl text-indigo-100">{{jobTitle}}</p>
      </div>
      {{#if profileImage}}
      <img src="{{profileImage}}" alt="Profile" class="w-24 h-24 rounded-full border-4 border-white">
      {{/if}}
    </div>
    <div class="grid grid-cols-3 gap-4 mt-6 text-sm">
      <div>
        <p class="text-indigo-100 mb-1">Email</p>
        <p class="font-semibold">{{email}}</p>
      </div>
      <div>
        <p class="text-indigo-100 mb-1">Téléphone</p>
        <p class="font-semibold">{{phone}}</p>
      </div>
      <div>
        <p class="text-indigo-100 mb-1">Localisation</p>
        <p class="font-semibold">{{location}}</p>
      </div>
    </div>
  </div>
  
  <div class="p-8">
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-indigo-600 mb-4 border-l-4 border-indigo-600 pl-4">Profil Professionnel</h2>
      <p class="text-gray-700 leading-relaxed">{{summary}}</p>
    </section>
    
    <div class="grid grid-cols-2 gap-8 mb-8">
      <section>
        <h2 class="text-2xl font-bold text-indigo-600 mb-4 border-l-4 border-indigo-600 pl-4">Expérience</h2>
        {{#each experience}}
        <div class="mb-6 pb-6 border-b border-gray-200">
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{this.title}}</h3>
              <p class="text-sm text-indigo-600 font-medium">{{this.company}}</p>
            </div>
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{{this.period}}</span>
          </div>
          <p class="text-sm text-gray-600 mb-2">{{this.location}}</p>
          <ul class="list-disc list-inside text-sm text-gray-700">
            {{#each this.responsibilities}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
        </div>
        {{/each}}
      </section>
      
      <section>
        <h2 class="text-2xl font-bold text-indigo-600 mb-4 border-l-4 border-indigo-600 pl-4">Formation</h2>
        {{#each education}}
        <div class="mb-6 pb-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">{{this.degree}}</h3>
          <p class="text-sm text-indigo-600 font-medium mb-1">{{this.school}}</p>
          <p class="text-xs text-gray-500">{{this.year}} | {{this.location}}</p>
          {{#if this.honors}}
          <p class="text-xs text-gray-600 mt-1">Distinction: {{this.honors}}</p>
          {{/if}}
        </div>
        {{/each}}
      </section>
    </div>
    
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-indigo-600 mb-4 border-l-4 border-indigo-600 pl-4">Compétences</h2>
      <div class="grid grid-cols-3 gap-6">
        {{#each skills}}
        <div>
          <p class="text-sm font-semibold text-gray-700 mb-2">{{this.category}}</p>
          <div class="flex flex-wrap">
            {{#each this.items}}
            <span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded mr-2 mb-2 text-xs font-medium">{{this}}</span>
            {{/each}}
          </div>
        </div>
        {{/each}}
      </div>
    </section>
    
    {{#if projects}}
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-indigo-600 mb-4 border-l-4 border-indigo-600 pl-4">Projets</h2>
      <div class="grid grid-cols-2 gap-4">
        {{#each projects}}
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{this.name}}</h3>
          <p class="text-sm text-gray-600 mb-2">{{this.description}}</p>
          <div class="flex flex-wrap">
            {{#each this.technologies}}
            <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded mr-2 mb-2 text-xs">{{this}}</span>
            {{/each}}
          </div>
        </div>
        {{/each}}
      </div>
    </section>
    {{/if}}
    
    {{#if languages}}
    <section>
      <h2 class="text-2xl font-bold text-indigo-600 mb-4 border-l-4 border-indigo-600 pl-4">Langues</h2>
      <div class="flex flex-wrap">
        {{#each languages}}
        <div class="bg-gray-50 px-4 py-2 rounded mr-4 mb-2">
          <span class="font-semibold text-gray-900">{{this.name}}</span>
          <span class="text-sm text-gray-600 ml-2">- {{this.level}}</span>
        </div>
        {{/each}}
      </div>
    </section>
    {{/if}}
  </div>
</div>`,
    metadata: {
      colors: ['indigo-600', 'purple-600', 'gray-900', 'gray-700'],
      style: 'modern',
      complexity: 'complex',
    },
    variables: [
      'fullName',
      'jobTitle',
      'email',
      'phone',
      'location',
      'profileImage',
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'languages',
    ],
  },
  {
    id: 'report-analytical',
    name: 'Rapport Analytique',
    type: 'report',
    code: `<div class="max-w-6xl mx-auto bg-white p-8">
  <header class="mb-8 border-b-4 border-blue-600 pb-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{reportTitle}}</h1>
        <p class="text-lg text-gray-600">{{reportSubtitle}}</p>
      </div>
      {{#if logoUrl}}
      <img src="{{logoUrl}}" alt="Logo" class="h-16 w-auto">
      {{/if}}
    </div>
    <div class="grid grid-cols-3 gap-4 mt-4 text-sm">
      <div>
        <p class="text-gray-500 mb-1">Période</p>
        <p class="font-semibold text-gray-900">{{period}}</p>
      </div>
      <div>
        <p class="text-gray-500 mb-1">Date de génération</p>
        <p class="font-semibold text-gray-900">{{generationDate}}</p>
      </div>
      <div>
        <p class="text-gray-500 mb-1">Auteur</p>
        <p class="font-semibold text-gray-900">{{author}}</p>
      </div>
    </div>
  </header>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-blue-600 mb-6">Métriques Clés</h2>
    <div class="grid grid-cols-4 gap-4">
      {{#each keyMetrics}}
      <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
        <p class="text-sm text-blue-600 mb-2 font-medium">{{this.label}}</p>
        <p class="text-3xl font-bold text-blue-900">{{this.value}}</p>
        {{#if this.change}}
        <p class="text-xs mt-2 {{#if this.isPositive}}text-green-600{{else}}text-red-600{{/if}}">
          {{this.change}}% vs période précédente
        </p>
        {{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-blue-600 mb-6">Analyse Détaillée</h2>
    <div class="space-y-6">
      {{#each analysisSections}}
      <div class="border-l-4 border-blue-600 pl-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-3">{{this.title}}</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">{{this.content}}</p>
        {{#if this.data}}
        <div class="bg-gray-50 p-4 rounded-lg">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-300">
                {{#each this.data.headers}}
                <th class="text-left py-2 font-semibold text-gray-700">{{this}}</th>
                {{/each}}
              </tr>
            </thead>
            <tbody>
              {{#each this.data.rows}}
              <tr class="border-b border-gray-200">
                {{#each this}}
                <td class="py-2 text-gray-700">{{this}}</td>
                {{/each}}
              </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
        {{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  
  {{#if charts}}
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-blue-600 mb-6">Visualisations</h2>
    <div class="grid grid-cols-2 gap-6">
      {{#each charts}}
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{this.title}}</h3>
        {{#if this.imageUrl}}
        <img src="{{this.imageUrl}}" alt="{{this.title}}" class="w-full h-auto">
        {{else}}
        <div class="bg-white p-8 text-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
          [Graphique: {{this.type}}]
        </div>
        {{/if}}
        {{#if this.description}}
        <p class="text-sm text-gray-600 mt-4">{{this.description}}</p>
        {{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  {{/if}}
  
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-blue-600 mb-6">Conclusions</h2>
    <div class="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
      <ul class="list-disc list-inside space-y-2 text-gray-700">
        {{#each conclusions}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
  </section>
  
  {{#if recommendations}}
  <section class="mb-8">
    <h2 class="text-2xl font-bold text-blue-600 mb-6">Recommandations</h2>
    <div class="space-y-4">
      {{#each recommendations}}
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 class="font-semibold text-gray-900 mb-2">{{this.title}}</h3>
        <p class="text-sm text-gray-700">{{this.description}}</p>
        {{#if this.priority}}
        <span class="inline-block mt-2 text-xs px-2 py-1 rounded bg-{{this.priorityColor}}-100 text-{{this.priorityColor}}-700">
          Priorité: {{this.priority}}
        </span>
        {{/if}}
      </div>
      {{/each}}
    </div>
  </section>
  {{/if}}
  
  <footer class="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
    <p>{{footerText}}</p>
    {{#if contactEmail}}
    <p class="mt-2">Contact: {{contactEmail}}</p>
    {{/if}}
  </footer>
</div>`,
    metadata: {
      colors: ['blue-600', 'blue-900', 'gray-900', 'gray-700'],
      style: 'analytical',
      complexity: 'complex',
    },
    variables: [
      'reportTitle',
      'reportSubtitle',
      'logoUrl',
      'period',
      'generationDate',
      'author',
      'keyMetrics',
      'analysisSections',
      'charts',
      'conclusions',
      'recommendations',
      'footerText',
      'contactEmail',
    ],
  },
  {
    id: 'menu-restaurant',
    name: 'Menu Restaurant',
    type: 'other',
    code: `<div class="max-w-4xl mx-auto bg-white">
  <header class="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-8 text-center">
    {{#if logoUrl}}
    <img src="{{logoUrl}}" alt="Logo" class="h-24 w-auto mx-auto mb-4">
    {{/if}}
    <h1 class="text-5xl font-bold mb-2">{{restaurantName}}</h1>
    <p class="text-xl text-amber-100">{{tagline}}</p>
    <div class="mt-4 text-sm">
      <p>{{address}}</p>
      <p>{{phone}} | {{email}}</p>
    </div>
  </header>
  
  <div class="p-8">
    {{#each sections}}
    <section class="mb-12">
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-amber-600 mb-2">{{this.title}}</h2>
        {{#if this.subtitle}}
        <p class="text-sm text-gray-600 italic">{{this.subtitle}}</p>
        {{/if}}
      </div>
      
      <div class="space-y-6">
        {{#each this.items}}
        <div class="border-b border-gray-200 pb-6 mb-6">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <h3 class="text-xl font-semibold text-gray-900 mr-3">{{this.name}}</h3>
                {{#if this.isVegetarian}}
                <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Végétarien</span>
                {{/if}}
                {{#if this.isSpicy}}
                <span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded ml-2">Épicé</span>
                {{/if}}
              </div>
              <p class="text-gray-600 text-sm leading-relaxed mb-2">{{this.description}}</p>
              {{#if this.allergens}}
              <p class="text-xs text-gray-500 italic">Allergènes: {{this.allergens}}</p>
              {{/if}}
            </div>
            <div class="ml-4 text-right">
              <p class="text-2xl font-bold text-amber-600">{{this.price}}</p>
              {{#if this.originalPrice}}
              <p class="text-sm text-gray-400 line-through">{{this.originalPrice}}</p>
              {{/if}}
            </div>
          </div>
        </div>
        {{/each}}
      </div>
    </section>
    {{/each}}
    
    {{#if specialNotes}}
    <div class="bg-amber-50 border-l-4 border-amber-600 p-4 rounded mb-8">
      <h3 class="font-semibold text-amber-900 mb-2">Notes Spéciales</h3>
      <ul class="list-disc list-inside text-sm text-amber-800">
        {{#each specialNotes}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    {{/if}}
    
    {{#if footerInfo}}
    <footer class="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
      <p>{{footerInfo}}</p>
      {{#if socialMedia}}
      <div class="mt-4">
        {{#each socialMedia}}
        <span class="mx-2">{{this.platform}}: {{this.handle}}</span>
        {{/each}}
      </div>
      {{/if}}
    </footer>
    {{/if}}
  </div>
</div>`,
    metadata: {
      colors: ['amber-600', 'orange-600', 'gray-900', 'gray-600'],
      style: 'elegant',
      complexity: 'medium',
    },
    variables: [
      'restaurantName',
      'tagline',
      'logoUrl',
      'address',
      'phone',
      'email',
      'sections',
      'specialNotes',
      'footerInfo',
      'socialMedia',
    ],
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    type: 'other',
    code: `<div class="max-w-4xl mx-auto bg-white">
  <header class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
    <h1 class="text-4xl font-bold mb-2">{{newsletterTitle}}</h1>
    <p class="text-xl text-blue-100 mb-4">{{newsletterSubtitle}}</p>
    <div class="flex items-center justify-center text-sm">
      <span>{{issueDate}}</span>
      {{#if issueNumber}}
      <span class="mx-2">•</span>
      <span>Numéro {{issueNumber}}</span>
      {{/if}}
    </div>
  </header>
  
  <div class="p-8">
    {{#if editorNote}}
    <div class="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded">
      <h2 class="text-lg font-semibold text-blue-900 mb-2">Note de la Rédaction</h2>
      <p class="text-gray-700 leading-relaxed">{{editorNote}}</p>
    </div>
    {{/if}}
    
    <div class="grid grid-cols-2 gap-8 mb-8">
      {{#each featuredArticles}}
      <article class="border border-gray-200 rounded-lg overflow-hidden">
        {{#if this.imageUrl}}
        <img src="{{this.imageUrl}}" alt="{{this.title}}" class="w-full h-48 object-cover">
        {{/if}}
        <div class="p-6">
          <div class="flex items-center mb-2">
            <span class="text-xs font-semibold text-blue-600 uppercase tracking-wide">{{this.category}}</span>
            <span class="text-xs text-gray-500 ml-auto">{{this.date}}</span>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{this.title}}</h2>
          <p class="text-gray-600 text-sm mb-4 line-clamp-3">{{this.excerpt}}</p>
          <a href="#" class="text-blue-600 text-sm font-medium hover:underline">Lire la suite →</a>
        </div>
      </article>
      {{/each}}
    </div>
    
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-300 pb-2">Articles</h2>
      <div class="space-y-6">
        {{#each articles}}
        <article class="flex items-start">
          {{#if this.imageUrl}}
          <img src="{{this.imageUrl}}" alt="{{this.title}}" class="w-32 h-32 object-cover rounded mr-4 flex-shrink-0">
          {{/if}}
          <div class="flex-1">
            <div class="flex items-center mb-2">
              <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{{this.category}}</span>
              <span class="text-xs text-gray-500 ml-auto">{{this.date}}</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{this.title}}</h3>
            <p class="text-gray-600 text-sm mb-3 leading-relaxed">{{this.excerpt}}</p>
            <a href="#" class="text-indigo-600 text-sm font-medium hover:underline">Lire la suite →</a>
          </div>
        </article>
        {{/each}}
      </div>
    </div>
    
    {{#if events}}
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Événements à Venir</h2>
      <div class="space-y-4">
        {{#each events}}
        <div class="flex items-start">
          <div class="bg-indigo-600 text-white text-center p-3 rounded mr-4 flex-shrink-0">
            <p class="text-sm font-bold">{{this.dateDay}}</p>
            <p class="text-xs">{{this.dateMonth}}</p>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 mb-1">{{this.title}}</h3>
            <p class="text-sm text-gray-600">{{this.location}} • {{this.time}}</p>
            <p class="text-sm text-gray-700 mt-2">{{this.description}}</p>
          </div>
        </div>
        {{/each}}
      </div>
    </div>
    {{/if}}
    
    <footer class="mt-12 pt-6 border-t border-gray-300">
      <div class="grid grid-cols-3 gap-6 text-sm">
        <div>
          <h3 class="font-semibold text-gray-900 mb-2">Contact</h3>
          <p class="text-gray-600">{{contactEmail}}</p>
          <p class="text-gray-600">{{contactPhone}}</p>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 mb-2">Suivez-nous</h3>
          {{#each socialLinks}}
          <p class="text-gray-600">{{this.platform}}: {{this.handle}}</p>
          {{/each}}
        </div>
        <div>
          <h3 class="font-semibold text-gray-900 mb-2">Newsletter</h3>
          <p class="text-gray-600 text-xs">{{unsubscribeText}}</p>
        </div>
      </div>
      <p class="text-center text-xs text-gray-500 mt-6">{{copyrightText}}</p>
    </footer>
  </div>
</div>`,
    metadata: {
      colors: ['blue-600', 'indigo-600', 'gray-900', 'gray-600'],
      style: 'modern',
      complexity: 'medium',
    },
    variables: [
      'newsletterTitle',
      'newsletterSubtitle',
      'issueDate',
      'issueNumber',
      'editorNote',
      'featuredArticles',
      'articles',
      'events',
      'contactEmail',
      'contactPhone',
      'socialLinks',
      'unsubscribeText',
      'copyrightText',
    ],
  },
  {
    id: 'product-sheet',
    name: 'Fiche Produit',
    type: 'other',
    code: `<div class="max-w-5xl mx-auto bg-white">
  <div class="grid grid-cols-2 gap-8 p-8">
    <div>
      {{#if mainImage}}
      <img src="{{mainImage}}" alt="{{productName}}" class="w-full h-auto rounded-lg border border-gray-200 mb-4">
      {{/if}}
      {{#if additionalImages}}
      <div class="grid grid-cols-4 gap-2">
        {{#each additionalImages}}
        <img src="{{this}}" alt="Product view" class="w-full h-20 object-cover rounded border border-gray-200">
        {{/each}}
      </div>
      {{/if}}
    </div>
    
    <div>
      <div class="mb-4">
        {{#if brand}}
        <p class="text-sm text-gray-500 mb-1">{{brand}}</p>
        {{/if}}
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{productName}}</h1>
        {{#if productCode}}
        <p class="text-sm text-gray-500">Référence: {{productCode}}</p>
        {{/if}}
      </div>
      
      <div class="mb-6">
        <div class="flex items-baseline mb-4">
          <span class="text-4xl font-bold text-indigo-600 mr-3">{{price}}</span>
          {{#if originalPrice}}
          <span class="text-xl text-gray-400 line-through">{{originalPrice}}</span>
          {{/if}}
          {{#if discount}}
          <span class="ml-3 bg-red-100 text-red-700 text-sm font-semibold px-2 py-1 rounded">{{discount}}% OFF</span>
          {{/if}}
        </div>
        {{#if availability}}
        <div class="flex items-center mb-2">
          <span class="text-sm font-semibold text-gray-700 mr-2">Disponibilité:</span>
          <span class="text-sm {{#if (eq availability 'En stock')}}text-green-600{{else}}text-red-600{{/if}} font-medium">
            {{availability}}
          </span>
        </div>
        {{/if}}
      </div>
      
      <div class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Description</h2>
        <p class="text-gray-700 leading-relaxed mb-4">{{description}}</p>
        {{#if keyFeatures}}
        <ul class="list-disc list-inside text-gray-700 space-y-1">
          {{#each keyFeatures}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
        {{/if}}
      </div>
      
      {{#if specifications}}
      <div class="mb-6 border-t border-gray-200 pt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Spécifications</h2>
        <table class="w-full text-sm">
          <tbody>
            {{#each specifications}}
            <tr class="border-b border-gray-100">
              <td class="py-2 font-semibold text-gray-700 w-1/3">{{this.name}}</td>
              <td class="py-2 text-gray-600">{{this.value}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
      {{/if}}
      
      {{#if reviews}}
      <div class="mb-6 border-t border-gray-200 pt-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Avis Clients</h2>
          <div class="flex items-center">
            <span class="text-2xl font-bold text-gray-900 mr-2">{{averageRating}}</span>
            <div class="flex">
              {{#each (range 1 5)}}
              <span class="text-yellow-400">{{#if (lte this ../averageRating)}}★{{else}}☆{{/if}}</span>
              {{/each}}
            </div>
            <span class="text-sm text-gray-600 ml-2">({{totalReviews}} avis)</span>
          </div>
        </div>
        <div class="space-y-4 max-h-64 overflow-y-auto">
          {{#each reviews}}
          <div class="border-b border-gray-100 pb-4">
            <div class="flex items-center mb-2">
              <span class="font-semibold text-gray-900 mr-2">{{this.author}}</span>
              <div class="flex">
                {{#each (range 1 5)}}
                <span class="text-yellow-400 text-xs">{{#if (lte this ../this.rating)}}★{{else}}☆{{/if}}</span>
                {{/each}}
              </div>
            </div>
            <p class="text-sm text-gray-700">{{this.comment}}</p>
            <p class="text-xs text-gray-500 mt-1">{{this.date}}</p>
          </div>
          {{/each}}
        </div>
      </div>
      {{/if}}
      
      <div class="border-t border-gray-200 pt-6">
        <div class="flex items-center space-x-4">
          <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 flex-1">
            Ajouter au Panier
          </button>
          <button class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50">
            Favoris
          </button>
        </div>
        {{#if shippingInfo}}
        <p class="text-sm text-gray-600 mt-4 text-center">{{shippingInfo}}</p>
        {{/if}}
      </div>
    </div>
  </div>
  
  {{#if relatedProducts}}
  <div class="border-t border-gray-200 p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Produits Similaires</h2>
    <div class="grid grid-cols-4 gap-4">
      {{#each relatedProducts}}
      <div class="border border-gray-200 rounded-lg p-4">
        {{#if this.image}}
        <img src="{{this.image}}" alt="{{this.name}}" class="w-full h-32 object-cover rounded mb-2">
        {{/if}}
        <h3 class="font-semibold text-gray-900 text-sm mb-1">{{this.name}}</h3>
        <p class="text-indigo-600 font-bold">{{this.price}}</p>
      </div>
      {{/each}}
    </div>
  </div>
  {{/if}}
</div>`,
    metadata: {
      colors: ['indigo-600', 'gray-900', 'gray-700', 'yellow-400'],
      style: 'modern',
      complexity: 'complex',
    },
    variables: [
      'productName',
      'brand',
      'productCode',
      'mainImage',
      'additionalImages',
      'price',
      'originalPrice',
      'discount',
      'availability',
      'description',
      'keyFeatures',
      'specifications',
      'reviews',
      'averageRating',
      'totalReviews',
      'shippingInfo',
      'relatedProducts',
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
