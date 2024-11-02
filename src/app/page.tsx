"use client";

// import Image from "next/image"; (not used anymore)
import { ConnectButton, MediaRenderer, TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
import { client } from "./client";
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getActiveClaimCondition } from "thirdweb/extensions/erc721";
import { getTotalClaimedSupply } from "thirdweb/extensions/erc721";
import { nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useState } from "react";

export default function Home() {
  const account = useActiveAccount();
  const chain = defineChain(sepolia);

  const [quantity, setQuantity] = useState(1);

  const contract = getContract({
    client: client,
    chain: chain,
    address: "0x17b55c2E01C16bD3C024c5a20FD82D63E07B3CFd",
  });

  const {
    data: contractMetadata,
    isLoading: isContractMetadataloading,
  } = useReadContract(getContractMetadata, { contract: contract });

  const {
    data: claimedSupply,
    isLoading: isClaimedSupplyLoading,
  } = useReadContract(getTotalClaimedSupply, { contract: contract });

  const {
    data: totalNFTSupply,
    isLoading: isTotalSupplyLoading,
  } = useReadContract(nextTokenIdToMint, { contract: contract });

  const { data: claimCondition } = useReadContract(getActiveClaimCondition, {
    contract: contract,
  });

  const getPrice = (quantity: string | number | bigint | boolean) => {
    if (!claimCondition || !claimCondition.pricePerToken) {
      return "Loading...";
    }

    const pricePerToken = BigInt(claimCondition.pricePerToken.toString());
    const total = pricePerToken * BigInt(quantity);

    return toEther(total);
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 text-center">
        <Header />
        <ConnectButton client={client} chain={chain} />
        <div className="flex flex-col items-center mt-4">
          {isContractMetadataloading ? (
            <p>Loading...</p>
          ) : null}
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold">
              Total Chiliz Minted: {claimedSupply?.toString()}/
              {totalNFTSupply?.toString()}
            </p>
          )}
          <div className="flex flex-row items-center justify-center my-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md  mr-4"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-10 text-center border border-gray-300 rounded-md bg-black text-white"
            />
            <button
              className="bg-black text-white px-4 py-2 rounded-md  mr-4"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
          <TransactionButton
            transaction={() =>
              claimTo({
                contract: contract,
                to: account?.address || "",
                quantity: BigInt(quantity),
              })
            }
            onTransactionConfirmed={async () => {
              alert("Mint Completed");
              setQuantity(1);
            }}
          >
            {getPrice(quantity) === "Loading..."
              ? "Loading Price..."
              : `Mint Chiliz (${getPrice(quantity)} ETH)`}
          </TransactionButton>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center">
      <img
        src="/media/logo_clean.png" // Gebruik een relatief pad
        alt=""
        className="w-[300px] h-[300px] mb-6" // Pas de grootte aan
        style={{
          filter: "drop-shadow(0px 0px 24px #ff0000a8)",
        }}
      />
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        ChillingChiliz - The Dream
      </h1>
    </header>
  );
}