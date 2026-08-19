import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-5 py-10">
      <div className="flex flex-col gap-1 text-center">
        <span className="font-display text-2xl italic text-foreground">Finan_Z</span>
        <span className="font-data text-sm text-foreground-muted">
          Control de finanzas personales
        </span>
      </div>

      <LoginForm />
    </main>
  );
}
