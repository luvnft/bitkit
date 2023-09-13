import { useEffect, useMemo, useState } from 'react';
import { Reader } from '@synonymdev/feeds';
import b4a from 'b4a';

import { webRelayClient, webRelayUrl } from '../components/SlashtagsProvider2';
import { SlashFeedJSON } from '../store/types/widgets';
import { SUPPORTED_FEED_TYPES, decodeWidgetFieldValue } from '../utils/widgets';

type Field = {
	name: string;
	value: string;
	unit?: string;
};

// Cache config files to reduce widgets layout shifts.
const cache: { [url: string]: { config: SlashFeedJSON } } = {};

export const useSlashfeed = (options: {
	url: string;
	fields?: SlashFeedJSON['fields'];
}): {
	reader: Reader;
	fields: Field[];
	config?: SlashFeedJSON;
	icon?: string;
	loading: boolean;
	failed: boolean;
} => {
	const [config, setConfig] = useState<SlashFeedJSON>(
		cache[options.url]?.config,
	);
	const [icon, setIcon] = useState<string>();
	const [fields, setFields] = useState<Field[]>([]);
	const [loading, setLoading] = useState(false);
	const [failed, setFailed] = useState(false);

	const reader = useMemo(() => {
		return new Reader(webRelayClient, `${options.url}?relay=${webRelayUrl}`);
	}, [options.url]);

	useEffect(() => {
		let unmounted = false;

		setLoading(true);

		const getData = async (): Promise<void> => {
			try {
				await reader.ready();

				if (!reader.config) {
					setFailed(true);
					setLoading(false);
					return;
				}

				cache[options.url] = cache[options.url] || {};
				cache[options.url].config = reader.config as SlashFeedJSON;

				setConfig(reader.config as SlashFeedJSON);

				if (reader.config.icons && reader.icon) {
					// Always assume it is an svg icon
					setIcon(b4a.toString(reader.icon));
				}

				const _fields = options.fields ?? reader.config.fields ?? [];

				// Don't continue for news & facts feeds
				if (
					reader.config.type === SUPPORTED_FEED_TYPES.FACTS_FEED ||
					reader.config.type === SUPPORTED_FEED_TYPES.HEADLINES_FEED ||
					reader.config.type === SUPPORTED_FEED_TYPES.LUGANO_FEED
				) {
					setLoading(false);
					return;
				}

				const promises = _fields.map(async (field) => {
					// TODO: Use reader.getField(field.name) after merging and publishing https://github.com/synonymdev/slashtags-feeds/pull/11
					const fieldName = field.main.replace('/feed/', '');
					const value = await reader.getField(fieldName);
					const formattedValue = decodeWidgetFieldValue(
						reader.config.type ?? '',
						field,
						value,
					);
					return {
						name: field.name as string,
						value: formattedValue as string,
					};
				});

				const values = await Promise.all(promises);

				if (!unmounted) {
					setFields(values);
					setLoading(false);
				}
			} catch (error) {
				console.error(error);
				setLoading(false);
				setFailed(true);
			}
		};

		getData();

		return () => {
			unmounted = true;
		};
	}, [reader, options.url, options.fields]);

	return {
		reader,
		config,
		icon,
		fields,
		loading,
		failed,
	};
};
