"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var anchor = require("@coral-xyz/anchor");
var umi_signer_wallet_adapters_1 = require("@metaplex-foundation/umi-signer-wallet-adapters");
var spl_token_1 = require("@solana/spl-token");
var mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
var umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
var umi_1 = require("@metaplex-foundation/umi");
var spl_token_2 = require("@solana/spl-token");
describe("solana-nft-anchor", function () { return __awaiter(void 0, void 0, void 0, function () {
    var provider, program, signer, umi, mint, associatedTokenAccount, metadataAccount, masterEditionAccount, metadata;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                provider = anchor.AnchorProvider.env();
                anchor.setProvider(provider);
                program = anchor.workspace
                    .SolanaNftAnchor;
                signer = provider.wallet;
                umi = (0, umi_bundle_defaults_1.createUmi)("http://localhost:8899")
                    .use((0, umi_signer_wallet_adapters_1.walletAdapterIdentity)(signer))
                    .use((0, mpl_token_metadata_1.mplTokenMetadata)());
                mint = anchor.web3.Keypair.generate();
                return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(mint.publicKey, signer.publicKey)];
            case 1:
                associatedTokenAccount = _a.sent();
                metadataAccount = (0, mpl_token_metadata_1.findMetadataPda)(umi, {
                    mint: (0, umi_1.publicKey)(mint.publicKey)
                })[0];
                masterEditionAccount = (0, mpl_token_metadata_1.findMasterEditionPda)(umi, {
                    mint: (0, umi_1.publicKey)(mint.publicKey)
                })[0];
                metadata = {
                    name: "Kobeni",
                    symbol: "kBN",
                    uri: "https://raw.githubusercontent.com/687c/solana-nft-native-client/main/metadata.json"
                };
                it("mints nft!", function () { return __awaiter(void 0, void 0, void 0, function () {
                    var tx;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, program.methods
                                    .initNft(metadata.name, metadata.symbol, metadata.uri)
                                    .accounts({
                                    signer: provider.publicKey,
                                    mint: mint.publicKey,
                                    associatedTokenAccount: associatedTokenAccount,
                                    metadataAccount: metadataAccount,
                                    masterEditionAccount: masterEditionAccount,
                                    tokenProgram: spl_token_2.TOKEN_PROGRAM_ID,
                                    associatedTokenProgram: spl_token_2.ASSOCIATED_TOKEN_PROGRAM_ID,
                                    tokenMetadataProgram: mpl_token_metadata_1.MPL_TOKEN_METADATA_PROGRAM_ID,
                                    systemProgram: anchor.web3.SystemProgram.programId,
                                    rent: anchor.web3.SYSVAR_RENT_PUBKEY
                                })
                                    .signers([mint])
                                    .rpc()];
                            case 1:
                                tx = _a.sent();
                                console.log("mint nft tx: https://explorer.solana.com/tx/".concat(tx, "?cluster=devnet"));
                                console.log("minted nft: https://explorer.solana.com/address/".concat(mint.publicKey, "?cluster=devnet"));
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); });
