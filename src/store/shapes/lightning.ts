import { TLightningState, TNode } from '../types/lightning';
import { defaultWalletShape, getNetworkContent } from './wallet';

export const defaultLightningShape: TNode = {
	nodeId: getNetworkContent(''),
	info: getNetworkContent({}),
	channels: getNetworkContent({}),
	openChannelIds: getNetworkContent([]),
	peers: getNetworkContent([]),
	claimableBalances: getNetworkContent([]),
};

export const initialLightningState: TLightningState = {
	accountVersion: 1,
	version: {
		ldk: '',
		c_bindings: '',
	},
	nodes: {
		[defaultWalletShape.id]: defaultLightningShape,
	},
};
