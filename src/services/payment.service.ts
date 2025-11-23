import tranzakt from '../utils/tranzakt.ts';

interface CreateInvoiceParams {
  amount: number;
  payerEmail: string;
  payerName: string;
  payerPhoneNumber?: string;
  userId?: string;
  creatorId?: string;
  paymentType?: 'course_purchase' | 'subscription' | 'content_access' | 'other';
  relatedItemId?: string;
}

export const createInvoice = async (data: CreateInvoiceParams) => {
  if (!data.amount || data.amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  if (!data.payerEmail || !data.payerName) {
    throw new Error('Payer email and name are required');
  }

  const body = {
    collectionId: process.env.TRANZAKT_COLLECTION_ID,
    title: 'Payment',
    payerName: data.payerName,
    payerEmail: data.payerEmail,
    payerPhoneNumber: data.payerPhoneNumber || '',
    amount: Number(data.amount),
    callBackUrl: `${process.env.API_URL}/api/v1/payment/webhook`,
    billerMetaData: {},
  };

  const res = await tranzakt.post('/api/v1/invoices', body);

  return res.data;
};
