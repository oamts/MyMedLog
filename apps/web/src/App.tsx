import { useGetHealthQuery } from "./services/api";

export function App() {
  const { data, isLoading, isError } = useGetHealthQuery();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background:
          "radial-gradient(circle at top, #d1fae5 0%, #f4efe6 35%, #efe7d8 100%)",
        color: "#1f2937",
        fontFamily: "'Source Sans 3', system-ui, sans-serif"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          background: "rgba(255, 255, 255, 0.82)",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(15, 118, 110, 0.12)",
          padding: "1.5rem"
        }}
      >
        <h1 style={{ marginTop: 0 }}>MyMedLog</h1>
        <p style={{ marginBottom: "1.25rem" }}>
          Scaffold inicial concluido. Frontend conectado ao endpoint de health da API.
        </p>
        {isLoading && <p>Verificando API...</p>}
        {isError && <p>API indisponivel no momento.</p>}
        {data && (
          <p>
            API status: <strong>{data.status}</strong> ({data.service}) em {data.timestamp}
          </p>
        )}
      </section>
    </main>
  );
}
