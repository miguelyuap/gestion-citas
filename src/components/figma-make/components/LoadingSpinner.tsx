"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  cardCount?: number;
}

export function LoadingState({
  title = "Cargando información...",
  subtitle = "Obteniendo datos actualizados del negocio",
  cardCount = 6,
}: LoadingStateProps) {
  return (
    <div className="fade-in" style={{ padding: "20px 0" }}>
      {/* Header skeleton / indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #2563eb15, #6366f125)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader2 size={20} className="spin" color="#2563eb" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 12.5, color: "#475569", fontWeight: 500 }}>
              {subtitle}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#eff6ff",
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            color: "#2563eb",
          }}
        >
          <Sparkles size={13} /> Sincronizando...
        </div>
      </div>

      {/* Grid skeleton placeholder items */}
      <div className="grid-auto" style={{ gap: 16 }}>
        {Array.from({ length: cardCount }).map((_, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              padding: 20,
              minHeight: 150,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid #f1f5f9",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  animation: "pulse 1.5s infinite ease-in-out",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    height: 14,
                    width: "70%",
                    borderRadius: 4,
                    background: "#cbd5e1",
                    animation: "pulse 1.5s infinite ease-in-out",
                  }}
                />
                <div
                  style={{
                    height: 10,
                    width: "45%",
                    borderRadius: 4,
                    background: "#e2e8f0",
                    animation: "pulse 1.5s infinite ease-in-out",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 16 }}>
              <div
                style={{
                  height: 10,
                  width: "100%",
                  borderRadius: 4,
                  background: "#f1f5f9",
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
              <div
                style={{
                  height: 10,
                  width: "80%",
                  borderRadius: 4,
                  background: "#f1f5f9",
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 12,
                marginTop: 12,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  height: 12,
                  width: 60,
                  borderRadius: 4,
                  background: "#e2e8f0",
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
              <div
                style={{
                  height: 12,
                  width: 80,
                  borderRadius: 4,
                  background: "#cbd5e1",
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InlineLoading({ message = "Cargando..." }: { message?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "20px",
        color: "#0f172a",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <Loader2 size={16} className="spin" color="#2563eb" />
      <span>{message}</span>
    </div>
  );
}
