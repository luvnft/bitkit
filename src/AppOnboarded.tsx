import React, { memo, ReactElement, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';

import RootNavigator from './navigation/root/RootNavigator';
import InactivityTracker from './components/InactivityTracker';
import { startWalletServices } from './utils/startup';
import { electrumConnection } from './utils/electrum';
import { unsubscribeFromLightningSubscriptions } from './utils/lightning';
import i18n from './utils/i18n';
import { useAppSelector } from './hooks/redux';
import { useMigrateSlashtags2 } from './hooks/slashtags2';
import { dispatch, getStore } from './store/helpers';
import { updateUi } from './store/slices/ui';
import { isOnlineSelector } from './store/reselect/ui';
import {
	hideBalanceOnOpenSelector,
	pinOnLaunchSelector,
	pinSelector,
} from './store/reselect/settings';
import { showToast } from './utils/notifications';
import {
	selectedNetworkSelector,
	selectedWalletSelector,
} from './store/reselect/wallet';
import { updateSettings } from './store/slices/settings';

const onElectrumConnectionChange = (isConnected: boolean): void => {
	// get state fresh from store everytime
	const { isConnectedToElectrum } = getStore().ui;

	if (!isConnectedToElectrum && isConnected) {
		dispatch(updateUi({ isConnectedToElectrum: isConnected }));
		showToast({
			type: 'success',
			title: i18n.t('other:connection_restored_title'),
			description: i18n.t('other:connection_restored_message'),
		});
	}

	if (isConnectedToElectrum && !isConnected) {
		dispatch(updateUi({ isConnectedToElectrum: isConnected }));
		showToast({
			type: 'error',
			title: i18n.t('other:connection_reconnect_title'),
			description: i18n.t('other:connection_reconnect_msg'),
		});
	}
};

const AppOnboarded = (): ReactElement => {
	const { t } = useTranslation('other');
	const appState = useRef(AppState.currentState);
	const selectedWallet = useAppSelector(selectedWalletSelector);
	const selectedNetwork = useAppSelector(selectedNetworkSelector);
	const hideBalanceOnOpen = useAppSelector(hideBalanceOnOpenSelector);
	const pin = useAppSelector(pinSelector);
	const pinOnLaunch = useAppSelector(pinOnLaunchSelector);
	const isOnline = useAppSelector(isOnlineSelector);

	// migrate slashtags from v1 to v2
	useMigrateSlashtags2();

	// on App start
	useEffect(() => {
		startWalletServices({ selectedNetwork, selectedWallet });

		const needsAuth = pin && pinOnLaunch;
		dispatch(updateUi({ isAuthenticated: !needsAuth }));

		if (hideBalanceOnOpen) {
			dispatch(updateSettings({ hideBalance: true }));
		}

		return () => {
			unsubscribeFromLightningSubscriptions();
		};
		// onMount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		let electrumSubscription = electrumConnection.subscribe(
			onElectrumConnectionChange,
		);

		// on AppState change
		const appStateSubscription = AppState.addEventListener(
			'change',
			(nextAppState) => {
				// on App to foreground
				if (
					appState.current.match(/inactive|background/) &&
					nextAppState === 'active'
				) {
					// resubscribe to electrum connection changes
					electrumSubscription = electrumConnection.subscribe(
						onElectrumConnectionChange,
					);
				}

				// on App to background
				if (
					appState.current.match(/active|inactive/) &&
					nextAppState === 'background'
				) {
					// resetLdk().then();
					electrumSubscription.remove();
				}

				appState.current = nextAppState;
			},
		);

		return () => {
			appStateSubscription.remove();
			electrumSubscription.remove();
		};
		// onMount
	}, []);

	useEffect(() => {
		// subscribe to connection information
		const unsubscribeNetInfo = NetInfo.addEventListener(({ isConnected }) => {
			if (isConnected) {
				// prevent toast from showing on startup
				if (isOnline !== isConnected) {
					showToast({
						type: 'success',
						title: t('connection_back_title'),
						description: t('connection_back_msg'),
					});
				}
				dispatch(updateUi({ isOnline: true }));
			} else {
				showToast({
					type: 'error',
					title: t('connection_issue'),
					description: t('connection_issue_explain'),
				});
				dispatch(updateUi({ isOnline: false }));
			}
		});

		return () => {
			unsubscribeNetInfo();
		};
	}, [isOnline, t]);

	return (
		<InactivityTracker>
			<RootNavigator />
		</InactivityTracker>
	);
};

export default memo(AppOnboarded);
