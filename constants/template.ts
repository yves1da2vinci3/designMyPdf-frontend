export const DEFAULT_TEMPLATE = `
<div class="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
  <div class="flex justify-between items-center border-b pb-3">
    <h2 class="text-xl font-bold">Receipt</h2>
    <span class="text-sm">Date: <%= date %></span>
  </div>

  <div class="mt-4">
    <div class="flex justify-between border-b py-2">
      <span class="font-semibold">Item</span>
      <span class="font-semibold">Price</span>
    </div>

    <% items.forEach(item => { %>
    <div class="flex justify-between py-2">
      <span><%= item.name %></span>
      <span>$<%= item.price.toFixed(2) %></span>
    </div>
    <% }); %>

    <div class="mt-4 border-t pt-2 flex justify-between">
      <span class="font-bold">Total</span>
      <span class="font-bold">$<%= total.toFixed(2) %></span>
    </div>
  </div>

  <div class="mt-6 text-center border-t pt-4 text-sm">
    <p>Thank you for your purchase!</p>
    <p>For any inquiries, please contact us at <a href="mailto:<%= contactEmail %>" class="text-blue-500"><%= contactEmail %></a></p>
  </div>
</div>
`;
