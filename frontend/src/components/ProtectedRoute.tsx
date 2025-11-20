import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "@/App";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const { isAuthenticated } = useContext(AppContext);

  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center animate-pulse">
            <i className="fas fa-brain text-primary-foreground text-2xl"></i>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
            <p className="text-lg text-foreground">
              Verificando autenticación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;