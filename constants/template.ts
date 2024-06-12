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
              <p><%= fromCompany.name %></p>
              <p><%= fromCompany.street %></p>
              <p><%= fromCompany.city %>, <%= fromCompany.country %></p>
              <p><%= fromCompany.zip %></p>
            </div>
            <div class="text-sm font-light text-slate-500">
              <p class="text-sm font-normal text-slate-700">Billed To</p>
              <p><%= toCompany.name %></p>
              <p><%= toCompany.street %></p>
              <p><%= toCompany.city %>, <%= toCompany.country %></p>
              <p><%= toCompany.zip %></p>
            </div>
            <div class="text-sm font-light text-slate-500">
              <p class="text-sm font-normal text-slate-700">Invoice Number</p>
              <p><%= invoiceNumber %></p>

              <p class="mt-2 text-sm font-normal text-slate-700">
                Date of Issue
              </p>
              <p><%= issueDate %></p>
            </div>
            <div class="text-sm font-light text-slate-500">
              <p class="text-sm font-normal text-slate-700">Due</p>
              <p><%= dueDate %></p>
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

              <% items.forEach(function(item) { %>
              <tr class="border-b border-slate-200">
                <td class="py-4 pl-4 pr-3 text-sm sm:pl-6 md:pl-0">
                  <div class="font-medium text-slate-700"><%= item.name %></div>
                </td>
                <td class="hidden px-3 py-4 text-sm text-right text-slate-500 sm:table-cell">
                  <%= item.quantity %>
                </td>
                <td class="hidden px-3 py-4 text-sm text-right text-slate-500 sm:table-cell">
                  <%= item.taxes %>
                </td>
                <td class="py-4 pl-3 pr-4 text-sm text-right text-slate-500 sm:pr-6 md:pr-0">
                  <%= item.price %>
                </td>
              </tr>
              <% }); %>

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
                  <%= prices.subtotal %>
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
                  <%= prices.discount %>
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
                  <%= prices.taxes %>
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
                  <%= prices.total %>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <% if (showTerms) { %>
      <div class="mt-48 p-9">
        <div class="border-t pt-9 border-slate-200">
          <div class="text-sm font-light text-slate-700">
            <p>
              Payment terms set by Transactional are 14 days. It is crucial to understand that pursuant to the Settlement of Late Payments for Unsecured Debts Act 0000, independent contractors have the right to take action in the event of non-payment after this period. An updated invoice will be issued if the payment is not received within an additional 14 days. Subsequently, if the payment for the revised invoice is not made within another 14 days, further interest will be applied to the overdue amount at a statutory rate of 8%. It is not possible for parties to circumvent the provisions of this legislation.
            </p>
          </div>
        </div>
      </div>
      <% } %>
    </div>
  </article>
</div>

`;
