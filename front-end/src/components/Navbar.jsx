import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useThemeStore from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Sun, Moon, User, LogOut, Wifi, HelpCircle, X, Keyboard } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

const Navbar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { logout, authUser } = useAuthStore();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const shortcutsList = [
    { key: "Run Code", desc: "Execute current snippet" },
    { key: "Template", desc: "Load starter template" },
    { key: "Copy / Download", desc: "Export snippet to file/clipboard" },
    { key: "Switch Theme", desc: "Toggle dark/light mode" },
    { key: "Select User", desc: "Open direct collaboration chat" },
  ];

  return (
    <>
      <header
        className={`fixed w-full top-0 z-40 backdrop-blur-md ${
          theme === "dark" ? "bg-gray-900/80 border-gray-800" : "bg-white/80 border-gray-200"
        } border-b transition-all duration-200`}
      >
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            {/* Left side: Logo & Status Badge */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all">
                <div
                  className={`size-9 rounded-xl flex items-center justify-center shadow-sm ${
                    theme === "dark" ? "bg-blue-900/50 text-blue-400 border border-blue-800" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h1
                  className={`text-lg font-bold tracking-tight ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  CodeChat <span className="text-xs font-normal opacity-70 border border-blue-500/30 px-1.5 py-0.5 rounded-full text-blue-500">v1.2</span>
                </h1>
              </Link>

              {/* Socket Status Badge */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  isConnected
                    ? theme === "dark"
                      ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/50"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : theme === "dark"
                    ? "bg-amber-950/50 text-amber-400 border-amber-800/50"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span>{isConnected ? "Realtime Active" : "Connecting..."}</span>
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-2">
              {/* Keyboard Shortcuts Button */}
              <button
                onClick={() => setShowShortcuts(true)}
                className={`p-2 rounded-lg hover:${
                  theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
                } transition-colors flex items-center gap-1 text-xs`}
                title="Keyboard Shortcuts & Help"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden md:inline">Shortcuts</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg hover:${
                  theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                } transition-colors`}
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {authUser && (
                <>
                  <Link
                    to={"/profile"}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-white"
                        : "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-all`}
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-5 rounded-2xl shadow-xl border ${
              theme === "dark" ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4 border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 font-bold text-base">
                <Keyboard className="w-5 h-5 text-blue-500" />
                <span>Quick Features & Shortcuts</span>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {shortcutsList.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    theme === "dark" ? "bg-gray-800/50 border-gray-800" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-mono">
                    {item.key}
                  </span>
                  <span className="text-xs opacity-80">{item.desc}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-5 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

