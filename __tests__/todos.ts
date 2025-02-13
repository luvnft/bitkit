import assert from 'node:assert';
import cloneDeep from 'lodash/cloneDeep';
import { TChannel } from '@synonymdev/react-native-ldk';
import { IBtOrder } from '@synonymdev/blocktank-lsp-http-client';

import '../src/utils/i18n';
import { todosFullSelector } from '../src/store/reselect/todos';
import store, { RootState } from '../src/store';

import { updateWallet } from '../src/store/actions/wallet';
import {
	backupSeedPhraseTodo,
	btFailedTodo,
	buyBitcoinTodo,
	lightningConnectingTodo,
	lightningReadyTodo,
	lightningSettingUpTodo,
	lightningTodo,
	pinTodo,
	slashtagsProfileTodo,
	transferClosingChannel,
	transferToSavingsTodo,
	transferToSpendingTodo,
} from '../src/store/shapes/todos';
import { createNewWallet } from '../src/utils/startup';
import { EAvailableNetwork } from '../src/utils/networks';

describe('Todos selector', () => {
	let s: RootState;

	beforeAll(async () => {
		require('../nodejs-assets/nodejs-project/main.js');
		let res = await createNewWallet();
		if (res.isErr()) {
			throw res.error;
		}
		updateWallet({ selectedNetwork: EAvailableNetwork.bitcoinRegtest });
		s = store.getState();
	});

	it('should return default set of todos', () => {
		assert.deepEqual(todosFullSelector(s), [
			backupSeedPhraseTodo,
			lightningTodo,
			pinTodo,
			slashtagsProfileTodo,
			buyBitcoinTodo,
		]);
	});

	it('should not return pinTodo if PIN is set', () => {
		const state = cloneDeep(s);
		state.settings.pin = true;

		expect(todosFullSelector(state)).not.toEqual(
			expect.arrayContaining([pinTodo]),
		);
	});

	it('should not return backupSeedPhraseTodo if backup is verified', () => {
		const state = cloneDeep(s);
		state.user.backupVerified = true;

		expect(todosFullSelector(state)).not.toEqual(
			expect.arrayContaining([backupSeedPhraseTodo]),
		);
	});

	it('should not return slashtagsProfileTodo if profile is set', () => {
		const state = cloneDeep(s);
		state.slashtags.onboardingProfileStep = 'Done';

		expect(todosFullSelector(state)).not.toEqual(
			expect.arrayContaining([slashtagsProfileTodo]),
		);
	});

	it('should not return hidden todos', () => {
		const state = cloneDeep(s);

		const order = {
			id: 'order1',
			state: 'expired',
			// expired 10 days ago
			orderExpiresAt: new Date(
				new Date().getTime() - 10 * 24 * 60 * 60 * 1000,
			).toISOString(),
		} as IBtOrder;
		state.blocktank.paidOrders = { order1: 'txid' };
		state.blocktank.orders = [order];

		state.todos.hide = {
			backupSeedPhrase: +new Date(),
			btFailed: +new Date(),
			buyBitcoin: +new Date(),
			lightning: +new Date(),
			pin: +new Date(),
			slashtagsProfile: +new Date(),
		};

		assert.deepEqual(todosFullSelector(state), []);
	});

	it('should return lightningSettingUpTodo if there is a pending BT order', () => {
		const state = cloneDeep(s);
		state.blocktank.orders.push({
			id: 'order1',
			state: 'created',
		} as IBtOrder);
		state.blocktank.paidOrders = { order1: 'txid' };

		expect(todosFullSelector(state)).toEqual(
			expect.arrayContaining([lightningSettingUpTodo]),
		);
	});

	it('should return lightningConnectingTodo if there is a pending channel', () => {
		const state = cloneDeep(s);

		const channel1 = {
			channel_id: 'channel1',
			is_channel_ready: false,
		} as TChannel;
		state.lightning.nodes.wallet0.channels.bitcoinRegtest = { channel1 };
		state.lightning.nodes.wallet0.openChannelIds.bitcoinRegtest = ['channel1'];

		expect(todosFullSelector(state)).toEqual(
			expect.arrayContaining([lightningConnectingTodo]),
		);
	});

	it('should return transferClosingChannel if there are gracefully closing channels', () => {
		const state = cloneDeep(s);

		const channel1 = {
			channel_id: 'channel1',
			is_channel_ready: true,
		} as TChannel;
		state.lightning.nodes.wallet0.channels.bitcoinRegtest = { channel1 };
		state.lightning.nodes.wallet0.openChannelIds.bitcoinRegtest = ['channel1'];
		state.user.startCoopCloseTimestamp = 123;

		expect(todosFullSelector(state)).toEqual(
			expect.arrayContaining([transferClosingChannel]),
		);
	});

	it('should return transferToSpendingTodo if there are new pending BT orders', () => {
		const state = cloneDeep(s);

		const channel1 = {
			channel_id: 'channel1',
			is_channel_ready: true,
		} as TChannel;
		state.lightning.nodes.wallet0.channels.bitcoinRegtest = { channel1 };
		state.lightning.nodes.wallet0.openChannelIds.bitcoinRegtest = ['channel1'];
		state.blocktank.orders.push({ id: 'order1', state: 'created' } as IBtOrder);
		state.blocktank.paidOrders = { order1: 'txid' };

		expect(todosFullSelector(state)).toEqual(
			expect.arrayContaining([transferToSpendingTodo]),
		);
	});

	it('should return transferToSavingsTodo if there is a new claimable balance', () => {
		const state = cloneDeep(s);

		const channel1 = {
			channel_id: 'channel1',
			is_channel_ready: true,
		} as TChannel;
		state.lightning.nodes.wallet0.channels.bitcoinRegtest = { channel1 };
		state.lightning.nodes.wallet0.openChannelIds.bitcoinRegtest = ['channel1'];
		state.lightning.nodes.wallet0.claimableBalances.bitcoinRegtest = [
			{ amount_satoshis: 123, type: 'ClaimableOnChannelClose' },
		];

		expect(todosFullSelector(state)).toEqual(
			expect.arrayContaining([transferToSavingsTodo]),
		);
	});

	it('should return lightningReadyTodo if there is a new open channel', () => {
		const state = cloneDeep(s);

		const channel1 = {
			channel_id: 'channel1',
			is_channel_ready: true,
			confirmations: 1,
			confirmations_required: 1,
		} as TChannel;
		state.lightning.nodes.wallet0.channels.bitcoinRegtest = { channel1 };
		state.lightning.nodes.wallet0.openChannelIds.bitcoinRegtest = ['channel1'];

		expect(todosFullSelector(state)).toEqual(
			expect.arrayContaining([lightningReadyTodo]),
		);
	});

	it('should return not lightningReadyTodo if notification has already been shown', () => {
		const state = cloneDeep(s);

		const channel1 = {
			channel_id: 'channel1',
			is_channel_ready: true,
			confirmations: 1,
			confirmations_required: 1,
		} as TChannel;
		state.lightning.nodes.wallet0.channels.bitcoinRegtest = { channel1 };
		state.lightning.nodes.wallet0.openChannelIds.bitcoinRegtest = ['channel1'];
		state.todos.newChannelsNotifications = { channel1: +new Date() };

		expect(todosFullSelector(state)).not.toEqual(
			expect.arrayContaining([lightningReadyTodo]),
		);
	});

	it('should return btFailedTodo if there is a failed BT order', () => {
		const state = cloneDeep(s);

		const order = {
			id: 'order1',
			state: 'expired',
			orderExpiresAt: new Date().toISOString(),
		} as IBtOrder;
		state.blocktank.paidOrders = { order1: 'txid' };
		state.blocktank.orders = [order];

		expect(todosFullSelector(state)).toEqual(
			expect.arrayContaining([btFailedTodo]),
		);
	});

	it('should return btFailedTodo if there is a failed BT order and the previous one was hidden', () => {
		const state = cloneDeep(s);

		const order = {
			id: 'order1',
			state: 'expired',
			orderExpiresAt: new Date().toISOString(),
		} as IBtOrder;
		state.blocktank.paidOrders = { order1: 'txid' };
		state.blocktank.orders = [order];

		// mark btFinishedTodo as hidden
		state.todos.hide.btFailed = +new Date() - 60 * 1000;

		expect(todosFullSelector(state)).toEqual(
			expect.arrayContaining([btFailedTodo]),
		);
	});
});
