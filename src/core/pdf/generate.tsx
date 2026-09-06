import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "./InvoiceDocument";
import type { InvoiceWithRelations } from "@/types";

export async function generateInvoicePdf(invoice: InvoiceWithRelations): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument invoice={invoice} />);
}