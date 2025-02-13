import { EAvailableNetwork } from '../networks';

export enum ENodeJsMethod {
	setup = 'setup',
	generateMnemonic = 'generateMnemonic',
	getPrivateKey = 'getPrivateKey',
	getScriptHash = 'getScriptHash',
	getAddress = 'getAddress',
}

export type TNodeJsMethodsData =
	| INodeJsSetup
	| INodeJsGetPrivateKey
	| INodeJsGenerateMnemonic
	| INodeJsGetAddress
	| INodeJsGetScriptHash;

export interface IInvokeNodeJsMethod {
	data: TNodeJsMethodsData;
}

export interface INodeJsSetup {
	id: string;
	method: ENodeJsMethod.setup;
	data: {
		mnemonic: string;
		bip39Passphrase?: string;
		selectedNetwork?: EAvailableNetwork;
	};
}

export interface INodeJsGenerateMnemonic {
	id: string;
	method: ENodeJsMethod.generateMnemonic;
	data: {
		strength?: number;
	};
}

export interface INodeJsGetPrivateKey {
	id: string;
	method: ENodeJsMethod.getPrivateKey;
	data: {
		mnemonic: string;
		bip39Passphrase: string;
		path: string;
		selectedNetwork?: EAvailableNetwork;
	};
}

export interface INodeJsGetScriptHash {
	id: string;
	method: ENodeJsMethod.getScriptHash;
	data: {
		address: string;
		selectedNetwork?: EAvailableNetwork;
	};
}

export interface INodeJsGetAddress {
	id: string;
	method: ENodeJsMethod.getAddress;
	data: {
		path: string;
		type: string;
		selectedNetwork?: EAvailableNetwork;
	};
}
