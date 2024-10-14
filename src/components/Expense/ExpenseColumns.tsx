import { ColumnDef } from "@tanstack/react-table";
import { Expense } from "@/types/Expense";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export const expenseColumns: ColumnDef<Expense>[] = [
    {
        accessorKey: "id",
        header: "ID", // This is a string; no issue here.
        cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
        accessorKey: "date",
        // header: "Date", // This is a string; no issue here.
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div>{new Date(row.getValue("date")).toLocaleDateString()}</div>,
    },
    {
        accessorKey: "description",
        // header: "Description",
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Description
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
    {
        accessorKey: "amount",
        // header: "Amount", // This is a string; no issue here.
        header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Amount
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            return <div className="text-right font-medium">PKR {amount.toFixed(2)}</div>;
        },
    },
    {
        accessorKey: "paymentMethod",
        header: "Payment Method", // This is a string; no issue here.
        cell: ({ row }) => <div>{row.getValue("paymentMethod")}</div>,
    },
    {
        accessorKey: "actions",
        header: "Actions", // Add this header definition.
        cell: ({ row }) => {
            const expense = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(expense.id)}>
                            Copy Expense ID
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

