import { type Cluster, clusterApiUrl, Connection } from '@solana/web3.js';

var connection = new Connection(clusterApiUrl('mainnet-beta'));

/**
 * Example:
 * ```
 * setCluster('devnet');
 * var connection = getConnection();
 * 
 * var connection = setCluster(null, `https://mainnet.helius-rpc.com/?api-key=${key}`);
 * ```
 * @see {@link getConnection}
 */
export function setCluster(cluster?: Cluster | null, customEndpoint?: string): Connection {
    connection = new Connection(customEndpoint || clusterApiUrl(cluster ? cluster : 'mainnet-beta'));
    return connection;
}

/**
 * Get a web3 connection, default cluster: mainnet-beta.
 * 
 * Use `setCluster('devnet')` to change cluster.
 */
export function getConnection(): Connection {
    return connection;
}