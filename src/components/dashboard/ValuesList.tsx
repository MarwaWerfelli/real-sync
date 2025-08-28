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

// Virtualized list item component
const VirtualizedItem: React.FC<{
  item: SharedValue;
  newValueIds: Set<string>;
}> = ({ item, newValueIds }) => {
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-500 mb-3 ${
        newValueIds.has(item.id)
          ? "animate-pulse bg-green-100 border-green-300"
          : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <div>Modifié par: {item.createdByEmail}</div>
          <div>Le {formatTimestamp(item.timestamp)}</div>
        </div>
      </div>
      <div className="text-xl font-semibold text-blue-600">{item.value}</div>
    </div>
  );
};

export const ValuesList: React.FC = () => {
  const [values, setValues] = useState<SharedValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newValueIds, setNewValueIds] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    const valuesRef = ref(database, "sharedValues");

    const unsubscribe = onValue(
      valuesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
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
                setTimeout(() => setNewValueIds(new Set()), 1000);
              }

              return valuesArray;
            });
          } else {
            setValues([]);
          }
          setError(null);
        } catch (err) {
          console.error("Error processing values:", err);
          setError("Erreur lors du chargement des valeurs");
          showToast("Erreur lors du chargement des valeurs", "error");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firebase error:", err);
        setError("Erreur de connexion à la base de données");
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
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Valeurs partagées:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Valeurs partagées:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-destructive mb-4">{error}</div>
            <Button onClick={retryConnection} variant="outline">
              Réessayer la connexion
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valeurs partagées:</CardTitle>
      </CardHeader>
      <CardContent>
        {values.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune valeur partagée pour le moment
          </div>
        ) : (
          <div className="h-96 overflow-visible custom-scrollbar">
            <Virtuoso
              data={values}
              itemContent={(index, item) => (
                <VirtualizedItem item={item} newValueIds={newValueIds} />
              )}
              overscan={5}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
