declare module '@/app/lib/placeholder-data.js' {
  const placeholderData: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      password: string;
    }>;
    customers: Array<{
      id: string;
      name: string;
      email: string;
      image_url: string;
    }>;
    invoices: Array<{
      customer_id: string;
      amount: number;
      status: 'pending' | 'paid';
      date: string;
    }>;
    revenue: Array<{
      month: string;
      revenue: number;
    }>;
  };

  export default placeholderData;
}
