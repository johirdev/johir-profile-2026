"use client";

import { AuthContext } from "@/app/admins/AuthProvider";
import { useState, useRef, useEffect, useContext } from "react";

const Icons = {
  Menu: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
  Bell: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
  Search: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  Logout: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
  Settings: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Order: () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
};

const notifications = [
  {
    id: 1,
    title: "New order #1042",
    time: "2 min ago",
    type: "order",
    unread: true,
  },
  {
    id: 2,
    title: "Order #1038 confirmed",
    time: "18 min ago",
    type: "confirm",
    unread: true,
  },
  {
    id: 3,
    title: "Order #1035 delivered",
    time: "1 hr ago",
    type: "delivery",
    unread: false,
  },
  {
    id: 4,
    title: "New admin registered",
    time: "3 hr ago",
    type: "admin",
    unread: false,
  },
];

interface NavbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export default function Navbar({
  onMenuToggle,
  pageTitle = "Dashboard",
}: NavbarProps) {
  const { token, adminData, logOut } = useContext(AuthContext);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 h-16"
      style={{
        background:
          "linear-gradient(180deg, #0f1729 0%, #111827 60%, #131921 100%)",
        borderBottom: "1px solid rgba(99,102,241,0.15)",
      }}
    >
      {/* Left — hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          aria-label="Toggle menu"
          onClick={onMenuToggle}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Icons.Menu />
        </button>

        <div>
          <h1
            className="text-white font-semibold text-lg leading-none"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Admin <span className="text-[#06B6D4]"> Panel</span>
          </h1>
        </div>
      </div>


      {/* Right — notifications + profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setNotifOpen((p) => !p);
              setProfileOpen(false);
            }}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-400 hover:text-white transition-all"
            style={{
              background: notifOpen
                ? "rgba(99,102,241,0.15)"
                : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(99,102,241,0.15)",
            }}
          >
            <Icons.Bell />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  background: "#6366f1",
                  fontSize: "9px",
                  boxShadow: "0 0 8px rgba(99,102,241,0.6)",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div
              className="absolute right-0 top-12 w-72 sm:w-80 rounded-2xl overflow-hidden z-50"
              style={{
                background: "#111827",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}
              >
                <p
                  className="text-white font-semibold text-sm"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  Notifications
                </p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: "rgba(99,102,241,0.2)",
                    color: "#a5b4fc",
                  }}
                >
                  {unreadCount} new
                </span>
              </div>
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background:
                          n.type === "order"
                            ? "rgba(99,102,241,0.2)"
                            : n.type === "confirm"
                              ? "rgba(34,197,94,0.15)"
                              : n.type === "delivery"
                                ? "rgba(59,130,246,0.15)"
                                : "rgba(168,85,247,0.15)",
                        color:
                          n.type === "order"
                            ? "#818cf8"
                            : n.type === "confirm"
                              ? "#4ade80"
                              : n.type === "delivery"
                                ? "#60a5fa"
                                : "#c084fc",
                      }}
                    >
                      <Icons.Order />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${n.unread ? "text-white font-medium" : "text-gray-400"}`}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {n.title}
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{n.time}</p>
                    </div>
                    {n.unread && (
                      <div
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ background: "#6366f1" }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div
                className="px-4 py-3 text-center"
                style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}
              >
                <button
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: "#6366f1",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className="w-px h-6 hidden sm:block"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen((p) => !p);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: profileOpen ? "rgba(99,102,241,0.15)" : "transparent",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                profileOpen ? "rgba(99,102,241,0.15)" : "transparent";
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 0 12px rgba(99,102,241,0.4)",
              }}
            >
              {adminData?.name?.slice(0, 1)?.toUpperCase() || "AD"}
            </div>
            <div className="hidden sm:block text-left">
              <p
                className="text-white text-sm font-medium leading-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {adminData?.name}
              </p>
              <p className="text-gray-500 text-xs mt-0.5"> {adminData?.role}</p>
            </div>
            <span className="text-gray-500 hidden sm:block">
              <Icons.ChevronDown />
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div
              className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden z-50"
              style={{
                background: "#111827",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid rgba(99,102,241,0.15)" }}
              >
                <p
                  className="text-white text-sm font-medium"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {adminData?.role}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {" "}
                  {adminData?.email}
                </p>
              </div>
              <div className="p-2 space-y-0.5">
                <button
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <span className="text-indigo-400">
                    <Icons.Settings />
                  </span>
                  Settings
                </button>
                <button
                  onClick={() => logOut()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Icons.Logout />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
