import placeholderData from '@/app/lib/placeholder-data.js';
import type {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  Revenue,
  User,
} from './definitions';
import { formatCurrency } from './utils';

type PlaceholderCustomer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

type PlaceholderInvoice = {
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
  date: string;
};

const {
  customers: placeholderCustomers,
  invoices: placeholderInvoices,
  revenue: placeholderRevenue,
  users: placeholderUsers,
} = placeholderData as {
  customers: PlaceholderCustomer[];
  invoices: PlaceholderInvoice[];
  revenue: Revenue[];
  users: User[];
};

const customersById = new Map(
  placeholderCustomers.map((customer) => [customer.id, customer]),
);

const globalForSample = globalThis as typeof globalThis & {
  sampleInvoices?: InvoicesTable[];
};

function createInitialInvoices(): InvoicesTable[] {
  return placeholderInvoices.map((invoice, index) => {
    const customer = customersById.get(invoice.customer_id);
    return {
      id: `sample-invoice-${index}`,
      customer_id: invoice.customer_id,
      name: customer?.name ?? 'Unknown',
      email: customer?.email ?? '',
      image_url: customer?.image_url ?? '',
      date: invoice.date,
      amount: invoice.amount,
      status: invoice.status,
    };
  });
}

function getSampleInvoices() {
  globalForSample.sampleInvoices ??= createInitialInvoices();
  return globalForSample.sampleInvoices;
}

function setSampleInvoices(next: InvoicesTable[]) {
  globalForSample.sampleInvoices = next;
}

function withCustomer(
  customerId: string,
  fields: Pick<InvoicesTable, 'id' | 'amount' | 'date' | 'status'>,
): InvoicesTable {
  const customer = customersById.get(customerId);
  return {
    ...fields,
    customer_id: customerId,
    name: customer?.name ?? 'Unknown',
    email: customer?.email ?? '',
    image_url: customer?.image_url ?? '',
  };
}

function matchesQuery(invoice: InvoicesTable, query: string) {
  const q = query.toLowerCase();
  if (!q) return true;
  return (
    invoice.name.toLowerCase().includes(q) ||
    invoice.email.toLowerCase().includes(q) ||
    invoice.amount.toString().includes(q) ||
    invoice.date.includes(q) ||
    invoice.status.toLowerCase().includes(q)
  );
}

export const ITEMS_PER_PAGE = 6;

export function sampleRevenue(): Revenue[] {
  return placeholderRevenue;
}

export function sampleLatestInvoices(): LatestInvoice[] {
  return [...getSampleInvoices()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((invoice) => ({
      id: invoice.id,
      name: invoice.name,
      image_url: invoice.image_url,
      email: invoice.email,
      amount: formatCurrency(invoice.amount),
    }));
}

export function sampleCardData() {
  const invoices = getSampleInvoices();
  const numberOfInvoices = invoices.length;
  const numberOfCustomers = placeholderCustomers.length;
  const totalPaid = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPending = invoices
    .filter((invoice) => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices: formatCurrency(totalPaid),
    totalPendingInvoices: formatCurrency(totalPending),
  };
}

export function sampleFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  return getSampleInvoices()
    .filter((invoice) => matchesQuery(invoice, query))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(offset, offset + ITEMS_PER_PAGE);
}

export function sampleInvoicesPages(query: string) {
  const count = getSampleInvoices().filter((invoice) =>
    matchesQuery(invoice, query),
  ).length;
  return Math.ceil(count / ITEMS_PER_PAGE);
}

export function sampleInvoiceById(id: string): InvoiceForm | undefined {
  const invoice = getSampleInvoices().find((item) => item.id === id);
  if (!invoice) return undefined;
  return {
    id: invoice.id,
    customer_id: invoice.customer_id,
    amount: invoice.amount / 100,
    status: invoice.status,
  };
}

export function sampleCustomers(): CustomerField[] {
  return [...placeholderCustomers]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, name }) => ({ id, name }));
}

export function sampleFilteredCustomers(query: string) {
  const q = query.toLowerCase();
  const rows: CustomersTableType[] = placeholderCustomers
    .filter(
      (customer) =>
        !q ||
        customer.name.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q),
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((customer) => {
      const customerInvoices = getSampleInvoices().filter(
        (invoice) => invoice.customer_id === customer.id,
      );
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
        total_invoices: customerInvoices.length,
        total_pending: customerInvoices
          .filter((invoice) => invoice.status === 'pending')
          .reduce((sum, invoice) => sum + invoice.amount, 0),
        total_paid: customerInvoices
          .filter((invoice) => invoice.status === 'paid')
          .reduce((sum, invoice) => sum + invoice.amount, 0),
      };
    });

  return rows.map((customer) => ({
    ...customer,
    total_pending: formatCurrency(customer.total_pending),
    total_paid: formatCurrency(customer.total_paid),
  }));
}

export function sampleUser(email: string): User | undefined {
  return placeholderUsers.find((user) => user.email === email);
}

export function createSampleInvoice(input: {
  customerId: string;
  amount: number;
  status: 'pending' | 'paid';
  date: string;
}) {
  const invoice = withCustomer(input.customerId, {
    id: `sample-invoice-${Date.now()}`,
    amount: input.amount,
    date: input.date,
    status: input.status,
  });
  setSampleInvoices([invoice, ...getSampleInvoices()]);
  return invoice;
}

export function updateSampleInvoice(
  id: string,
  input: {
    customerId: string;
    amount: number;
    status: 'pending' | 'paid';
  },
) {
  const invoices = getSampleInvoices();
  const index = invoices.findIndex((invoice) => invoice.id === id);
  if (index === -1) {
    return false;
  }

  invoices[index] = withCustomer(input.customerId, {
    id,
    amount: input.amount,
    date: invoices[index].date,
    status: input.status,
  });
  return true;
}

export function deleteSampleInvoice(id: string) {
  const invoices = getSampleInvoices();
  const next = invoices.filter((invoice) => invoice.id !== id);
  if (next.length === invoices.length) {
    return false;
  }
  setSampleInvoices(next);
  return true;
}
