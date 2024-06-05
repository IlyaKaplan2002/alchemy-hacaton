"use client";

import { AccountContext } from "./accountProvider";
import { LogInCard } from "@/components/LogInCard";
import { ProfileCard } from "@/components/ProfileCard";
import { useContext } from "react";

export default function Home() {
  const accountData = useContext(AccountContext);

  const clientWithGasManager = accountData?.clientWithGasManager || null;
  const isLoading = accountData?.isLoading || false;
  const isOwner = accountData?.isOwner || false;
  const ownersLoaded = accountData?.ownersLoaded || false;
  const availableAccountsLoaded = accountData?.availableAccountsLoaded || false;
  const importAccountLoaded = accountData?.importAccountLoaded || false;

  console.log(
    isLoading,
    isOwner,
    ownersLoaded,
    availableAccountsLoaded,
    importAccountLoaded,
    clientWithGasManager,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-[20px]">
      {isLoading ||
      !ownersLoaded ||
      !availableAccountsLoaded ||
      !importAccountLoaded ? (
        <div className="flex items-center justify-center">
          <div
            className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          ></div>
        </div>
      ) : clientWithGasManager ? (
        isOwner ? (
          <ProfileCard />
        ) : (
          <div
            className="flex min-w-80 flex-col justify-center rounded-lg bg-[#0F172A] p-10"
            style={{ maxWidth: "95vw" }}
          >
            <div className="text-center text-[18px] font-semibold">
              Please approve this device on the previous device
            </div>
          </div>
        )
      ) : (
        <LogInCard />
      )}
    </main>
  );
}
