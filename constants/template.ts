export const DEFAULT_TEMPLATE = `
<div class="mx-auto bg-white">
  <article class="overflow-hidden">
    <div class="bg-[white] rounded-b-md">
      <div class="p-9">
        <div class="space-y-6 text-slate-700">
          <p class="text-xl font-extrabold tracking-tight uppercase font-body">
            Transactional
          </p>
        </div>
      </div>
      <div class="p-9">
        <div class="flex w-full">
          <div class="grid grid-cols-4 gap-12">
            <div class="text-sm font-light text-slate-500">
              <p class="text-sm font-normal text-slate-700">
                Invoice Detail:
              </p>
              <p>{{fromCompany.name}}</p>
              <p>{{fromCompany.street}}</p>
              <p>{{fromCompany.city}}, {{fromCompany.country}}</p>
              <p>{{fromCompany.zip}}</p>
            </div>
            <div class="text-sm font-light text-slate-500">
              <p class="text-sm font-normal text-slate-700">Billed To</p>
              <p>{{toCompany.name}}</p>
              <p>{{toCompany.street}}</p>
              <p>{{toCompany.city}}, {{toCompany.country}}</p>
              <p>{{toCompany.zip}}</p>
            </div>
            <div class="text-sm font-light text-slate-500">
              <p class="text-sm font-normal text-slate-700">Invoice Number</p>
              <p>{{invoiceNumber}}</p>

              <p class="mt-2 text-sm font-normal text-slate-700">
                Date of Issue
              </p>
              <p>{{issueDate}}</p>
            </div>
            <div class="text-sm font-light text-slate-500">
              <p class="text-sm font-normal text-slate-700">Due</p>
              <p>{{dueDate}}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-9">
        <div class="flex flex-col mx-0 mt-8">
          <table class="min-w-full divide-y divide-slate-500">
            <thead>
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-normal text-slate-700 sm:pl-6 md:pl-0">
                  Description
                </th>
                <th scope="col" class="hidden py-3.5 px-3 text-right text-sm font-normal text-slate-700 sm:table-cell">
                  Quantity
                </th>
                <th scope="col" class="hidden py-3.5 px-3 text-right text-sm font-normal text-slate-700 sm:table-cell">
                  Taxes
                </th>
                <th scope="col" class="py-3.5 pl-3 pr-4 text-right text-sm font-normal text-slate-700 sm:pr-6 md:pr-0">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>

              {{#each items}}
              <tr class="border-b border-slate-200">
                <td class="py-4 pl-4 pr-3 text-sm sm:pl-6 md:pl-0">
                  <div class="font-medium text-slate-700">{{this.name}}</div>
                </td>
                <td class="hidden px-3 py-4 text-sm text-right text-slate-500 sm:table-cell">
                  {{this.quantity}}
                </td>
                <td class="hidden px-3 py-4 text-sm text-right text-slate-500 sm:table-cell">
                  {{this.taxes}}
                </td>
                <td class="py-4 pl-3 pr-4 text-sm text-right text-slate-500 sm:pr-6 md:pr-0">
                  {{this.price}}
                </td>
              </tr>
              {{/each}}

            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colspan="3" class="hidden pt-6 pl-6 pr-3 text-sm font-light text-right text-slate-500 sm:table-cell md:pl-0">
                  Subtotal
                </th>
                <th scope="row" class="pt-6 pl-4 pr-3 text-sm font-light text-left text-slate-500 sm:hidden">
                  Subtotal
                </th>
                <td class="pt-6 pl-3 pr-4 text-sm text-right text-slate-500 sm:pr-6 md:pr-0">
                  {{prices.subtotal}}
                </td>
              </tr>
              <tr>
                <th scope="row" colspan="3" class="hidden pt-6 pl-6 pr-3 text-sm font-light text-right text-slate-500 sm:table-cell md:pl-0">
                  Discount
                </th>
                <th scope="row" class="pt-6 pl-4 pr-3 text-sm font-light text-left text-slate-500 sm:hidden">
                  Discount
                </th>
                <td class="pt-6 pl-3 pr-4 text-sm text-right text-slate-500 sm:pr-6 md:pr-0">
                  {{prices.discount}}
                </td>
              </tr>
              <tr>
                <th scope="row" colspan="3" class="hidden pt-4 pl-6 pr-3 text-sm font-light text-right text-slate-500 sm:table-cell md:pl-0">
                  Tax
                </th>
                <th scope="row" class="pt-4 pl-4 pr-3 text-sm font-light text-left text-slate-500 sm:hidden">
                  Tax
                </th>
                <td class="pt-4 pl-3 pr-4 text-sm text-right text-slate-500 sm:pr-6 md:pr-0">
                  {{prices.taxes}}
                </td>
              </tr>
              <tr>
                <th scope="row" colspan="3" class="hidden pt-4 pl-6 pr-3 text-sm font-normal text-right text-slate-700 sm:table-cell md:pl-0">
                  Total
                </th>
                <th scope="row" class="pt-4 pl-4 pr-3 text-sm font-normal text-left text-slate-700 sm:hidden">
                  Total
                </th>
                <td class="pt-4 pl-3 pr-4 text-sm font-normal text-right text-slate-700 sm:pr-6 md:pr-0">
                  {{prices.total}}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {{#if showTerms}}
      <div class="mt-48 p-9">
        <div class="border-t pt-9 border-slate-200">
          <div class="text-sm font-light text-slate-700">
            <p>
              Payment terms set by Transactional are 14 days. It is crucial to understand that pursuant to the Settlement of Late Payments for Unsecured Debts Act 0000, independent contractors have the right to take action in the event of non-payment after this period. An updated invoice will be issued if the payment is not received within an additional 14 days. Subsequently, if the payment for the revised invoice is not made within another 14 days, further interest will be applied to the overdue amount at a statutory rate of 8%. It is not possible for parties to circumvent the provisions of this legislation.
            </p>
          </div>
        </div>
      </div>
      {{/if}}
    </div>
  </article>
</div>
`;

