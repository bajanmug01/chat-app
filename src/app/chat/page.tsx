"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Avatar from "../../components/Avatar";

import Header from "../../components/Header";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

// Mock data for chat contacts
type ChatContact = {
  id: string;
  name: string;
  unreadCount: number;
  lastMessageTime: string;
  avatar?: string;
};

const data: ChatContact[] = [
  {
    id: "1",
    name: "John Doe",
    unreadCount: 3,
    lastMessageTime: "2023-03-07T10:30:00",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: "2",
    name: "Jane Smith",
    unreadCount: 0,
    lastMessageTime: "2023-03-06T15:45:00",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: "3",
    name: "Mike Johnson",
    unreadCount: 5,
    lastMessageTime: "2023-03-07T09:15:00",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: "4",
    name: "Sarah Williams",
    unreadCount: 1,
    lastMessageTime: "2023-03-05T18:20:00",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: "5",
    name: "David Brown",
    unreadCount: 0,
    lastMessageTime: "2023-03-04T11:10:00",
    avatar: "https://i.pravatar.cc/150?u=5",
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [open, setOpen] = React.useState(false);
  const [addContactOpen, setAddContactOpen] = React.useState(false);

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const columns: ColumnDef<ChatContact>[] = [
    {
      accessorKey: "name",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Avatar
            src={row.original.avatar}
            alt={`${String(row.getValue("name"))} avatar`}
            fallback={String(row.getValue("name"))}
            size="sm"
          />
          <div className="font-medium">{row.getValue("name")}</div>
        </div>
      ),
    },
    {
      accessorKey: "unreadCount",
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Unread
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const unreadCount = row.getValue("unreadCount");
        const unreadCountNumber = Number(unreadCount);
        return (
          <div className="flex justify-center">
            {unreadCountNumber > 0 ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                {unreadCountNumber}
              </div>
            ) : (
              <div className="h-6 w-6"></div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "lastMessageTime",
      header: ({ column }) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Last Message
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-right text-sm text-gray-500">
            {formatDate(row.getValue("lastMessageTime"))}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleRowClick = (contactId: string) => {
    router.push(`/chat/${contactId}`);
  };

  const handleContactSelect = (contactId: string) => {
    setOpen(false);
    router.push(`/chat/${contactId}`);
  };

  return (
    <ProtectedRoute>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setAddContactOpen(true)}
                className="rounded-full"
              >
                <UserPlus className="h-4 w-4" />
                <span className="sr-only">Add Contact</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setOpen(true)}
                className="rounded-full"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">New Chat</span>
              </Button>
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center py-4">
              <Input
                placeholder="Search contacts..."
                value={
                  table.getColumn("name")?.getFilterValue()?.toString() ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => handleRowClick(row.original.id)}
                        className="cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No chats found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>

      {/* Command Dialog for searching contacts */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search contacts..." />
        <CommandList>
          <CommandEmpty>No contacts found.</CommandEmpty>
          <CommandGroup heading="Contacts">
            {data.map((contact) => (
              <CommandItem
                key={contact.id}
                onSelect={() => handleContactSelect(contact.id)}
                className="flex items-center"
              >
                <Avatar
                  src={contact.avatar}
                  alt={`${contact.name} avatar`}
                  fallback={contact.name}
                  size="sm"
                />
                <span className="ml-2">{contact.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Dialog for adding new contacts (TODO for future) */}
      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              This feature will be implemented in the future.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setAddContactOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
