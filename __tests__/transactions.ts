// Fix 'getDispatch is not a function'
import '../src/store/utils/ui';
import {
	createWallet,
	setupOnChainTransaction,
	updateSendTransaction,
	updateWallet,
} from '../src/store/actions/wallet';
import { getSelectedWallet } from '../src/utils/wallet';
import { EAvailableNetwork } from '../src/utils/networks';
import { mnemonic, walletState } from './utils/dummy-wallet';
import { createTransaction } from '../src/utils/wallet/transactions';
import { isValidBech32mEncodedString } from '../src/utils/scanner';

const selectedNetwork = EAvailableNetwork.bitcoinTestnet;

describe('On chain transactions', () => {
	beforeAll(async () => {
		require('../nodejs-assets/nodejs-project/main.js');

		//Seed wallet data including utxo and transaction data
		await createWallet({
			mnemonic,
			addressAmount: 5,
			changeAddressAmount: 5,
			selectedNetwork,
		});

		updateWallet({ wallets: { wallet0: walletState } });

		await setupOnChainTransaction({ selectedNetwork });
	});

	it('Creates a transaction sending to a taproot address', async () => {
		const selectedWallet = getSelectedWallet();

		const taprootAddress =
			'tb1p0v28xrt49aunergvzw63pve3r3u4ylvg0k65860kdj0l26xc9dpqhqel9g';
		const { isValid, network } = isValidBech32mEncodedString(taprootAddress);
		expect(isValid).toEqual(true);
		expect(network).toEqual('bitcoinTestnet');

		updateSendTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
				rbf: true,
				outputs: [
					{
						value: 10001,
						index: 0,
						address: taprootAddress,
					},
				],
			},
		});

		const res = await createTransaction({
			selectedNetwork,
			selectedWallet,
		});

		if (res.isErr()) {
			throw res.error;
		}

		expect(res.value.hex).toEqual(
			'020000000001020c0eab3149ba3ed7abd8f4c98eabe2cbb2b7c3590404b66ca0f01addf61ec67100000000000000000051bd848851cadb71bf34e6e0e46b0c4214c2d06ccc1d5ca0f5baefdcf86269200000000000000000000211270000000000002251207b14730d752f793c8d0c13b510b3311c79527d887db543e9f66c9ff568d82b426ecd010000000000160014669a9323418693b81d44c19da7b1fe7911b2142902473044022034623cf80029f4432bc481762587f3889efaae55b6a24c7448d5dab5223c9187022043bd46754851ac0af772f40b07b3e2b29c3ec7f4fdebc53e4d1766a12db2405201210318cb16a8e659f378002e75abe93f064c4ebcd62576bc15019281b635f96840a80247304402204c4a2f78b5908f75f8d450c0beaaaa9caada0977cdb294591fd4fdc82a2b005d022079fc0dd869ec53552fc4d9e72557c7b1e7cb5ee6f81a2f844c8ef2c6b099cc05012102bb6083f2571ecd26f68edeae341c0700463349a84b2044c271e061e813e0cd0300000000',
		);

		expect(res.value.id).toEqual(
			'859fdf43d1c74cf05454dc3376b5e19cc48171a1e049646abc3b0f44343c7a8a',
		);
	});

	it('Creates an on chain transaction from the transaction store', async () => {
		const selectedWallet = getSelectedWallet();

		updateSendTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
				rbf: true,
				outputs: [
					{
						value: 10001,
						index: 0,
						address: '2N4Pe5o1sZKcXdYC3JVVeJKMXCmEZgVEQFa',
					},
				],
			},
		});

		const res = await createTransaction({
			selectedNetwork,
			selectedWallet,
		});

		if (res.isErr()) {
			throw res.error;
		}

		expect(res.value.hex).toEqual(
			'020000000001020c0eab3149ba3ed7abd8f4c98eabe2cbb2b7c3590404b66ca0f01addf61ec67100000000000000000051bd848851cadb71bf34e6e0e46b0c4214c2d06ccc1d5ca0f5baefdcf862692000000000000000000002112700000000000017a9147a40d326e4de19353e2bf8b3f15b395c88b2d241876ecd010000000000160014669a9323418693b81d44c19da7b1fe7911b2142902483045022100e5bf3be5b8626fc72447cee78684416b8e23b905087c8dfadb69732124fd5ba6022021fa2fe097afde801ae0495f95a11b0bfc8273804b88ed63861d72a16548593101210318cb16a8e659f378002e75abe93f064c4ebcd62576bc15019281b635f96840a802483045022100ab9a47bf65d5855e19badaf60b6e74e454b3bcc0af3c7f465b32070a06781b920220336169c94789a4a17b6e22f9a094f3775da96c82f9c4ac57ebcea8e90885bf16012102bb6083f2571ecd26f68edeae341c0700463349a84b2044c271e061e813e0cd0300000000',
		);

		expect(res.value.id).toEqual(
			'4155049f78ff36c13dd9ca4c657799600115579a86bb465601ec8ca0af9f6982',
		);
	});
});
