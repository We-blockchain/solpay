import { type Cluster, clusterApiUrl, Connection } from '@solana/web3.js';

var connection = new Connection(clusterApiUrl('mainnet-beta'));

/**
 * @see {@link getConnection}
 */
export function setCluster(cluster?: Cluster): Connection {
    connection = new Connection(clusterApiUrl(cluster ? cluster : 'mainnet-beta'));
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