import bs58 from "bs58";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaNftAnchor } from "../target/types/solana_nft_anchor";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  findMasterEditionPda,
  findMetadataPda,
  mplTokenMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  payloadType,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import {
  Connection,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Keypair,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { PublicKey } from "@metaplex-foundation/js";
import { PublicKey as Web3PublicKey } from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import idl from "./solana_nft_anchor.json";

export const connection = new Connection(
  "https://api.devnet.solana.com"
  // clusterApiUrl("devnet")
);

const getMetadataPda = (mint: PublicKey) => {
  return Web3PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      Buffer.from(MPL_TOKEN_METADATA_PROGRAM_ID.toString(), "utf8"),
      mint.toBuffer(),
    ],
    new Web3PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString())
  );
};

async function solana_nft_anchor() {
  // Configured the client to use the devnet cluster.

  // const provider = anchor.AnchorProvider.env();

  const sk =
    "mjscSouFove7dByjWG8yadueXxAyVt1cqsT76gt359BJneZQg8AqitFxTimBkXzSuNv3m3uAj24MF83yRrnYegs";
  const myKeypair = Keypair.fromSecretKey(bs58.decode(sk));

  // const myKeypair = Keypair.fromSecretKey(Uint8Array.from([151,46,188,163,214,28,71,79,138,234,96,21,39,208,100,43,37,219,4,1,92,139,228,102,241,216,74,102,94,97,83,103,58,176,45,158,113,159,255,146,134,124,222,141,126,16,16,126,216,218,21,112,178,176,151,207,119,130,188,25,17,7,53,54]));

  console.log({ myKeypair });
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(myKeypair),
    {}
  );

  anchor.setProvider(provider);

  // const program = anchor.workspace.SolanaNftAnchor as Program<SolanaNftAnchor>;
  const programAddress = "5iBZPF6PaSHdBxd8cmCpZmgyGwK5eG4xfaGXQBKfqqac";
  const programIDL: any = idl;
  const program = new anchor.Program(
    programIDL,
    new PublicKey(programAddress),
    provider
  ) as anchor.Program<SolanaNftAnchor>;

  console.log("Program ID", program.programId);

  const signer = provider.wallet;

  const umi = createUmi("https://api.devnet.solana.com")
    // const umi = createUmi("http://localhost:8899")
    .use(walletAdapterIdentity(signer))
    .use(mplTokenMetadata());

  const mint = Keypair.generate();

  const owner = new PublicKey("4x6TeJ7aXDGVtN8Wmh1tCMa1sB3Q6fXRwUptBkYBHbd7");

  // Derive the associated token address account for the mint
  const associatedTokenAccount = await getAssociatedTokenAddress(
    mint.publicKey,
    owner
    // provider.publicKey
  );

  // derive the metadata account
  let metadataAccount = findMetadataPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];
  // let metadataAccount = getMetadataPda(mint.publicKey);

  //derive the master edition pda
  let masterEditionAccount = findMasterEditionPda(umi, {
    mint: publicKey(mint.publicKey),
  })[0];

  const metadata = {
    name: "VTopia",
    symbol: "VT",
    // uri: "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json",
    uri: "https://api2.infura.pro/vtopia.json",    
  };

  // const insList: TransactionInstruction[] = [];
  // const ins = await program.methods
  //   .initNft(metadata.name, metadata.symbol, metadata.uri)
  //   .accounts({
  //     signer: provider.publicKey,
  //     mint: mint.publicKey,
  //     associatedTokenAccount,
  //     metadataAccount,
  //     masterEditionAccount,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //     tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
  //     systemProgram: anchor.web3.SystemProgram.programId,
  //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  //   })
  //   .instruction();
  // // insList.push(ins);

  // // const rb = await connection.getLatestBlockhash();

  // // const msg = new TransactionMessage({
  // //   payerKey: signer.publicKey,
  // //   recentBlockhash: rb.blockhash,
  // //   instructions: insList,
  // // }).compileToV0Message();

  // // const transaction = new VersionedTransaction(msg);
  // // transaction.sign([signer]);

  // const simulated = await connection.simulateTransaction(transaction);
  // console.log("simulated", simulated);

  // const tx = await connection.sendTransaction(transaction);

  // console.log("transaciton broadcasted", tx);

  // await connection.confirmTransaction({
  //   signature: tx,
  //   blockhash: rb.blockhash,
  //   lastValidBlockHeight: rb.lastValidBlockHeight,
  // });

  const tx = await program.methods
    .initNft(metadata.name, metadata.symbol, metadata.uri)
    .accounts({
      signer: provider.publicKey,
      mint: mint.publicKey,
      associatedTokenAccount,
      metadataAccount,
      masterEditionAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([mint])
    .rpc();

  console.log("confirmed transaction", tx);

  console.log(
    `mint nft tx: https://explorer.solana.com/tx/${tx}?cluster=custom`
  );
  console.log(
    `minted nft: https://explorer.solana.com/address/${mint.publicKey}?cluster=custom`
  );
}

solana_nft_anchor();
