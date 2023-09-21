import {
	BACKUPS_SERVER_SLASHTAG,
	BACKUPS_SHARED_SECRET,
	BLOCKTANK_HOST,
	DISABLE_SLASHTAGS,
	E2E,
	ELECTRUM_BITCOIN_HOST,
	ELECTRUM_BITCOIN_PROTO,
	ELECTRUM_BITCOIN_SSL_PORT,
	ELECTRUM_BITCOIN_TCP_PORT,
	ELECTRUM_REGTEST_HOST,
	ELECTRUM_REGTEST_PROTO,
	ELECTRUM_REGTEST_SSL_PORT,
	ELECTRUM_REGTEST_TCP_PORT,
	ELECTRUM_SIGNET_HOST,
	ELECTRUM_SIGNET_PROTO,
	ELECTRUM_SIGNET_SSL_PORT,
	ELECTRUM_SIGNET_TCP_PORT,
	ENABLE_I18NEXT_DEBUGGER,
	ENABLE_LDK_LOGS,
	ENABLE_MIGRATION_DEBUG,
	ENABLE_MMKV_FLIPPER,
	ENABLE_REDUX_FLIPPER,
	ENABLE_REDUX_IMMUTABLE_CHECK,
	ENABLE_REDUX_LOGGER,
	SLASHTAGS_SEEDER_BASE_URL,
	SLASHTAGS_SEEDER_TOPIC,
	TRUSTED_ZERO_CONF_PEERS,
	WALLET_DEFAULT_SELECTED_NETWORK,
	WEB_RELAY,
} from '@env';
import { isProtocol } from '../store/types/settings';
import { isBitcoinNetwork } from '../utils/networks';

if (!isBitcoinNetwork(WALLET_DEFAULT_SELECTED_NETWORK)) {
	throw new Error(
		`${WALLET_DEFAULT_SELECTED_NETWORK} is not a valid Bitcoin network.`,
	);
}

if (!isProtocol(ELECTRUM_BITCOIN_PROTO)) {
	throw new Error(`${ELECTRUM_BITCOIN_PROTO} is not a valid protocol.`);
}

if (!isProtocol(ELECTRUM_REGTEST_PROTO)) {
	throw new Error(`${ELECTRUM_REGTEST_PROTO} is not a valid protocol.`);
}

if (!isProtocol(ELECTRUM_SIGNET_PROTO)) {
	throw new Error(`${ELECTRUM_SIGNET_PROTO} is not a valid protocol.`);
}

export const __JEST__ = process.env.JEST_WORKER_ID !== undefined;

export const __ENABLE_REDUX_FLIPPER__ =
	ENABLE_REDUX_FLIPPER === 'true' ?? false;
export const __ENABLE_REDUX_LOGGER__ = ENABLE_REDUX_LOGGER === 'true' ?? true;
export const __ENABLE_MIGRATION_DEBUG__ =
	ENABLE_MIGRATION_DEBUG === 'true' ?? false;
export const __ENABLE_REDUX_IMMUTABLE_CHECK__ =
	__DEV__ && ENABLE_REDUX_IMMUTABLE_CHECK
		? ENABLE_REDUX_IMMUTABLE_CHECK === 'true'
		: false;

export const __ENABLE_MMKV_FLIPPER__ =
	ENABLE_MMKV_FLIPPER === 'true' ?? __DEV__;
export const __ENABLE_I18NEXT_DEBUGGER__ =
	ENABLE_I18NEXT_DEBUGGER === 'true' ?? __DEV__;

export const __ENABLE_LDK_LOGS__ = ENABLE_LDK_LOGS === 'true' ?? __DEV__;

export const __BACKUPS_SHARED_SECRET__ = BACKUPS_SHARED_SECRET;
export const __BACKUPS_SERVER_SLASHTAG__ = BACKUPS_SERVER_SLASHTAG;

export const __DISABLE_SLASHTAGS__ = DISABLE_SLASHTAGS === 'true';
export const __SLASHTAGS_SEEDER_BASE_URL__ = SLASHTAGS_SEEDER_BASE_URL;
export const __SLASHTAGS_SEEDER_TOPIC__ = SLASHTAGS_SEEDER_TOPIC;

export const __BLOCKTANK_HOST__ = BLOCKTANK_HOST;

export const __ELECTRUM_BITCOIN_HOST__ = ELECTRUM_BITCOIN_HOST;
export const __ELECTRUM_BITCOIN_SSL_PORT__ = ELECTRUM_BITCOIN_SSL_PORT;
export const __ELECTRUM_BITCOIN_TCP_PORT__ = ELECTRUM_BITCOIN_TCP_PORT;
export const __ELECTRUM_BITCOIN_PROTO__ = ELECTRUM_BITCOIN_PROTO;
export const __ELECTRUM_REGTEST_HOST__ = ELECTRUM_REGTEST_HOST;
export const __ELECTRUM_REGTEST_SSL_PORT__ = ELECTRUM_REGTEST_SSL_PORT;
export const __ELECTRUM_REGTEST_TCP_PORT__ = ELECTRUM_REGTEST_TCP_PORT;
export const __ELECTRUM_REGTEST_PROTO__ = ELECTRUM_REGTEST_PROTO;
export const __ELECTRUM_SIGNET_HOST__ = ELECTRUM_SIGNET_HOST;
export const __ELECTRUM_SIGNET_SSL_PORT__ = ELECTRUM_SIGNET_SSL_PORT;
export const __ELECTRUM_SIGNET_TCP_PORT__ = ELECTRUM_SIGNET_TCP_PORT;
export const __ELECTRUM_SIGNET_PROTO__ = ELECTRUM_SIGNET_PROTO;

export const __TRUSTED_ZERO_CONF_PEERS__ = TRUSTED_ZERO_CONF_PEERS.split(
	',',
).map((nodeId) => nodeId.trim());

export const __WALLET_DEFAULT_SELECTED_NETWORK__ =
	WALLET_DEFAULT_SELECTED_NETWORK;

export const __E2E__ = E2E === 'true';
export const __WEB_RELAY__ = WEB_RELAY;
