import React, {
	PropsWithChildren,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { Text, TextInput, View } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import Divider from '../../components/Divider';
import useDisplayValues from '../../utils/exchange-rate/useDisplayValues';
import { IService } from '../../utils/chainreactor/types';
import Button from '../../components/Button';
import { buyChannel, refreshOrder } from '../../store/actions/chainreactor';
import {
	showErrorNotification,
	showSuccessNotification,
} from '../../utils/notifications';
import { claimChannel } from '../../store/actions/lightning';
import { useSelector } from 'react-redux';
import Store from '../../store/types';

interface Props extends PropsWithChildren<any> {
	route: { params: { service: IService } };
	navigation: any;
}

const Order = (props: Props): ReactElement => {
	const {
		service: {
			product_id,
			product_name,
			min_channel_size,
			max_channel_size,
			max_chan_expiry,
		},
	} = props.route.params;
	const { navigation } = props;

	const [isProcessing, setIsProcessing] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [orderId, setOrderId] = useState<string>('');

	const order = useSelector((state: Store) => {
		if (!orderId) {
			return null;
		}

		return state.chainreactor.orders.find((o) => o._id === orderId);
	});

	const [remoteBalance, setRemoteBalance] = useState('0');
	const [localBalance, setLocalBalance] = useState(`${min_channel_size}`);

	const minChannelSizeDisplay = useDisplayValues(min_channel_size);
	const maxChannelSizeDisplay = useDisplayValues(max_channel_size);

	const onOrder = async (): Promise<void> => {
		setIsProcessing(true);
		const res = await buyChannel({
			product_id,
			channel_expiry: max_chan_expiry,
			remote_balance: Number(remoteBalance),
			local_balance: Number(localBalance),
		});

		if (res.isErr()) {
			setIsProcessing(false);
			return showErrorNotification({
				title: 'Order failed',
				message: res.error.message,
			});
		}

		setOrderId(res.value.order_id);
		setIsProcessing(false);

		navigation.navigate('ChainReactorPayment', {
			order: res.value,
		});
	};

	const onClaimChannel = async (): Promise<void> => {
		if (!order) {
			return;
		}

		const { tag, uri, k1, callback } = order.lnurl;
		const res = await claimChannel({ tag, uri, k1, callback, domain: '' });
		if (res.isErr()) {
			return showErrorNotification({
				title: 'Failed to claim channel',
				message: res.error.message,
			});
		}

		showSuccessNotification({ title: 'Channel claimed', message: res.value });
	};

	const onRefreshOrder = useCallback(async (): Promise<void> => {
		if (!orderId) {
			return;
		}

		setIsRefreshing(true);

		const res = await refreshOrder(orderId);
		if (res.isErr()) {
			showErrorNotification({
				title: 'Failed to refresh order',
				message: res.error.message,
			});
		}

		setIsRefreshing(false);
	}, [orderId]);

	useEffect(() => {
		onRefreshOrder().catch();
	}, [onRefreshOrder]);

	return (
		<View style={styles.container}>
			<NavigationHeader title={product_name} />
			<View style={styles.content}>
				{order ? (
					<View>
						<Text>Order: {order?._id}</Text>
						<Text>State: {order?.stateMessage}</Text>
						<Text>{order ? 'Channel available' : 'No order'}</Text>
					</View>
				) : (
					<View>
						<Text style={styles.price}>
							Min channel size: {minChannelSizeDisplay.bitcoinSymbol}
							{minChannelSizeDisplay.bitcoinFormatted} (
							{minChannelSizeDisplay.fiatSymbol}
							{minChannelSizeDisplay.fiatFormatted})
						</Text>

						<Text style={styles.price}>
							Max channel size: {maxChannelSizeDisplay.bitcoinSymbol}
							{maxChannelSizeDisplay.bitcoinFormatted} (
							{maxChannelSizeDisplay.fiatSymbol}
							{maxChannelSizeDisplay.fiatFormatted})
						</Text>
						<Divider />

						<Text>Can receive</Text>
						<TextInput
							textAlignVertical={'center'}
							underlineColorAndroid="transparent"
							style={styles.textInput}
							placeholder="Can receive"
							autoCapitalize="none"
							autoCompleteType="off"
							keyboardType="number-pad"
							autoCorrect={false}
							onChangeText={setLocalBalance}
							value={localBalance}
						/>

						<Text>Can send</Text>
						<TextInput
							textAlignVertical={'center'}
							underlineColorAndroid="transparent"
							style={styles.textInput}
							placeholder="Can send"
							autoCapitalize="none"
							autoCompleteType="off"
							keyboardType="number-pad"
							autoCorrect={false}
							onChangeText={setRemoteBalance}
							value={remoteBalance}
						/>
					</View>
				)}

				<View style={styles.footer}>
					<Divider />

					{orderId ? (
						<>
							<Button
								text={isRefreshing ? 'Refreshing...' : 'Refresh order'}
								disabled={isRefreshing}
								onPress={onRefreshOrder}
							/>
							<Button
								text={isProcessing ? 'Claiming...' : 'Claim channel'}
								disabled={isProcessing}
								onPress={onClaimChannel}
							/>
						</>
					) : (
						<Button
							text={isProcessing ? 'Ordering...' : 'Order'}
							disabled={isProcessing}
							onPress={onOrder}
						/>
					)}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingLeft: 20,
		paddingRight: 20,
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	footer: {
		paddingBottom: 20,
	},
	price: {
		marginVertical: 10,
		fontSize: 14,
	},
	textInput: {
		minHeight: 50,
		borderRadius: 5,
		fontWeight: 'bold',
		fontSize: 18,
		textAlign: 'center',
		color: 'gray',
		borderBottomWidth: 1,
		borderColor: 'gray',
		paddingHorizontal: 10,
		backgroundColor: 'white',
		marginVertical: 5,
	},
});

export default Order;
