"use client";

import { LogInCard } from "@/components/LogInCard";
import { ProfileCard } from "@/components/ProfileCard";
import { useAccount } from "@/hooks/useAccount";

export default function Home() {
  const { client, isLoading, login, signup, resetAccount } = useAccount({
    useGasManager: false,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-[20px]">
      {isLoading ? (
        // Loading spinner
        <div className="flex items-center justify-center">
          <div
            className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          ></div>
        </div>
      ) : client ? (
        <ProfileCard resetAccount={resetAccount} />
      ) : (
        <LogInCard login={login} signup={signup} />
      )}
    </main>
  );
}
