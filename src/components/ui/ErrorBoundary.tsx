"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Button } from "./Button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Une erreur s&apos;est produite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Désolé, quelque chose s&apos;est mal passé. Veuillez réessayer.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Détails de l&apos;erreur (développement)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md font-mono text-xs overflow-auto">
                    <div className="text-destructive font-semibold">
                      {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div className="mt-2 text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Recharger la page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
