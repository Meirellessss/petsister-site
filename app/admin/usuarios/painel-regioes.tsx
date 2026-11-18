
interface ResumoZona {
  zona: string;
  clientes: number;
  pedidos_pagos: number;
  faturamento_pago: number;
}

function moeda(valor: number) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PainelRegioes({
  resumo,
}: {
  resumo: ResumoZona[];
}) {
  const totalFaturamento = resumo.reduce(
    (total, item) => total + Number(item.faturamento_pago || 0),
    0
  );

  const maiorFaturamento = Math.max(
    ...resumo.map((item) => Number(item.faturamento_pago || 0)),
    0
  );

  const zonasOrdenadas = [...resumo].sort(
    (a, b) => Number(b.faturamento_pago) - Number(a.faturamento_pago)
  );

  const maiorCliente = [...resumo].sort(
    (a, b) => Number(b.clientes) - Number(a.clientes)
  )[0];

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #eadfd2",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 24,
        boxShadow: "0 5px 18px rgba(12,24,64,.045)",
      }}
    >
      <header
        style={{
          padding: "20px 22px",
          background: "#fffaf6",
          borderBottom: "1px solid #f0e3da",
        }}
      >
        <span
          style={{
            color: "#e76b32",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 1.3,
          }}
        >
          INTELIGÊNCIA COMERCIAL
        </span>

        <h2
          style={{
            margin: "5px 0",
            color: "#10204b",
            fontSize: 19,
            fontWeight: 850,
          }}
        >
          Desempenho por região
        </h2>

        <p style={{ margin: 0, color: "#718096", fontSize: 12 }}>
          Compare o faturamento e a concentração de clientes por zona.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 20,
          padding: 22,
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 20px",
              color: "#10204b",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Faturamento por zona
          </h3>

          {zonasOrdenadas.length === 0 ? (
            <p style={{ color: "#718096", fontSize: 13 }}>
              Ainda não existem dados regionais.
            </p>
          ) : (
            zonasOrdenadas.map((item) => {
              const valor = Number(item.faturamento_pago || 0);
              const percentual =
                totalFaturamento > 0
                  ? (valor / totalFaturamento) * 100
                  : 0;

              const largura =
                maiorFaturamento > 0
                  ? (valor / maiorFaturamento) * 100
                  : 0;

              return (
                <div
                  key={item.zona}
                  style={{ marginBottom: 22 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <strong
                      style={{
                        color: "#263653",
                        fontSize: 12,
                      }}
                    >
                      {item.zona}
                    </strong>

                    <strong
                      style={{
                        color: "#c64d2e",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {moeda(valor)}
                    </strong>
                  </div>

                  <div
                    style={{
                      height: 10,
                      borderRadius: 20,
                      background: "#f3ece6",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${largura}%`,
                        minWidth: valor > 0 ? 3 : 0,
                        borderRadius: 20,
                        background:
                          "linear-gradient(90deg, #f08a43, #e65b2f)",
                        transition: "width .3s ease",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      color: "#8490a3",
                      fontSize: 10,
                    }}
                  >
                    {percentual.toLocaleString("pt-BR", {
                      maximumFractionDigits: 1,
                    })}
                    % do faturamento regional
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            padding: 18,
            border: "1px solid #eee5df",
            borderRadius: 13,
            background: "#fffdfb",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              color: "#10204b",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            Indicadores regionais
          </h3>

          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: "#fff1e9",
              marginBottom: 12,
            }}
          >
            <span style={{ color: "#a35b35", fontSize: 11 }}>
              Faturamento regional total
            </span>

            <strong
              style={{
                display: "block",
                marginTop: 5,
                color: "#10204b",
                fontSize: 21,
              }}
            >
              {moeda(totalFaturamento)}
            </strong>
          </div>

          <div
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #eee5df",
            }}
          >
            <span style={{ color: "#8490a3", fontSize: 11 }}>
              Região com mais clientes
            </span>

            <strong
              style={{
                display: "block",
                marginTop: 4,
                color: "#10204b",
                fontSize: 14,
              }}
            >
              {maiorCliente?.zona || "Sem dados"}
            </strong>

            <span style={{ color: "#718096", fontSize: 11 }}>
              {maiorCliente?.clientes ?? 0} clientes
            </span>
          </div>

          <div style={{ paddingTop: 12 }}>
            <span style={{ color: "#8490a3", fontSize: 11 }}>
              Regiões com dados
            </span>

            <strong
              style={{
                display: "block",
                marginTop: 4,
                color: "#10204b",
                fontSize: 20,
              }}
            >
              {resumo.length}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
