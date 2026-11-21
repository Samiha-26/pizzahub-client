"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  Ban,
  Crown,
  ArrowLeft,
  Loader2,
  RefreshCw,
  UserCheck,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import {
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  type AdminUser,
} from "@/lib/api";

export default function AdminUsersPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const currentUser = session?.user as any;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsers({
        search,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(data);
    } catch {
      toast.error("Failed to load platform user accounts");
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    } else if (!isSessionPending) {
      setIsLoading(false);
    }
  }, [currentUser?.role, isSessionPending, fetchUsers]);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "blocked" : "active";
    setActionLoadingId(userId);
    try {
      await updateUserStatus(userId, nextStatus as any);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: nextStatus as any } : u))
      );
      toast.success(
        nextStatus === "blocked"
          ? "Account suspended from placing orders and managing recipes"
          : "Account successfully reactivated"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to change user status";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoadingId(userId);
    try {
      await updateUserRole(userId, newRole as any);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isSessionPending || (isLoading && currentUser?.role === "admin" && users.length === 0)) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
          <p className="text-sm font-semibold text-[#6E5F5B]">Loading platform accounts...</p>
        </div>
      </main>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-24 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#EBE4D8] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-2xl font-black">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#190F0E]">Admin Authorization Required</h2>
          <p className="text-sm text-[#6E5F5B]">
            User governance is restricted to platform administrators. Please sign in with an admin account.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-[#190F0E] text-white font-bold text-sm hover:bg-black transition-colors"
          >
            Sign In with Admin Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-6">
          <div className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8E1616] hover:underline uppercase tracking-wider mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Operations Console
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold w-fit">
              <Users className="w-3.5 h-3.5" />
              User Governance
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#190F0E] tracking-tight">
              Platform Accounts &amp; Permissions
            </h1>
            <p className="text-sm text-[#6E5F5B] max-w-2xl">
              Search all registered users, manage role assignments between customer and pizzeria partner, and suspend non-compliant accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#EBE4D8] text-xs font-bold text-[#190F0E] hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#EBE4D8] shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E5F5B]" />
              <input
                type="text"
                placeholder="Search by name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE4D8] text-xs font-bold text-[#190F0E] placeholder:text-[#6E5F5B]/70 focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#6E5F5B]" />
                <span className="text-xs font-bold text-[#6E5F5B]">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] text-xs font-bold text-[#190F0E] focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="vendor">Pizzeria Partners</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#6E5F5B]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] text-xs font-bold text-[#190F0E] focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="blocked">Suspended Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#EBE4D8]">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EBE4D8] text-[#6E5F5B] uppercase tracking-wider text-[10px] font-black">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Tier</th>
                  <th className="py-3.5 px-4">Role Assignment</th>
                  <th className="py-3.5 px-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE4D8] bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#6E5F5B]">
                      No user accounts match the selected filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isBusy = actionLoadingId === u.id;
                    const isVendor = u.role === "vendor";
                    const isPremium = u.subscriptionTier === "premium";

                    return (
                      <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {u.image ? (
                              <img
                                src={u.image}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover border border-[#EBE4D8]"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#8E1616] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <div className="font-bold text-[#190F0E]">{u.name}</div>
                              <div className="text-[11px] text-[#6E5F5B]">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {u.role === "admin" && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-purple-100 text-purple-700">
                              Admin
                            </span>
                          )}
                          {u.role === "vendor" && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                              {isPremium && <Crown className="w-3 h-3 fill-amber-500 text-amber-600" />}
                              Vendor
                            </span>
                          )}
                          {u.role === "customer" && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-[#6E5F5B]">
                              Customer
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {u.status === "active" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[11px]">
                              <Ban className="w-3 h-3" />
                              Blocked
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isVendor ? (
                            isPremium ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300 font-bold text-[11px]">
                                <Crown className="w-3 h-3 fill-amber-500 text-amber-600" />
                                Master Baker
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#6E5F5B] font-semibold">
                                Free Artisan
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] text-[#6E5F5B]/60">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            disabled={isBusy || u.id === currentUser?.id}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="px-2.5 py-1 rounded-xl bg-white border border-[#EBE4D8] text-xs font-bold text-[#190F0E] focus:outline-none focus:ring-2 focus:ring-[#8E1616] disabled:opacity-50 cursor-pointer"
                          >
                            <option value="customer">Customer</option>
                            <option value="vendor">Pizzeria Partner</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            disabled={isBusy || u.id === currentUser?.id}
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 ${
                              u.status === "active"
                                ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                            }`}
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : u.status === "active" ? (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Activate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
