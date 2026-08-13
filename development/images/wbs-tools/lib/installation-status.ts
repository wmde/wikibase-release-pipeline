export const INSTALLATION_STATUS = {
	configSaved: 'config_saved',
	resetConfigRemoved: 'reset_config_removed',
	resetServicesRemoved: 'reset_services_removed',
	imagesPullStarted: 'images_pull_started',
	servicesWaiting: 'services_waiting',
	servicesReady: 'services_ready',
	launchSkipped: 'launch_skipped',
	failed: 'installation_failed',
	complete: 'installation_complete'
} as const;

export type InstallationStatusCode =
	typeof INSTALLATION_STATUS[keyof typeof INSTALLATION_STATUS];

export const INSTALLATION_STATUS_CODE_SUFFIX_REGEX = /\s\[([a-z0-9_]+)\]$/i;

export function installationStatusCode( line: string ): string | undefined {
	return line.match( INSTALLATION_STATUS_CODE_SUFFIX_REGEX )?.[ 1 ]?.toLowerCase();
}
