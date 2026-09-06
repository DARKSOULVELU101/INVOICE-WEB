import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { InvoiceWithRelations } from "@/types";
import { formatCurrency } from "@/core/lib/utils";
import { statusLabel } from "@/core/lib/invoice-status";

const BRAND = {
  primary: "#39489D",
  ink: "#232231",
  muted: "#56536A",
  line: "#E4E1EE",
  bg: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: BRAND.bg,
    paddingVertical: 48,
    paddingHorizontal: 52,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: BRAND.ink,
  },
  // Header
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 8 },
  brandName: { fontWeight: "bold", fontSize: 15, color: BRAND.ink },
  brandStudio: { fontSize: 6.5, letterSpacing: 1.4, color: BRAND.muted, marginTop: 2 },
  docTitle: { textAlign: "right" },
  docTitleText: {
    fontWeight: "bold",
    fontSize: 20,
    color: BRAND.primary,
  },
  status: {
    marginTop: 6,
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  rule: { height: 2, backgroundColor: BRAND.primary, marginVertical: 16, opacity: 0.9 },
  // Parties
  parties: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  block: { flex: 1 },
  blockRight: { flex: 1, alignItems: "flex-end", textAlign: "right" },
  label: { fontSize: 7.5, letterSpacing: 1.2, color: BRAND.muted, marginBottom: 5, fontWeight: 600 },
  name: { fontSize: 11, fontWeight: 700, marginBottom: 3 },
  sub: { fontSize: 9, color: BRAND.muted, lineHeight: 1.5 },
  strong: { color: BRAND.ink },
  // Meta table
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  metaCell: { flex: 1 },
  metaBody: { padding: 10, backgroundColor: "#F7F5FB", borderRadius: 6 },
  metaLabel: { fontSize: 7, letterSpacing: 1, color: BRAND.muted, marginBottom: 3 },
  metaValue: { fontSize: 10.5, fontWeight: 600 },
  // Items
  itemsHeader: { flexDirection: "row", backgroundColor: BRAND.primary, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 10 },
  itemsHeaderText: { color: "#fff", fontSize: 8, fontWeight: 700, letterSpacing: 0.6 },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: BRAND.line },
  itemDesc: { flex: 5 },
  itemQty: { flex: 1.1, textAlign: "center" },
  itemPrice: { flex: 1.6, textAlign: "right" },
  itemAmt: { flex: 1.6, textAlign: "right", fontWeight: 600 },
  descMain: { fontSize: 9.5, fontWeight: 600 },
  descSub: { fontSize: 8.2, color: BRAND.muted, marginTop: 2 },
  // Totals
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totals: { width: 240 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLineText: { fontSize: 9, color: BRAND.muted },
  totalLineValue: { fontSize: 9, fontWeight: 600 },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, backgroundColor: BRAND.ink, borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12 },
  grandTotalLabel: { color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 },
  grandTotalValue: { color: "#fff", fontSize: 14, fontWeight: 700 },
  // Footer
  footer: { marginTop: 26, paddingTop: 16, borderTopWidth: 1, borderTopColor: BRAND.line, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: BRAND.muted, lineHeight: 1.6 },
  footerBrand: { textAlign: "right", fontSize: 7.5, color: BRAND.muted },
  accent: { color: BRAND.primary },
  sectionGap: { marginBottom: 6 },
  notes: { fontSize: 8.5, color: BRAND.muted, lineHeight: 1.6 },
});

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#85809A",
  PENDING: "#A86F2C",
  SENT: "#4A5FB6",
  PARTIALLY_PAID: "#8F7BE0",
  PAID: "#3E9D7B",
  OVERDUE: "#B84454",
  CANCELLED: "#A9A4BC",
};

function invoiceTitle(inv: InvoiceWithRelations) {
  if (inv.type === "PROFORMA") return "PROFORMA INVOICE";
  if (inv.type === "ESTIMATE") return "ESTIMATE";
  if (inv.type === "RETAIL") return "RETAIL INVOICE";
  return "INVOICE";
}

