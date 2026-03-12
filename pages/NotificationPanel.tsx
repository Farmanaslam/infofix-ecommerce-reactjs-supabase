import React, { useMemo, useState } from "react";
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle2,
  AlertCircle,
  Flame,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";
import { useStore } from "../context/StoreContext";

export const NotificationPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    notifications,
    currentUser,
    markAllNotificationsRead,
    clearNotifications,
  } = useStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Role-based visibility
  const visible = useMemo(() => {
    if (!currentUser || currentUser.role === "CUSTOMER") return [];
    return notifications.filter((n) => {
      if (currentUser.role === "ADMIN") return true;
      if (currentUser.role === "MANAGER")
        return ["MANAGER", "INVENTORY", "CUSTOMER"].includes(n.user_role);
      if (currentUser.role === "INVENTORY") return n.user_id === currentUser.id;
      return false;
    });
  }, [notifications, currentUser]);

  const filtered = useMemo(
    () =>
      filter === "unread"
        ? visible.filter((n) => !n.read_by.includes(currentUser?.id ?? ""))
        : visible,
    [visible, filter, currentUser],
  );

  const unreadCount = useMemo(
    () =>
      visible.filter((n) => !n.read_by.includes(currentUser?.id ?? "")).length,
    [visible, currentUser],
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <Flame size={16} className="text-white" />;
      case "warning":
        return <AlertCircle size={16} className="text-white" />;
      case "success":
        return <CheckCircle2 size={16} className="text-white" />;
      default:
        return <Info size={16} className="text-white" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "urgent":
        return "bg-rose-500";
      case "warning":
        return "bg-amber-500";
      case "success":
        return "bg-emerald-500";
      default:
        return "bg-indigo-500";
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-600";
      case "MANAGER":
        return "bg-purple-100 text-purple-600";
      case "INVENTORY":
        return "bg-orange-100 text-orange-600";
      case "CUSTOMER":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col bg-white shadow-2xl"
        style={{ boxShadow: "-8px 0 40px rgba(15,23,42,0.18)" }}
      >
        {/* ── HEADER ── */}
        <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-indigo-600 to-violet-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <Bell size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight">
                  Notifications
                </h2>
                <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-widest">
                  System Activity Feed
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-black text-white">{visible.length}</p>
              <p className="text-[9px] text-indigo-200 uppercase tracking-wider font-bold">
                Total
              </p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-black text-white">{unreadCount}</p>
              <p className="text-[9px] text-indigo-200 uppercase tracking-wider font-bold">
                Unread
              </p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
              <p className="text-lg font-black text-white">
                {visible.filter((n) => n.type === "urgent").length}
              </p>
              <p className="text-[9px] text-indigo-200 uppercase tracking-wider font-bold">
                Urgent
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTROLS ── */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
          {/* Filter tabs */}
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                  filter === f
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAllNotificationsRead()}
              className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
            >
              <CheckCheck size={13} /> Read All
            </button>
            <span className="w-px h-3 bg-slate-200" />
            <button
              onClick={() => clearNotifications()}
              className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-wider transition-colors"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        {/* ── LIST ── */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/40">
          {filtered.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Bell size={28} className="text-indigo-200" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  All caught up
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  No notifications yet
                </p>
              </div>
            </div>
          ) : (
            filtered.map((n) => {
              const isRead = n.read_by.includes(currentUser?.id ?? "");
              return (
                <div
                  key={n.id}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    isRead
                      ? "bg-white border-slate-100 opacity-60"
                      : "bg-white border-indigo-100 shadow-sm ring-1 ring-indigo-50/80"
                  }`}
                >
                  {!isRead && (
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${getBg(n.type)}`}
                    >
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title + role badge */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className={`text-sm font-bold leading-tight ${isRead ? "text-slate-500" : "text-slate-900"}`}
                        >
                          {n.title}
                        </p>
                        <span
                          className={`text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${getRoleBadgeColor(n.user_role)}`}
                        >
                          {n.user_role}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">
                        {n.message}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <User size={9} />
                          <span className="font-bold">{n.user_name}</span>
                          <span className="mx-1">·</span>
                          <Clock size={9} />
                          <span>
                            {new Date(n.created_at).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white">
          <p className="text-[9px] text-slate-300 text-center font-bold uppercase tracking-widest">
            Infofix · Staff Activity Feed · Realtime
          </p>
        </div>
      </div>
    </>
  );
};
