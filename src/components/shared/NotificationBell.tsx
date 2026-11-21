"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Clock, Flame, ShieldAlert, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const user = session?.user;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      if (!user?.email) return;
      try {
        const res = await fetch(`${apiBase}/api/notifications/${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.email, apiBase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`${apiBase}/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.email) return;
    try {
      await fetch(`${apiBase}/api/notifications/read-all/${encodeURIComponent(user.email)}`, {
        method: "PATCH",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-center text-[#190F0E] hover:bg-gray-100 transition cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#8E1616] text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-[#EFE7DE] shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE7DE]">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#8E1616]" />
              <span className="text-xs font-black uppercase tracking-wider text-[#190F0E]">
                Dispatch &amp; Hearth Alerts
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-[#8E1616] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6E5F5B]">
                No alerts at this moment. Hearth is operating smoothly!
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.read && handleMarkAsRead(n._id)}
                  className={`p-3 rounded-2xl border transition text-left cursor-pointer space-y-1 ${
                    n.read
                      ? "bg-white border-[#EFE7DE]/70 opacity-75"
                      : "bg-[#FAF7F2] border-[#8E1616]/30 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#190F0E] truncate pr-2">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#8E1616] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#423735] leading-relaxed">
                    {n.message}
                  </p>
                  <div className="text-[9px] text-[#6E5F5B] pt-0.5">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
