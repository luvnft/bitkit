import React, { memo, ReactElement, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import NumberPad from '../../../components/NumberPad';
import { useAppSelector } from '../../../hooks/redux';
import { vibrate } from '../../../utils/helpers';
import { convertToSats } from '../../../utils/conversion';
import { handleNumberPadPress } from '../../../utils/numberpad';
import { EUnit } from '../../../store/types/wallet';
import { primaryUnitSelector } from '../../../store/reselect/settings';

const SendNumberPad = ({
	value,
	maxAmount,
	onChange,
	onError,
	style,
}: {
	value: string;
	maxAmount: number;
	onChange: (value: string) => void;
	onError: () => void;
	style?: StyleProp<ViewStyle>;
}): ReactElement => {
	const [errorKey, setErrorKey] = useState<string>();
	const unit = useAppSelector(primaryUnitSelector);

	const maxDecimals = unit === EUnit.BTC ? 8 : 2;
	const maxLength = unit === EUnit.satoshi ? 10 : 20;
	const numberPadType = unit === EUnit.satoshi ? 'integer' : 'decimal';

	const onPress = (key: string): void => {
		const newValue = handleNumberPadPress(key, value, {
			maxLength,
			maxDecimals,
		});

		const amount = convertToSats(newValue, unit);

		if (amount <= maxAmount) {
			onChange(newValue);
		} else {
			onError();
			vibrate({ type: 'notificationWarning' });
			setErrorKey(key);
			setTimeout(() => setErrorKey(undefined), 500);
		}
	};

	return (
		<NumberPad
			style={style}
			type={numberPadType}
			errorKey={errorKey}
			onPress={onPress}
		/>
	);
};

export default memo(SendNumberPad);
