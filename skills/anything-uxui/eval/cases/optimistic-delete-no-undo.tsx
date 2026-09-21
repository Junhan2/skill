// Invoice list for the billing screen.
import { useOptimistic, useState } from 'react';

type Invoice = { id: string; number: string; amountCents: number };

export function InvoiceList({ initial }: { initial: Invoice[] }) {
  const [invoices, setInvoices] = useState(initial);
  const [optimisticInvoices, removeOptimistic] = useOptimistic(
    invoices,
    (current: Invoice[], removedId: string) => current.filter((i) => i.id !== removedId),
  );

  async function handleDelete(id: string) {
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    removeOptimistic(id);

    if (res.ok) {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    }
  }

  return (
    <table>
      <tbody>
        {optimisticInvoices.map((invoice) => (
          <tr key={invoice.id}>
            <td>{invoice.number}</td>
            <td>{(invoice.amountCents / 100).toFixed(2)}</td>
            <td>
              <button
                type="button"
                onClick={() => handleDelete(invoice.id)}
                style={{ minHeight: 44, minWidth: 44 }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