export const RESUME_TEMPLATE = `<div class="max-w-4xl mx-auto">
<!-- Header -->
<header class="mb-4">
    <h1 class="text-4xl font-bold">Your Name</h1>
    <p class="text-lg font-semibold">Job Title</p>
    <p class="text-lg">Location</p>
</header>

<!-- Experience -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Experience</h2>
    <div class="mb-2">
        <h3 class="text-lg font-semibold">Job Title</h3>
        <p class="text-sm text-gray-700 mb-1">Company Name | Date</p>
        <p class="text-sm">Description of responsibilities and achievements.</p>
    </div>
    <!-- Add more experience items as needed -->
</section>

<!-- Education -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Education</h2>
    <div class="mb-2">
        <h3 class="text-lg font-semibold">Degree Name</h3>
        <p class="text-sm text-gray-700 mb-1">University Name | Date</p>
        <p class="text-sm">Additional details such as GPA, honors, etc.</p>
    </div>
    <!-- Add more education items as needed -->
</section>

<!-- Skills -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Skills</h2>
    <ul class="list-disc pl-6">
        <li class="mb-1">Skill 1</li>
        <li class="mb-1">Skill 2</li>
        <li class="mb-1">Skill 3</li>
        <!-- Add more skills as needed -->
    </ul>
</section>

<!-- Footer -->
<footer class="text-center text-sm text-gray-600 mt-4">
    <p>&copy; 2024 Your Name. All rights reserved.</p>
</footer>
</div>`;

export const PORTFOLIO_TEMPLATE = `<div class="max-w-4xl mx-auto">
<!-- Header -->
<header class="mb-4">
    <h1 class="text-4xl font-bold">Your Name</h1>
    <p class="text-lg font-semibold">Job Title</p>
    <p class="text-lg">Location</p>
</header>

<!-- Projects -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Projects</h2>
    <div class="mb-2">
        <h3 class="text-lg font-semibold">Project Title</h3>
        <p class="text-sm text-gray-700 mb-1">Date | Client/Company Name</p>
        <p class="text-sm">Description of the project and your role.</p>
    </div>
    <!-- Add more project items as needed -->
</section>

<!-- Skills -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Skills</h2>
    <ul class="list-disc pl-6">
        <li class="mb-1">Skill 1</li>
        <li class="mb-1">Skill 2</li>
        <li class="mb-1">Skill 3</li>
        <!-- Add more skills as needed -->
    </ul>
</section>

<!-- Contact -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Contact</h2>
    <p class="text-lg">Email | Phone</p>
    <p class="text-lg">LinkedIn | GitHub | Personal Website</p>
</section>

<!-- Footer -->
<footer class="text-center text-sm text-gray-600 mt-4">
    <p>&copy; 2024 Your Name. All rights reserved.</p>
</footer>
</div>
`;

export const REPORT_TEMPLATE = `    <div class="max-w-4xl mx-auto">
<!-- Title -->
<header class="mb-4">
    <h1 class="text-4xl font-bold">Report Title</h1>
    <p class="text-lg font-semibold">Report Subtitle</p>
    <p class="text-lg">Date</p>
</header>

<!-- Introduction -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Introduction</h2>
    <p class="mb-2">Brief introduction to the report topic and purpose.</p>
    <p class="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada dolor.</p>
</section>

<!-- Analysis -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Analysis</h2>
    <p class="mb-2">Detailed analysis of findings and results.</p>
    <ul class="list-disc pl-6">
        <li class="mb-1">Point 1</li>
        <li class="mb-1">Point 2</li>
        <li class="mb-1">Point 3</li>
    </ul>
</section>

<!-- Conclusion -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Conclusion</h2>
    <p class="mb-2">Summary of key findings and recommendations.</p>
    <p class="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada dolor.</p>
</section>

<!-- Footer -->
<footer class="text-center text-sm text-gray-600 mt-4">
    <p>&copy; 2024 Your Name. All rights reserved.</p>
</footer>
</div>
`;

