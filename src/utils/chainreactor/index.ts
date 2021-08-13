import {
	IBuyChannelRequest,
	IBuyChannelResponse,
	IGetInfoResponse,
	IGetOrderResponse,
} from './types';
import { err, ok, Result } from '../result';

class ChainReactor {
	private host = '';

	constructor() {
		this.setNetwork('regtest');
	}

	setNetwork(network: 'mainnet' | 'testnet' | 'regtest'): void {
		switch (network) {
			case 'mainnet': {
				this.host = '';
				break;
			}
			case 'testnet': {
				this.host = '';
				break;
			}
			case 'regtest': {
				this.host = 'http://35.233.47.252:443/chainreactor/v1/';
			}
		}
	}

	static getStateMessage(code: number): string {
		switch (code) {
			case 450:
				return 'CLOSED';
			case 0:
				return 'CREATED';
			case 400:
				return 'GIVE_UP';
			case 500:
				return 'OPEN';
			case 300:
				return 'OPENING';
			case 100:
				return 'PAID';
		}

		return `Unknown code: ${code}`;
	}

	async call<T, Req>(
		path: string,
		method: 'GET' | 'POST',
		request?: Req,
	): Promise<T> {
		const url = `${this.host}${path}`;

		const fetchRes = await fetch(url, {
			method,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: request ? JSON.stringify(request) : undefined,
		});

		if (fetchRes.status !== 200) {
			throw new Error(`HTTP error ${fetchRes.status}`);
		}
		const body = await fetchRes.json();

		if (!body) {
			throw new Error('Unknown HTTP error');
		}

		if (body.error) {
			throw new Error(body.error);
		}

		return body as T;
	}

	async getInfo(): Promise<Result<IGetInfoResponse>> {
		try {
			const res: IGetInfoResponse = await this.call('node/info', 'GET');
			return ok(res);
		} catch (e) {
			return err(e);
		}
	}

	async buyChannel(
		req: IBuyChannelRequest,
	): Promise<Result<IBuyChannelResponse>> {
		try {
			const res: IBuyChannelResponse = await this.call(
				'channel/buy',
				'POST',
				req,
			);

			res.price = Number(res.price);
			res.total_amount = Number(res.total_amount);

			return ok(res);
		} catch (e) {
			return err(e);
		}
	}

	async getOrder(orderId: string): Promise<Result<IGetOrderResponse>> {
		try {
			const res: IGetOrderResponse = await this.call(
				`channel/order?order_id=${orderId}`,
				'GET',
			);

			res.amount_received = res.amount_received
				? Number(res.amount_received)
				: 0;

			res.onchain_payments.forEach((payment, index) => {
				res.onchain_payments[index] = {
					...payment,
					amount_base: Number(payment.amount_base),
					fee_base: Number(payment.fee_base),
				};
			});

			res.total_amount = Number(res.total_amount);
			res.stateMessage = ChainReactor.getStateMessage(res.state);

			return ok(res);
		} catch (e) {
			return err(e);
		}
	}
}

const cr = new ChainReactor();

export default cr;