export function InvoiceDocument({ invoice }: { invoice: InvoiceWithRelations }) {
  const currency = invoice.currency || invoice.business.defaultCurrency || "USD";
  const title = invoiceTitle(invoice);
  const status = statusLabel(invoice.status);

  return (
    <Document
      title={`${title} ${invoice.number}`}
      author={invoice.business.name}
      subject={`Invoice ${invoice.number}`}
    >
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            {invoice.business.logo ? (
              <Image src={invoice.business.logo} style={styles.logo} />
            ) : (
              <View style={[styles.logo, { backgroundColor: BRAND.primary, alignItems: "center", justifyContent: "center" }]}>
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
                  {(invoice.business.name || "GV").slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.brandName}>{invoice.business.name}</Text>
              <Text style={styles.brandStudio}>GENVOUCH TECHNOLOGIES PVT</Text>
            </View>
          </View>
          <View style={styles.docTitle}>
            <Text style={styles.docTitleText}>{title}</Text>
            <View style={styles.status}>
              <Text style={{ color: STATUS_COLORS[invoice.status] }}>{status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.rule} />

        {/* PARTIES */}
        <View style={styles.parties}>
          <View style={styles.block}>
            <Text style={styles.label}>FROM</Text>
            <Text style={styles.name}>{invoice.business.legalName || invoice.business.name}</Text>
            {invoice.business.email ? <Text style={styles.sub}>{invoice.business.email}</Text> : null}
            {invoice.business.phone ? <Text style={styles.sub}>{invoice.business.phone}</Text> : null}
            {invoice.business.addressLine1 ? (
              <Text style={styles.sub}>
                {[invoice.business.addressLine1, invoice.business.addressLine2].filter(Boolean).join(", ")}
              </Text>
            ) : null}
            {(invoice.business.city || invoice.business.country) ? (
              <Text style={styles.sub}>
                {[
                  invoice.business.city,
                  invoice.business.state,
                  invoice.business.postalCode,
                  invoice.business.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            ) : null}
            {invoice.business.taxId ? (
              <Text style={styles.sub}>Tax ID: {invoice.business.taxId}</Text>
            ) : null}
          </View>
          <View style={styles.blockRight}>
            <Text style={styles.label}>BILL TO</Text>
            <Text style={styles.name}>{invoice.customer.company || invoice.customer.name || "Customer"}</Text>
            {invoice.customer.company ? <Text style={styles.sub}>{invoice.customer.name}</Text> : null}
            {invoice.customer.email ? <Text style={styles.sub}>{invoice.customer.email}</Text> : null}
            {invoice.customer.phone ? <Text style={styles.sub}>{invoice.customer.phone}</Text> : null}
            {invoice.customer.addressLine1 ? (
              <Text style={styles.sub}>
                {[invoice.customer.addressLine1, invoice.customer.addressLine2].filter(Boolean).join(", ")}
              </Text>
            ) : null}
            {(invoice.customer.city || invoice.customer.country) ? (
              <Text style={styles.sub}>
                {[
                  invoice.customer.city,
                  invoice.customer.state,
                  invoice.customer.postalCode,
                  invoice.customer.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            ) : null}
            {invoice.customer.taxId ? (
              <Text style={styles.sub}>Tax ID: {invoice.customer.taxId}</Text>
            ) : null}
          </View>
        </View>

        {/* META */}
        <View style={styles.metaBody}>
          <View style={[styles.metaRow, { marginBottom: 0 }]}>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>INVOICE NO.</Text>
              <Text style={styles.metaValue}>{invoice.number}</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>DATE</Text>
              <Text style={styles.metaValue}>
                {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(invoice.issuedDate)}
              </Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>DUE DATE</Text>
              <Text style={styles.metaValue}>
                {invoice.dueDate
                  ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(invoice.dueDate)
                  : "—"}
              </Text>
            </View>
            {invoice.reference ? (
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>REFERENCE</Text>
                <Text style={styles.metaValue}>{invoice.reference}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ITEMS */}
        <View style={{ marginTop: 20 }}>
          <View style={styles.itemsHeader}>
            <Text style={[styles.itemsHeaderText, { flex: 5 }]}>DESCRIPTION</Text>
            <Text style={[styles.itemsHeaderText, styles.itemQty]}>QTY</Text>
            <Text style={[styles.itemsHeaderText, { flex: 1.6, textAlign: "right" }]}>RATE</Text>
            <Text style={[styles.itemsHeaderText, { flex: 1.6, textAlign: "right" }]}>AMOUNT</Text>
          </View>
          {invoice.lineItems.map((item, i) => (
            <View style={styles.itemRow} key={i} wrap={false}>
              <View style={styles.itemDesc}>
                <Text style={styles.descMain}>{item.description}</Text>
                {item.taxRate ? (
                  <Text style={styles.descSub}>Tax {item.taxRate}%</Text>
                ) : null}
              </View>
              <Text style={styles.itemQty}>{item.quantity}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.unitPrice, currency)}</Text>
              <Text style={styles.itemAmt}>{formatCurrency(item.amount, currency)}</Text>
            </View>
          ))}
        </View>

        {/* TOTALS */}
        <View style={styles.totalsRow}>
          <View style={styles.totals}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLineText}>Subtotal</Text>
              <Text style={styles.totalLineValue}>{formatCurrency(invoice.subtotal, currency)}</Text>
            </View>
            {invoice.discount > 0 ? (
              <View style={styles.totalLine}>
                <Text style={styles.totalLineText}>
                  Discount
                  {invoice.discountType === "percentage" ? ` (${invoice.discount}%)` : ""}
                </Text>
                <Text style={styles.totalLineValue}>
                  −{formatCurrency(0, currency)}
                </Text>
              </View>
            ) : null}
            <View style={styles.totalLine}>
              <Text style={styles.totalLineText}>Tax</Text>
              <Text style={styles.totalLineValue}>{formatCurrency(invoice.taxTotal, currency)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total, currency)}</Text>
            </View>
          </View>
        </View>

        {/* NOTES / TERMS */}
        {invoice.notes || invoice.terms ? (
          <View style={[styles.footer, { borderTopWidth: 0, paddingTop: 6, marginTop: 20 }]}>
            <View style={{ flex: 1, paddingRight: 24 }}>
              {invoice.notes ? (
                <View>
                  <Text style={styles.label}>NOTES</Text>
                  <Text style={styles.notes}>{invoice.notes}</Text>
                </View>
              ) : null}
              {invoice.terms ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>TERMS & CONDITIONS</Text>
                  <Text style={styles.notes}>{invoice.terms}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* PAYMENT DETAILS */}
        {invoice.business.upiId || invoice.business.bankAccountNo ? (
          <View style={[styles.footer, { marginTop: 14 }]}>
            <View style={{ flex: 1, paddingRight: 24 }}>
              <Text style={styles.label}>PAYMENT DETAILS</Text>
              <Text style={styles.footerText}>
                {invoice.business.upiId ? `UPI: ${invoice.business.upiId}` : ""}
                {invoice.business.bankName ? `Bank: ${invoice.business.bankName}` : ""}
                {invoice.business.bankAccountNo ? `  Account: ${invoice.business.bankAccountNo}` : ""}
                {invoice.business.bankIFSC ? `  IFSC: ${invoice.business.bankIFSC}` : ""}
              </Text>
            </View>
          </View>
        ) : null}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business.
          </Text>
          <Text style={styles.footerBrand}>
            Generated with <Text style={styles.accent}>GENVOUCH Invoice Studio</Text>
            {"\n"}Powered by GENVOUCH TECHNOLOGIES PVT
          </Text>
        </View>
      </Page>
    </Document>
  );
}
