"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { getFirebaseErrorMessage } from "@/utils/firebaseErrors";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const watchedEmail = watch("email");
  const watchedPassword = watch("password");

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

  const getFieldStatus = (field: "email" | "password") => {
    const value = field === "email" ? watchedEmail : watchedPassword;
    const error = errors[field];

    if (!value) return "default";
    if (error) return "error";
    return "success";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-2xl" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {mode === "signin" ? "Bon retour !" : "Bienvenue"}
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            {mode === "signin"
              ? "Connectez-vous pour accéder à votre dashboard"
              : "Créez votre compte pour commencer votre aventure"}
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 pt-6"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail
                      className={`h-4 w-4 transition-colors ${
                        getFieldStatus("email") === "error"
                          ? "text-red-400"
                          : getFieldStatus("email") === "success"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="votre@email.com"
                    className={`pl-12 pr-12 h-12 rounded-xl border transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                      getFieldStatus("email") === "error"
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : getFieldStatus("email") === "success"
                        ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-200 hover:border-slate-300"
                    } focus:ring-4 focus:ring-opacity-20`}
                  />
                  {getFieldStatus("email") === "success" && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.email.message}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock
                      className={`h-4 w-4 transition-colors ${
                        getFieldStatus("password") === "error"
                          ? "text-red-400"
                          : getFieldStatus("password") === "success"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••••"
                    className={`pl-12 pr-12 h-12 rounded-xl border transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                      getFieldStatus("password") === "error"
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : getFieldStatus("password") === "success"
                        ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-200 hover:border-slate-300"
                    } focus:ring-4 focus:ring-opacity-20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors z-10"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {errors.password.message}
                  </div>
                )}
              </div>

              {/* Global Error */}
              {error && (
                <div className="flex items-center gap-3 text-sm text-red-700 bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                disabled={loading || !isValid}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>
                      {mode === "signin" ? "Se connecter" : "Créer un compte"}
                    </span>
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 font-medium">
                  Ou continuer avec
                </span>
              </div>
            </div>

            {/* Google Button */}
            <Button
              variant="outline"
              className="w-full h-12 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google</span>
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                )}
              </div>
            </Button>

            {/* Mode Toggle */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onToggleMode}
                className="group text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                <span className="font-medium">
                  {mode === "signin"
                    ? "Pas encore de compte ? "
                    : "Déjà un compte ? "}
                </span>
                <span className="text-blue-600 hover:text-blue-700 font-semibold group-hover:underline decoration-2 underline-offset-2 transition-all">
                  {mode === "signin" ? "Créer un compte" : "Se connecter"}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Développé avec ❤️ par Marwa WERFELLI
          </p>
        </div>
      </div>
    </div>
  );
};
