import type { HealthResponse } from "@mymedlog/contracts";

type HealthStatusProps = {
  isLoading: boolean;
  isError: boolean;
  data?: HealthResponse;
};

export function HealthStatus({ isLoading, isError, data }: HealthStatusProps) {
  if (isLoading) {
    return <p>Verificando API...</p>;
  }

  if (isError) {
    return <p>API indisponivel no momento.</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <p>
      API status: <strong>{data.status}</strong> ({data.service}) em {data.timestamp}
    </p>
  );
}
