import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/sui/utils';

export const SUI_BIN = `sui`;

export const getActiveAddress = () => {
    return execSync(`${SUI_BIN} client active-address`, { encoding: 'utf8' }).trim();
};

/** Returns a signer based on the active address of system's sui. */
export const getSigner = () => {
    const sender = getActiveAddress();
    const keystore = JSON.parse(
        readFileSync(path.join(homedir(), '.sui', 'sui_config', 'sui.keystore'), 'utf8'),
    );

    for (const priv of keystore) {
        const raw = fromBase64(priv);
        if (raw[0] !== 0) {
            continue;
        }
        const pair = Ed25519Keypair.fromSecretKey(raw.slice(1));
        if (pair.getPublicKey().toSuiAddress() === sender) {
            return pair;
        }
    }

    throw new Error(`keypair not found for sender: ${sender}`);
};

/** Get the client for the specified network. */
export const getClient = (network) => {
    return new SuiClient({ url: getFullnodeUrl(network) });
};
/** A helper to sign & execute a transaction. */
export const signAndExecute = async (txb, network) => {
    const client = getClient(network);
    const signer = getSigner();
    return client.signAndExecuteTransaction({
        transaction: txb,
        signer,
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });
};
