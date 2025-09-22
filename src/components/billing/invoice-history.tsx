'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Receipt, Download, ExternalLink, FileText } from 'lucide-react'

interface Invoice {
  id: string
  number: string | null
  status: string
  amount_paid: number
  amount_due: number
  currency: string
  created: Date
  due_date: Date | null
  pdf_url: string | null
  hosted_url: string | null
}

interface InvoiceHistoryProps {
  invoices: Invoice[]
}

export function InvoiceHistory({ invoices }: InvoiceHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100) // Stripe amounts are in cents
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice History
          </CardTitle>
          <CardDescription>
            Your billing history and downloadable invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-muted-foreground">
              Your invoice history will appear here once you have an active subscription.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Invoice History
        </CardTitle>
        <CardDescription>
          View and download your billing invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {invoice.number || `Invoice ${invoice.id.substring(0, 8)}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {invoice.id}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(invoice.created)}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {formatAmount(invoice.amount_paid || invoice.amount_due, invoice.currency)}
                    </div>
                    {invoice.amount_due > 0 && invoice.status !== 'paid' && (
                      <div className="text-xs text-red-600">
                        {formatAmount(invoice.amount_due, invoice.currency)} due
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {invoice.pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(invoice.pdf_url!, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    )}
                    {invoice.hosted_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(invoice.hosted_url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {invoices.filter(i => i.status === 'paid').length}
              </div>
              <div className="text-muted-foreground">Paid Invoices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatAmount(
                  invoices
                    .filter(i => i.status === 'paid')
                    .reduce((sum, i) => sum + (i.amount_paid || 0), 0),
                  invoices[0]?.currency || 'usd'
                )}
              </div>
              <div className="text-muted-foreground">Total Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {invoices.filter(i => i.status === 'open').length}
              </div>
              <div className="text-muted-foreground">Open Invoices</div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">Invoice Help</div>
              <div className="text-blue-700 space-y-1">
                <div>• Download PDFs for your accounting records</div>
                <div>• View detailed breakdowns by clicking "View"</div>
                <div>• Contact support if you have questions about any invoice</div>
                <div>• All amounts are automatically calculated including applicable taxes</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}