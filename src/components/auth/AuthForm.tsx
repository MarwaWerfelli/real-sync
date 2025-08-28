"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getFirebaseErrorMessage } from "@/utils/firebaseErrors";

interface AuthFormProps {
  mode: "signin" | "signup";
  onToggleMode: () => void;
}

interface FormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Format d'email invalide")
    .required("L'email est requis"),
  password: Yup.string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .required("Le mot de passe est requis"),
});

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError("");

    try {
      if (mode === "signin") {
        await signIn(values.email, values.password);
      } else {
        await signUp(values.email, values.password);
      }
      reset();
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-center text-2xl font-bold text-gray-900">
              {mode === "signin" ? "Se connecter" : "Créer un compte"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="votre@email.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <div className="text-sm text-red-600">
                    {errors.email.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.password && (
                  <div className="text-sm text-red-600">
                    {errors.password.message}
                  </div>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 cursor-pointer"
                disabled={loading || !isValid}
              >
                {loading
                  ? "Chargement..."
                  : mode === "signin"
                  ? "Se connecter"
                  : "Créer un compte"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition-colors duration-200  cursor-pointer"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                Continuer avec Google
              </Button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onToggleMode}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <span className="text-gray-700">
                  {mode === "signin" ? "Pas de compte ? " : "Déjà un compte ? "}
                </span>
                <span className="text-blue-600 hover:text-blue-700 font-medium  cursor-pointer hover:underline">
                  {mode === "signin" ? "Créer un compte" : "Se connecter"}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
