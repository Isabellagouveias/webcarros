import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";
import type { PrivateProps } from "../interfaces/privateProps";

export function Private({ children }: PrivateProps) {
  const { signed, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return <p>Carregando...</p>;
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return children;
}