/**
 * Firebase authentication error messages in French
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email ou mot de passe incorrect",
  "auth/user-not-found": "Aucun compte trouvé avec cet email",
  "auth/wrong-password": "Mot de passe incorrect",
  "auth/email-already-in-use": "Un compte existe déjà avec cet email",
  "auth/weak-password": "Le mot de passe est trop faible",
  "auth/invalid-email": "Format d'email invalide",
  "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard",
  "auth/network-request-failed": "Erreur de connexion. Vérifiez votre internet",
  "auth/user-disabled": "Ce compte a été désactivé",
  "auth/operation-not-allowed": "Cette opération n'est pas autorisée",
  "auth/account-exists-with-different-credential":
    "Un compte existe déjà avec des identifiants différents",
  "auth/requires-recent-login": "Cette action nécessite une nouvelle connexion",
  "auth/credential-already-in-use":
    "Ces identifiants sont déjà utilisés par un autre compte",
} as const;

/**
 * Get user-friendly error message for Firebase authentication errors
 * @param error - The error object from Firebase
 * @param defaultMessage - Default message if error code not found
 * @returns User-friendly error message in French
 */
export const getFirebaseErrorMessage = (
  error: unknown,
  defaultMessage: string = "Une erreur est survenue"
): string => {
  // Handle Firebase authentication errors
  if (error && typeof error === "object" && "code" in error) {
    const firebaseError = error as { code: string; message?: string };
    return (
      AUTH_ERROR_MESSAGES[firebaseError.code] ||
      firebaseError.message ||
      defaultMessage
    );
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * Check if an error is a Firebase authentication error
 * @param error - The error object to check
 * @returns True if it's a Firebase auth error
 */
export const isFirebaseAuthError = (error: unknown): boolean => {
  return Boolean(error && typeof error === "object" && "code" in error);
};
