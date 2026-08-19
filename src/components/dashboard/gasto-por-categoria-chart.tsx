"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

interface Slice {
  nombre: string;
  monto: number;
}

// Escala de dorados/coral en degradé — coherente con los tokens de acento,
// no un arcoíris de categorías.
const COLORS = ["#d9a94a", "#c98a4a", "#b96f4c", "#a85850", "#8f4658", "#6e3a5c"];

export function GastoPorCategoriaChart({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center font-data text-sm text-foreground-subtle">
        Todavía no hay gastos este mes.
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="monto"
            nameKey="nombre"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontFamily: "var(--font-data)",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