export const PROPOSAL_TEMPLATE = `<div class="max-w-4xl mx-auto">
<!-- Title -->
<header class="mb-4">
    <h1 class="text-4xl font-bold">Proposal Title</h1>
    <p class="text-lg font-semibold">Client Name | Date</p>
</header>

<!-- Executive Summary -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Executive Summary</h2>
    <p class="mb-2">Brief summary of the proposal, including key objectives.</p>
    <p class="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada dolor.</p>
</section>
 <section class="mb-4">
<h3 class="text-lg font-semibold mb-1">Service Offering 1</h3>
<p class="mb-2">Description of the service or solution.</p>
<ul class="list-disc pl-6">
    <li class="mb-1">Feature 1</li>
    <li class="mb-1">Feature 2</li>
    <li class="mb-1">Feature 3</li>
</ul>
</section>

<!-- Budget -->
<section class="mb-4">
<h2 class="text-2xl font-semibold mb-2">Budget</h2>
<table class="w-full mb-2">
    <thead>
        <tr>
            <th class="border px-4 py-2">Item</th>
            <th class="border px-4 py-2">Cost</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="border px-4 py-2">Item 1</td>
            <td class="border px-4 py-2">$1000</td>
        </tr>
        <tr>
            <td class="border px-4 py-2">Item 2</td>
            <td class="border px-4 py-2">$1500</td>
        </tr>
        <tr>
            <td class="border px-4 py-2">Item 3</td>
            <td class="border px-4 py-2">$800</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td class="border px-4 py-2 font-semibold">Total</td>
            <td class="border px-4 py-2 font-semibold">$3300</td>
        </tr>
    </tfoot>
</table>
</section>

<!-- Terms and Conditions -->
<section class="mb-4">
<h2 class="text-2xl font-semibold mb-2">Terms and Conditions</h2>
<p class="mb-2">Terms and conditions of the proposal.</p>
<p class="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada dolor.</p>
</section>

<!-- Contact Information -->
<section class="mb-4">
<h2 class="text-2xl font-semibold mb-2">Contact Information</h2>
<p class="mb-2">Email | Phone</p>
<p class="mb-2">LinkedIn | GitHub | Personal Website</p>
</section>

<!-- Footer -->
<footer class="text-center text-sm text-gray-600 mt-4">
<p>&copy; 2024 Your Name. All rights reserved.</p>
</footer>
</div>`;

export const EVENT_TEMPLATE = ` <div class="max-w-4xl mx-auto">
<!-- Title -->
<header class="mb-4">
    <h1 class="text-4xl font-bold">Event Title</h1>
    <p class="text-lg font-semibold">Event Date | Location</p>
</header>

<!-- Schedule -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Event Schedule</h2>
    <table class="w-full mb-2">
        <thead>
            <tr>
                <th class="border px-4 py-2">Time</th>
                <th class="border px-4 py-2">Activity</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="border px-4 py-2">9:00 AM</td>
                <td class="border px-4 py-2">Registration</td>
            </tr>
            <tr>
                <td class="border px-4 py-2">10:00 AM</td>
                <td class="border px-4 py-2">Opening Keynote</td>
            </tr>
            <tr>
                <td class="border px-4 py-2">12:00 PM</td>
                <td class="border px-4 py-2">Lunch Break</td>
            </tr>
            <tr>
                <td class="border px-4 py-2">2:00 PM</td>
                <td class="border px-4 py-2">Panel Discussion</td>
            </tr>
            <tr>
                <td class="border px-4 py-2">4:00 PM</td>
                <td class="border px-4 py-2">Closing Remarks</td>
            </tr>
        </tbody>
    </table>
</section>

<!-- Speakers -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Speakers</h2>
    <div class="mb-2">
        <h3 class="text-lg font-semibold">Speaker Name</h3>
        <p class="mb-1">Job Title</p>
        <p class="mb-1">Company</p>
        <p class="mb-2">Topic of Presentation</p>
    </div>
    <!-- Add more speakers as needed -->
</section>

<!-- Contact Information -->
<section class="mb-4">
    <h2 class="text-2xl font-semibold mb-2">Contact Information</h2>
    <p class="mb-2">Email | Phone</p>
    <p class="mb-2">Event Website | Social Media Links</p>
</section>

<!-- Footer -->
<footer class="text-center text-sm text-gray-600 mt-4">
    <p>&copy; 2024 Your Name. All rights reserved.</p>
</footer>
</div> `;
