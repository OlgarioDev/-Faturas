import { BadgeCheck, Clock, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const invoices = [
    {
        if: "FT 2024/001",
        client: "Tech Angola SA",
        amount: 450000,
        status: "Pago",
        date: "24 Jan 2024",
    },
    {
        if: "FT 2024/002",
        client: "Supermercado Luanda",
        amount: 120000,
        status: "Pendente",
        date: "23 Jan 2024",
    },
    {
        if: "FT 2024/003",
        client: "Consultoria Global",
        amount: 850000,
        status: "Pago",
        date: "22 Jan 2024",
    },
    {
        if: "FT 2024/004",
        client: "Transportes Silva",
        amount: 320000,
        status: "Anulado",
        date: "20 Jan 2024",
    },
    {
        if: "FT 2024/005",
        client: "Café Central",
        amount: 45000,
        status: "Pendente",
        date: "19 Jan 2024",
    },
];

export function RecentInvoices() {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Faturas Recentes</h3>
                <p className="text-sm text-muted-foreground">Últimas transações emitidas</p>
            </div>
            <div className="p-0">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Fatura
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Cliente
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Valor
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {invoices.map((invoice) => (
                                <tr
                                    key={invoice.if}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                >
                                    <td className="p-4 align-middle font-medium">
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {invoice.if}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">{invoice.client}</td>
                                    <td className="p-4 align-middle">
                                        {new Intl.NumberFormat("pt-AO", {
                                            style: "currency",
                                            currency: "AOA",
                                        }).format(invoice.amount)}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div
                                            className={cn(
                                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                                invoice.status === "Pago" &&
                                                "border-transparent bg-green-100 text-green-700 hover:bg-green-100/80",
                                                invoice.status === "Pendente" &&
                                                "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80",
                                                invoice.status === "Anulado" &&
                                                "border-transparent bg-red-100 text-red-700 hover:bg-red-100/80"
                                            )}
                                        >
                                            {invoice.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
