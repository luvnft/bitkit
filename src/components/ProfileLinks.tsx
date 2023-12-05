import React, { ReactElement } from 'react';
import {
	View,
	TouchableOpacity,
	StyleProp,
	StyleSheet,
	ViewStyle,
	Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Caption13Up, Text02M, Text02S } from '../styles/text';
import { TrashIcon } from '../styles/icons';
import { LocalLink } from '../store/types/slashtags';
import { editLink, removeLink } from '../store/actions/slashtags';
import LabeledInput from './LabeledInput';
import Divider from './Divider';
import { suggestions } from '../screens/Profile/ProfileLinkSuggestions';

const trimLink = (link: LocalLink): string => {
	let trimmedUrl = link.url;
	const suggestion = suggestions.find((s) => s.title === link.title);
	const AtPrefixed = ['TikTok', 'Twitter', 'YouTube'];

	if (suggestion) {
		if (AtPrefixed.includes(link.title)) {
			trimmedUrl = trimmedUrl.replace(suggestion.prefix, '@');
		} else {
			trimmedUrl = trimmedUrl.replace(suggestion.prefix, '');
		}
	}

	return trimmedUrl.replace('https://', '').replace('www.', '');
};

const openURL = async (url: string): Promise<void> => {
	try {
		await Linking.openURL(url);
	} catch (err) {
		console.log('Cannot open url: ', url);
	}
};

const ProfileLinks = ({
	links,
	editable = false,
	style,
}: {
	links: LocalLink[];
	editable?: boolean;
	style?: StyleProp<ViewStyle>;
}): ReactElement => {
	const { t } = useTranslation('slashtags');

	return (
		<View style={style}>
			{!editable && links?.length === 0 ? (
				<>
					<Text02S color="gray1">{t('contact_no_links')}</Text02S>
					<Divider />
				</>
			) : (
				links.map((link): JSX.Element => {
					const trimmedUrl = trimLink(link);

					return editable ? (
						<LabeledInput
							key={link.id}
							style={styles.input}
							label={link.title}
							value={link.url}
							onChange={(value: string): void => {
								editLink({
									id: link.id,
									title: link.title,
									url: value,
								});
							}}>
							<TouchableOpacity
								testID="RemoveLinkButton"
								onPress={(): void => {
									removeLink(link.id);
								}}>
								<TrashIcon color="brand" width={16} />
							</TouchableOpacity>
						</LabeledInput>
					) : (
						<TouchableOpacity
							key={link.id}
							onPress={(): void => {
								openURL(link.url);
							}}>
							<Caption13Up style={styles.label} color="gray1">
								{link.title}
							</Caption13Up>
							<Text02M numberOfLines={1}>{trimmedUrl}</Text02M>
							<Divider />
						</TouchableOpacity>
					);
				})
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	label: {
		marginBottom: 8,
	},
	input: {
		marginBottom: 16,
	},
});

export default ProfileLinks;
