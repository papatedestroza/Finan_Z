"use client";

import { useActionState, useState } from "react";
import { signInAction, signUpAction, type AuthActionState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [modo, setModo] = useState<"signin" | "signup">("signin");
  const [signInState, signInFormAction, signInPending] = useActionState(
    signInAction,
    initialState
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState(
    signUpAction,
    initialState
  );

  const action = modo === "signin" ? signInFormAction : signUpFormAction;
  const state = modo === "signin" ? signInState : signUpState;
  const pending = modo === "signin" ? signInPending : signUpPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-surface-raised p-1">
        <button
          type="button"
          onClick={() => setModo("signin")}
          className={`rounded-full py-2.5 font-data text-sm transition-colors ${
            modo === "signin" ? "bg-accent text-accent-foreground" : "text-foreground-muted"
          }`}
        >
          Ingresar
        </button>
        <button
          type="button"
          onClick={() => setModo("signup")}
          className={`rounded-full py-2.5 font-data text-sm transition-colors ${
            modo === "signup" ? "bg-accent text-accent-foreground" : "text-foreground-muted"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={modo === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
          />
        </div>

        {state.error && <p className="font-data text-sm text-alert">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full text-base">
          {pending ? "Un momento…" : modo === "signin" ? "Ingresar" : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
