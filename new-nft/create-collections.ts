import {createNft, fetchDigitalAsset, mplTokenMetadata} from "@metaplex-foundation/mpl-token-metadata";
import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers";

import {
    createUmi
} from "@metaplex-foundation/umi-bundle-defaults";  

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(
    connection, 
    user.publicKey, 
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up umi instance for user");

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint: collectionMint,
    name: "My NFT Collection",
    symbol: "MNFT",
    uri: "https://example.com/nft.json",
    sellerFeeBasisPoints: percentAmount(5),
    isCollection: true,
});

await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(
    umi,
    collectionMint.publicKey
);

console.log("Created collection", getExplorerLink(createdCollectionNft.mint.publicKey, "devnet"));
