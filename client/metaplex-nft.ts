import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  toMetaplexFile,
  toBigNumber,
  CreateCandyMachineInput,
  DefaultCandyGuardSettings,
  CandyMachineItem,
  toDateTime,
  sol,
  TransactionBuilder,
  CreateCandyMachineBuilderContext,
} from "@metaplex-foundation/js";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import * as fs from "fs";
import { publicKey } from "@metaplex-foundation/umi";

const QUICKNODE_RPC = "https://api.devnet.solana.com"; // 👈 Replace with your QuickNode Solana Devnet HTTP Endpoint
const SESSION_HASH = "QNDEMO" + Math.ceil(Math.random() * 1e9); // Random unique identifier for your session
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC, {
  commitment: "finalized",
  httpHeaders: { "x-session-hash": SESSION_HASH },
});
const WALLET = Keypair.fromSecretKey(
  bs58.decode(
    "mjscSouFove7dByjWG8yadueXxAyVt1cqsT76gt359BJneZQg8AqitFxTimBkXzSuNv3m3uAj24MF83yRrnYegs"
  )
);
const NFT_METADATA =
  "https://aqua-safe-planarian-640.mypinata.cloud/ipfs/QmeV6XXWYH1EushEDSNx5gQEvv4uwLXA8uB3oNQCgpWxFr/vtopia_meta.json";
const COLLECTION_NFT_MINT = "12FcU5Vi2iC7vCRTue4vJZkkMHJSacg7w1CySAxwfzFE";
const CANDY_MACHINE_ID = "";
const METAPLEX = Metaplex.make(SOLANA_CONNECTION).use(keypairIdentity(WALLET));

async function createCollectionNft() {
  const { nft: collectionNft } = await METAPLEX.nfts().create({
    name: "VTopia Collection",
    uri: NFT_METADATA,
    sellerFeeBasisPoints: 0,
    isCollection: true,
    updateAuthority: WALLET,
  });

  console.log(
    `✅ - Minted Collection NFT: ${collectionNft.address.toString()}`
  );
  console.log(
    `     https://explorer.solana.com/address/${collectionNft.address.toString()}?cluster=devnet`
  );
}

async function mintProgrammableNft(
  metadataUri: string,
  name: string,
  sellerFee: number,
  symbol: string,
  collection: string,
  creators: { address: PublicKey; share: number }[]
) {
  console.log(`Minting pNFT`);
  try {
    const transactionBuilder = await METAPLEX.nfts()
      .builders()
      .create({
        uri: metadataUri,
        name: name,
        sellerFeeBasisPoints: sellerFee,
        symbol: symbol,
        creators: creators,
        isMutable: true,
        isCollection: false,
        collection: new PublicKey(collection),
        tokenStandard: TokenStandard.ProgrammableNonFungible,
        ruleSet: null,
      });

    let { signature, confirmResponse } =
      await METAPLEX.rpc().sendAndConfirmTransaction(transactionBuilder);
    if (confirmResponse.value.err) {
      throw new Error("failed to confirm transaction");
    }
    const { mintAddress } = transactionBuilder.getContext();
    console.log(`   Success!🎉`);
    console.log(
      `   Minted NFT: https://explorer.solana.com/address/${mintAddress.toString()}?cluster=devnet`
    );
    console.log(
      `   Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    return mintAddress.toString();
  } catch (err) {
    console.log(err);
  }
}

async function generateCandyMachine() {
  const candyMachineSettings: CreateCandyMachineInput<DefaultCandyGuardSettings> =
    {
      itemsAvailable: toBigNumber(3), // Collection Size: 3
      sellerFeeBasisPoints: 1000, // 10% Royalties on Collection
      symbol: "DEMO",
      maxEditionSupply: toBigNumber(0), // 0 reproductions of each NFT allowed
      isMutable: true,
      creators: [{ address: WALLET.publicKey, share: 100 }],
      collection: {
        address: new PublicKey(COLLECTION_NFT_MINT), // Can replace with your own NFT or upload a new one
        updateAuthority: WALLET,
      },
    };
  const { candyMachine } = await METAPLEX.candyMachines().create(
    candyMachineSettings
  );
  console.log(`✅ - Created Candy Machine: ${candyMachine.address.toString()}`);
  console.log(
    `     https://explorer.solana.com/address/${candyMachine.address.toString()}?cluster=devnet`
  );
}

async function transferNFT(mintAddress, dest) {
  // 👇 Add this code
  const destination = new PublicKey(dest); // replace with your friend's public key
  const transferTransactionBuilder = await METAPLEX.nfts()
    .builders()
    .transfer({
      nftOrSft: {
        address: mintAddress,
        tokenStandard: TokenStandard.ProgrammableNonFungible,
      },
      authority: WALLET,
      fromOwner: WALLET.publicKey,
      toOwner: destination,
    });
  // Name new variables since we already have a signature and confirmResponse
  let { signature: sig2, confirmResponse: res2 } =
    await METAPLEX.rpc().sendAndConfirmTransaction(transferTransactionBuilder, {
      commitment: "finalized",
    });
  if (res2.value.err) {
    throw new Error("failed to confirm transfer transaction");
  }
  console.log(`   Tx: https://explorer.solana.com/tx/${sig2}?cluster=devnet`);
}

async function main() {
  const CONFIG = {
    imgName: "VTopia",
    symbol: "VT",
    sellerFeeBasisPoints: 500, //500 bp = 5%
    creators: [{ address: WALLET.publicKey, share: 100 }],
    metadata:
      "https://aqua-safe-planarian-640.mypinata.cloud/ipfs/QmeV6XXWYH1EushEDSNx5gQEvv4uwLXA8uB3oNQCgpWxFr/vtopia_meta.json",
  };

  // createCollectionNft();

  const addres = [
    // "awFvi2DJuewSKQeEoSP8poxoM5inytsXd5bDWrmLa4H",
    // "4x6TeJ7aXDGVtN8Wmh1tCMa1sB3Q6fXRwUptBkYBHbd7",
    "sCMYUv42jRq5WNkYygng2SjCpsHCyoQrtp1Fr7KFeqV",
    "7weaTPysBSfi4hnjQC7Po78QMrwfaNVy7VyAMa5t7rqt",
    "J3P7X3LmpoM31gb68UoxQTscqzyuicgFAKeMh2NchPk9",
    "FTgy1WK7zyrSMfjC8e81aGrStMs2J1yHFjCfLwc7j8BV",
    "DjwMoX4hs6tNgScT1zSy52ApxGbn8UCY3kpFcqkh23XA",
    "Fub88mQDDD46s4aX9GjhSz2thyhbxeV8arCtSK8urvjy",
  ];
  let idx = 30;
  for (let i = 0; i < addres.length; i++) {
    for (let j = 0; j < 5; j++) {
      idx = idx + 1;
      let mint = await mintProgrammableNft(
        CONFIG.metadata,
        "VTopia NFT" + idx,
        CONFIG.sellerFeeBasisPoints,
        CONFIG.symbol,
        COLLECTION_NFT_MINT,
        [
          {
            address: new PublicKey(
              "B45t7VFMD9tNbDG8Unzr9z6LbknjwNegD9qDtd7jiLVy"
            ),
            share: 50,
          },
          {
            address: new PublicKey(
              "4x6TeJ7aXDGVtN8Wmh1tCMa1sB3Q6fXRwUptBkYBHbd7"
            ),
            share: 50,
          },
        ]
      );

      transferNFT(new PublicKey(mint), new PublicKey(addres[i]));
    }
  }
}

main();
