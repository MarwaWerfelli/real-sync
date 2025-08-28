"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { AddValueForm } from "./AddValueForm";
import {
  LogOut,
  User,
  Activity,
  Zap,
  ChevronDown,
  Settings,
  Shield,
  Database,
} from "lucide-react";
import { ValuesList } from "./ValuesList";

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    RealTime Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Données synchronisées en temps réel
                  </p>
                </div>
              </div>

              {/* Live indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-700">
                  LIVE
                </span>
              </div>
            </div>

            {/* Center - Time display */}
            <div className="hidden md:flex flex-col items-center">
              <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {formatDate(currentTime)}
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-3">
              {/* User info and menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-900 truncate max-w-32">
                      {user?.email?.split("@")[0]}
                    </div>
                    <div className="text-xs text-slate-500">Connecté</div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-5 border-b border-slate-200/50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 truncate text-base">
                            {user?.email?.split("@")[0]}
                          </div>
                          <div className="text-sm text-slate-600 truncate">
                            {user?.email}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                              <Shield className="h-3 w-3 text-emerald-600" />
                              <span className="text-xs font-medium text-emerald-700">
                                Authentifié
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-3">
                      <div className="px-3 mb-2">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Compte
                        </div>
                      </div>

                      <button className="w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors duration-150 group">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <Settings className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            Paramètres
                          </div>
                          <div className="text-xs text-slate-500">
                            Gérer votre compte
                          </div>
                        </div>
                      </button>

                      <div className="my-2 mx-6 border-t border-slate-200"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-red-50 transition-colors duration-150 group"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-red-600">
                            Se déconnecter
                          </div>
                          <div className="text-xs text-red-500">
                            Terminer la session
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200/50">
                      <div className="flex items-center justify-between text-xs text-slate-500"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile logout button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="sm:hidden flex items-center gap-2 text-slate-600 hover:text-red-600 hover:border-red-300"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Click outside to close menu */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Base de données</div>
                <div className="text-lg font-semibold text-slate-900">
                  Firebase
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Statut</div>
                <div className="text-lg font-semibold text-emerald-600">
                  En ligne
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Synchronisation</div>
                <div className="text-lg font-semibold text-indigo-600">
                  Temps réel
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Add form - takes 1 column */}
          <div className="xl:col-span-1">
            <AddValueForm />
          </div>

          {/* Values list - takes 2 columns */}
          <div className="xl:col-span-2">
            <ValuesList />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-slate-200/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>
                Application en temps réel • Synchronisation automatique
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Développé avec ❤️ par Marwa WERFELLI</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
