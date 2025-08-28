"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ref, onValue, off } from "firebase/database";
import { Virtuoso } from "react-virtuoso";
import { database } from "@/lib/firebase";
import { SharedValue } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { formatTimestamp } from "@/lib/utils";
import {
  TrendingUp,
  Clock,
  User,
  RefreshCw,
  AlertCircle,
  Database,
  Activity,
} from "lucide-react";

// Enhanced virtualized list item component
const VirtualizedItem: React.FC<{
  item: SharedValue;
  newValueIds: Set<string>;
  index: number;
}> = ({ item, newValueIds, index }) => {
  const isNew = newValueIds.has(item.id);

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-300 mb-4 ${
        isNew
          ? "animate-slideInFade bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 shadow-md"
          : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* New item indicator */}
      {isNew && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg font-medium z-10">
          Nouveau
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Left side - Metadata */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4 text-slate-400" />
              <span className="font-medium">{item.createdByEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{formatTimestamp(item.timestamp)}</span>
            </div>
          </div>

          {/* Right side - Value */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {item.value.toLocaleString("fr-FR", {
                  minimumFractionDigits: item.value % 1 !== 0 ? 2 : 0,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                #{index + 1}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute left-0 top-0 h-full w-1 bg-blue-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200 rounded-l-xl" />
    </div>
  );
};

// Enhanced empty state component
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
      <Database className="h-10 w-10 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">
      Aucune donnée disponible
    </h3>
    <p className="text-slate-500 max-w-sm">
      Les nouvelles valeurs apparaîtront ici en temps réel dès qu&apos;elles
      seront ajoutées.
    </p>
  </div>
);

// Enhanced error state component
const ErrorState: React.FC<{
  error: string;
  onRetry: () => void;
  retryCount: number;
}> = ({ error, onRetry, retryCount }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
      <AlertCircle className="h-10 w-10 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">
      Erreur de connexion
    </h3>
    <p className="text-slate-500 mb-6 max-w-sm">{error}</p>
    <Button
      onClick={onRetry}
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Réessayer {retryCount > 0 && `(${retryCount})`}
    </Button>
  </div>
);

// Enhanced loading state
const LoadingState: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-200 rounded" />
              <div className="h-4 bg-slate-200 rounded w-32" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-200 rounded" />
              <div className="h-3 bg-slate-200 rounded w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="h-8 bg-slate-200 rounded w-16 mb-1" />
              <div className="h-3 bg-slate-200 rounded w-8" />
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ValuesList: React.FC = () => {
  const [values, setValues] = useState<SharedValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newValueIds, setNewValueIds] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");
  const { showToast } = useToast();

  useEffect(() => {
    const valuesRef = ref(database, "sharedValues");
    setConnectionStatus("connecting");

    const unsubscribe = onValue(
      valuesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          setConnectionStatus("connected");

          if (data) {
            const valuesArray: SharedValue[] = Object.entries(data).map(
              ([id, value]: [string, unknown]) => ({
                id,
                ...(value as Omit<SharedValue, "id">),
              })
            );

            // Sort by timestamp (newest first)
            valuesArray.sort((a, b) => b.timestamp - a.timestamp);

            setValues((prevValues) => {
              // Detect new values for animation
              const currentIds = new Set(prevValues.map((v) => v.id));
              const newIds = new Set(
                valuesArray
                  .filter((v) => !currentIds.has(v.id))
                  .map((v) => v.id)
              );

              if (newIds.size > 0) {
                setNewValueIds(newIds);
                // Remove animation class after animation completes
                setTimeout(() => setNewValueIds(new Set()), 2000);
              }

              return valuesArray;
            });
          } else {
            setValues([]);
          }
          setError(null);
        } catch (err) {
          console.error("Error processing values:", err);
          setError("Erreur lors du traitement des données");
          setConnectionStatus("disconnected");
          showToast("Erreur lors du chargement des valeurs", "error");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firebase error:", err);
        setError("Erreur de connexion à la base de données");
        setConnectionStatus("disconnected");
        showToast("Erreur de connexion", "error");
        setLoading(false);
      }
    );

    return () => {
      off(valuesRef, "value", unsubscribe);
    };
  }, [showToast]);

  // Retry function for Firebase operations
  const retryConnection = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    setLoading(true);
    setConnectionStatus("connecting");
  }, []);

  const connectionStatusConfig = {
    connected: {
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      icon: Activity,
      text: "Connecté",
    },
    disconnected: {
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: AlertCircle,
      text: "Déconnecté",
    },
    connecting: {
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      icon: RefreshCw,
      text: "Connexion...",
    },
  };

  const statusConfig = connectionStatusConfig[connectionStatus];
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-slate-600" />
              Valeurs partagées
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              {values.length} {values.length === 1 ? "entrée" : "entrées"} •
              Mise à jour en temps réel
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor}`}
          >
            <StatusIcon
              className={`h-4 w-4 ${statusConfig.color} ${
                connectionStatus === "connecting" ? "animate-spin" : ""
              }`}
            />
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.text}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6">
            <LoadingState />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState
              error={error}
              onRetry={retryConnection}
              retryCount={retryCount}
            />
          </div>
        ) : values.length === 0 ? (
          <div className="p-6">
            <EmptyState />
          </div>
        ) : (
          <div className="h-[500px] py-5">
            <Virtuoso
              data={values}
              itemContent={(index, item) => (
                <div className="px-6">
                  <VirtualizedItem
                    item={item}
                    newValueIds={newValueIds}
                    index={index}
                  />
                </div>
              )}
              overscan={5}
              className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
              style={{ overflowX: "hidden", overflowY: "auto" }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
