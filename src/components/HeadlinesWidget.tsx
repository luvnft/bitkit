import React, { memo, ReactElement, useEffect, useState } from 'react';
import {
	View,
	TouchableOpacity,
	StyleSheet,
	StyleProp,
	ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Reader from '@synonymdev/slashtags-widget-news-feed/lib/reader';

import { Caption13M, Title } from '../styles/text';
import { openURL } from '../utils/helpers';
import { showToast } from '../utils/notifications';
import { useSlashtags2 } from '../hooks/slashtags2';
import BaseFeedWidget from './BaseFeedWidget';
import { TFeedWidget } from '../store/types/widgets';

type Article = {
	title: string;
	published: string;
	publishedDate: string;
	link: string;
	comments?: string;
	author?: string;
	categories?: string[];
	thumbnail?: string;
	publisher: {
		title: string;
		link: string;
		image?: string;
	};
};

const HeadlinesWidget = ({
	url,
	widget,
	isEditing = false,
	style,
	testID,
	onLongPress,
	onPressIn,
}: {
	url: string;
	widget: TFeedWidget;
	isEditing?: boolean;
	style?: StyleProp<ViewStyle>;
	testID?: string;
	onLongPress?: () => void;
	onPressIn?: () => void;
}): ReactElement => {
	const { t } = useTranslation('slashtags');
	const [article, setArticle] = useState<Article>();
	const [isLoading, setIsLoading] = useState(false);
	const { webRelayClient, webRelayUrl } = useSlashtags2();

	useEffect(() => {
		let unmounted = false;

		setIsLoading(true);

		const getData = async (): Promise<void> => {
			try {
				const reader = new Reader(
					webRelayClient,
					`${url}?relay=${webRelayUrl}`,
				);

				const allArticles = await reader.getAllArticles();
				const _article = allArticles
					.sort((a, b) => b.published - a.published)
					.slice(0, 10)[Math.floor(Math.random() * 10)];

				if (!unmounted && _article) {
					setArticle(_article);
					setIsLoading(false);
				}
			} catch (error) {
				console.error(error);
				setIsLoading(false);
				showToast({
					type: 'error',
					title: t('widget_error_drive'),
					description: `An error occurred: ${error.message}`,
				});
			}
		};

		getData();

		return () => {
			unmounted = true;
		};
	}, [url, t, webRelayClient, webRelayUrl]);

	return (
		<BaseFeedWidget
			style={style}
			url={url}
			name={t('widget_headlines')}
			showTitle={widget.extras?.showTitle}
			isLoading={isLoading}
			isEditing={isEditing}
			testID={testID}
			onPressIn={onPressIn}
			onLongPress={onLongPress}
			onPress={(): void => {
				if (!isEditing && article?.link) {
					openURL(article.link);
				}
			}}>
			<>
				<Title numberOfLines={2}>{article?.title}</Title>

				<TouchableOpacity
					style={styles.source}
					activeOpacity={0.9}
					onPress={(): void => {
						if (article?.comments) {
							openURL(article.comments);
						} else {
							openURL(article!.link);
						}
					}}>
					<View style={styles.columnLeft}>
						<Caption13M color="gray1" numberOfLines={1}>
							{t('widget_source')}
						</Caption13M>
					</View>
					<View style={styles.columnRight}>
						<Caption13M color="gray1" numberOfLines={1}>
							{article?.publisher.title}
						</Caption13M>
					</View>
				</TouchableOpacity>
			</>
		</BaseFeedWidget>
	);
};

const styles = StyleSheet.create({
	columnLeft: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	columnRight: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	source: {
		marginTop: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		// increase hitbox
		paddingBottom: 10,
		marginBottom: -10,
		paddingLeft: 10,
		marginLeft: -10,
		paddingRight: 10,
		marginRight: -10,
	},
});

export default memo(HeadlinesWidget);
