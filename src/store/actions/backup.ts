import actions from './actions';
import { err, ok, Result } from '../../utils/result';
import { getDispatch } from '../helpers';

const dispatch = getDispatch();

/**
 * Triggers a full remote backup
 * @return {Promise<Err<unknown> | Ok<string>>}
 */
export const performFullBackup = async (): Promise<Result<string>> => {
	const ldkRemoteRes = await performRemoteLdkBackup();
	//TODO perform other backup types

	//TODO check results of each time and return errors if any

	if (ldkRemoteRes.isErr()) {
		return err(ldkRemoteRes.error);
	}

	return ok('Backup success');
};

export const performRemoteLdkBackup = async (): Promise<Result<string>> => {
	dispatch({
		type: actions.BACKUP_UPDATE,
		payload: { remoteLdkBackupSynced: false },
	});

	//TODO actually perform backup
	await new Promise((resolve) => setTimeout(resolve, 3000));

	dispatch({
		type: actions.BACKUP_UPDATE,
		payload: { remoteLdkBackupSynced: true },
	});

	return ok('Backup success');
};

export const setRemoteBackupsEnabled = (
	remoteBackupsEnabled: boolean,
): void => {
	dispatch({
		type: actions.BACKUP_UPDATE,
		payload: { remoteBackupsEnabled },
	});
};

/*
 * This resets the backup store to defaultBackupShape
 */
export const resetBackupStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_BACKUP_STORE,
	});

	return ok('');
};
