import { createFileRoute, redirect, useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import {  useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import type { IUser } from "@/types/user";
import { useAuthContext } from "@/contexts/auth";

export const Route = createFileRoute("/profiles")({
  beforeLoad: ({ context }) => {
      const auth = (context as { auth?: { isAuthenticated?: boolean } })?.auth;
  
      if (auth?.isAuthenticated) {
        throw redirect({
          to: '/',
        });
      }
    },
  component: ProfilesPage,
});

function ProfilesPage() {
  const isDevelopment = import.meta.env.MODE !== "production";
  const usersEndpoint = isDevelopment ? `http://localhost:8888/users` : `/users`;
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const params = useSearch({ strict: false }) as { redirect?:  string };
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const response = await fetch(usersEndpoint, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load profiles.");
        }

        const data: IUser[] = await response.json();
        setUsers(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError("Não foi possível carregar os perfis.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchUsers();

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectUser = (user: IUser) => {
    login(user);

    router.invalidate().then(() => {
      const redirectPath = params.redirect ? params.redirect : '/';
      navigate({ to: redirectPath });
    });
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#141414] px-6 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(127,29,29,0.2),transparent_55%)]" />
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
        <header className="mb-10 text-center sm:mb-12">
          <h1 className="text-3xl font-medium tracking-tight sm:text-5xl">
            Who&apos;s learning?
          </h1>

          <p className="mt-3 text-sm text-zinc-400 sm:text-base">
            Choose a profile to continue.
          </p>
        </header>

        {loading ? (
          <p className="animate-pulse text-zinc-400">
            Loading profiles...
          </p>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-red-400">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="border border-zinc-600 px-5 py-2 text-sm text-zinc-300 transition hover:border-white hover:text-white"
            >
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <p className="text-zinc-400">Nenhum perfil encontrado.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-10">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => selectUser(user)}
                aria-label={`Continue as ${user.name}`}
                className="group flex w-32 flex-col items-center gap-3 text-center outline-none sm:w-40 sm:gap-4 pt-0! px-0!"
              >
                <Avatar className="h-28 w-full rounded-md rounded-b-none border border-zinc-700 bg-zinc-800 transition duration-200 group-focus-visible:ring-2 group-focus-visible:ring-white sm:h-40">
                  <AvatarImage
                    src={user.profile}
                    alt={user.name}
                    className="object-cover"
                  />

                  <AvatarFallback className="rounded-md  bg-zinc-800 text-3xl font-semibold text-zinc-300 sm:text-4xl">
                    {user.name
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part.charAt(0).toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <span className="text-sm text-zinc-400 transition-colors group-hover:text-white sm:text-lg">
                  {user.name}
                </span>
              </button>
            ))}
          </div>
        )}

        <p className="mt-12 max-w-sm text-center text-xs text-zinc-600 sm:text-sm">
          Your learning progress is saved separately for each profile.
        </p>
      </div>
    </main>
  )
}