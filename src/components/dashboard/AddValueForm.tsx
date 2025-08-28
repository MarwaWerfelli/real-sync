"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ref, push } from "firebase/database";
import { database } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { validateNumber, createRateLimiter } from "@/lib/utils";
import {
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Hash,
  Zap,
} from "lucide-react";

export const AddValueForm: React.FC = () => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const rateLimiter = useMemo(() => createRateLimiter(5, 60000), []);

  // Clear success state when user starts typing again
  const handleValueChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      if (success) setSuccess(false);
      if (error) setError("");
    },
    [success, error]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !value.trim()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Rate limiting check
      if (user && rateLimiter(user.uid)) {
        setError(
          "Trop de tentatives. Veuillez attendre un moment avant de réessayer."
        );
        showToast("Trop de tentatives", "error");
        return;
      }

      // Validation
      const validation = validateNumber(value);
      if (!validation.isValid) {
        setError(validation.error || "Valeur invalide");
        return;
      }

      const numericValue = parseFloat(value);

      // Add to Firebase
      const valuesRef = ref(database, "sharedValues");
      await push(valuesRef, {
        value: numericValue,
        createdBy: user.uid,
        createdByEmail: user.email,
        timestamp: Date.now(),
      });

      // Success state
      setValue("");
      setSuccess(true);
      showToast("Valeur ajoutée avec succès!", "success");

      // Clear success state after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (error: unknown) {
      const errorMessage = "Erreur lors de l'ajout de la valeur";
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Error adding value:", error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = value.trim() && !error;
  const numericValue = value ? parseFloat(value) : null;
  const hasDecimal = numericValue !== null && numericValue % 1 !== 0;

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
        <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Ajouter une nouvelle valeur
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Saisissez une valeur numérique pour l&lsquo;ajouter à la liste
          partagée
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            {/* Input with enhanced styling */}
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="number"
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder="Entrez une valeur numérique..."
                required
                step="any"
                className={`pl-10 pr-4 py-3 text-lg font-mono transition-all duration-200 ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : success
                    ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200"
                    : isValid
                    ? "border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                    : "border-slate-300 focus:border-slate-400 focus:ring-slate-200"
                }`}
              />

              {/* Status indicator */}
              {(error || success || (isValid && value)) && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {error ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : success ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              )}
            </div>

            {/* Value preview */}
            {numericValue !== null && !error && (
              <div className="mt-2 text-sm text-slate-600">
                <span className="font-medium">Aperçu:</span>{" "}
                <span className="font-mono font-semibold text-slate-900">
                  {numericValue.toLocaleString("fr-FR", {
                    minimumFractionDigits: hasDecimal ? 2 : 0,
                    maximumFractionDigits: hasDecimal ? 6 : 0,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-emerald-700">
                Valeur ajoutée avec succès!
              </span>
            </div>
          )}

          {/* Submit button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !isValid}
              className={`flex-1 relative overflow-hidden transition-all duration-200 ${
                loading || !isValid
                  ? "bg-slate-300 cursor-not-allowed"
                  : success
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200"
              } text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Ajout en cours...</span>
                </div>
              ) : success ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Ajouté!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Ajouter la valeur</span>
                </div>
              )}
            </Button>

            {/* Quick clear button */}
            {value && !loading && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue("")}
                className="px-4 py-3 text-slate-600 hover:text-slate-700 hover:bg-slate-50"
              >
                Effacer
              </Button>
            )}
          </div>
        </form>

        {/* Helper text */}
        <div className="mt-4 text-xs text-slate-500 flex items-center gap-1">
          <Hash className="h-3 w-3" />
          <span>
            Accepte les nombres entiers et décimaux (ex: 42, -3.14, 0.5)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
