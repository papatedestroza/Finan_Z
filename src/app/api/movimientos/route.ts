import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook para cargar movimientos desde afuera de la app (ej. un Shortcut
 * de iOS). No hay sesión de usuario acá — se autentica con un token fijo
 * (MOVIMIENTOS_API_TOKEN) y se inserta a nombre del único usuario de la app
 * (SUPABASE_USER_ID), vía service role.
 */

function tokensCoinciden(recibido: string): boolean {
  const esperado = process.env.MOVIMIENTOS_API_TOKEN;
  if (!esperado) return false;

  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Acepta el token por header ("Authorization: Bearer ...") o por query
 * string ("?token=..."), para poder pegar una sola URL en Shortcuts sin
 * tener que tipear un header a mano (fuente típica de typos/autocorrección
 * en el teclado de iOS).
 */
function tokenValido(request: Request): boolean {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return tokensCoinciden(header.slice("Bearer ".length));
  }

  const queryToken = new URL(request.url).searchParams.get("token");
  if (queryToken) return tokensCoinciden(queryToken);

  return false;
}

export async function POST(request: Request) {
  if (!tokenValido(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const userId = process.env.SUPABASE_USER_ID;
  if (!userId) {
    return NextResponse.json({ error: "Falta configurar SUPABASE_USER_ID." }, { status: 500 });
  }

  let body: {
    monto?: unknown;
    tipo?: unknown;
    categoria?: unknown;
    cuenta?: unknown;
    descripcion?: unknown;
    fecha?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido, se espera JSON." }, { status: 400 });
  }

  const monto = Number(body.monto);
  const tipo = String(body.tipo ?? "").toLowerCase();

  if (!Number.isFinite(monto) || monto <= 0) {
    return NextResponse.json(
      {
        error: "monto tiene que ser un número mayor a 0.",
        recibido: { monto: body.monto, tipoDeDato: typeof body.monto },
      },
      { status: 400 }
    );
  }
  if (tipo !== "ingreso" && tipo !== "gasto") {
    return NextResponse.json(
      { error: "tipo tiene que ser 'ingreso' o 'gasto'.", recibido: { tipo: body.tipo } },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const cuentaNombre = body.cuenta ? String(body.cuenta) : null;
  const { data: cuentas, error: cuentaError } = await supabase
    .from("cuentas")
    .select("id, nombre")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (cuentaError) return NextResponse.json({ error: cuentaError.message }, { status: 500 });

  const cuenta = cuentaNombre
    ? cuentas.find((c) => c.nombre.toLowerCase() === cuentaNombre.toLowerCase())
    : cuentas[0];

  if (!cuenta) {
    return NextResponse.json(
      { error: `Cuenta no encontrada. Disponibles: ${cuentas.map((c) => c.nombre).join(", ")}` },
      { status: 404 }
    );
  }

  let categoriaId: string | null = null;
  if (tipo === "gasto") {
    const categoriaNombre = String(body.categoria ?? "");
    if (!categoriaNombre) {
      return NextResponse.json({ error: "categoria es obligatoria para gastos." }, { status: 400 });
    }

    const { data: categorias, error: categoriaError } = await supabase
      .from("categorias")
      .select("id, nombre")
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (categoriaError) return NextResponse.json({ error: categoriaError.message }, { status: 500 });

    const categoria = categorias.find((c) => c.nombre.toLowerCase() === categoriaNombre.toLowerCase());
    if (!categoria) {
      return NextResponse.json(
        { error: `Categoría no encontrada. Disponibles: ${categorias.map((c) => c.nombre).join(", ")}` },
        { status: 404 }
      );
    }
    categoriaId = categoria.id;
  }

  const fecha = body.fecha ? String(body.fecha) : new Date().toISOString().slice(0, 10);
  const descripcion = body.descripcion ? String(body.descripcion).trim() : null;

  const { data: movimiento, error: insertError } = await supabase
    .from("movimientos")
    .insert({
      user_id: userId,
      cuenta_id: cuenta.id,
      categoria_id: categoriaId,
      tipo,
      monto,
      fecha,
      descripcion,
    })
    .select("id")
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: movimiento.id }, { status: 201 });
}
