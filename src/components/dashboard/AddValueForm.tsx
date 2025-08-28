"use client";

import React, { useState, useMemo } from "react";
import { ref, push } from "firebase/database";
import { database } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { validateNumber, createRateLimiter } from "@/lib/utils";

export const AddValueForm: React.FC = () => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { showToast } = useToast();

  const rateLimiter = useMemo(() => createRateLimiter(5, 60000), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !value.trim()) return;

    setLoading(true);
    setError("");

    try {
      if (user && rateLimiter(user.uid)) {
        setError(
          "Trop de tentatives. Veuillez attendre un moment avant de réessayer."
        );
        showToast("Trop de tentatives", "error");
        return;
      }

      const validation = validateNumber(value);
      if (!validation.isValid) {
        setError(validation.error || "Valeur invalide");
        return;
      }

      const numericValue = parseFloat(value);

      const valuesRef = ref(database, "sharedValues");
      await push(valuesRef, {
        value: numericValue,
        createdBy: user.uid,
        createdByEmail: user.email,
        timestamp: Date.now(),
      });

      setValue("");
      showToast("Valeur ajoutée avec succès!", "success");
    } catch (error: unknown) {
      const errorMessage = "Erreur lors de l'ajout de la valeur";
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Error adding value:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter une nouvelle valeur</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              required
              error={error}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !value.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
          >
            {loading ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
