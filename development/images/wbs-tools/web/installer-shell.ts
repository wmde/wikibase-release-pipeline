import { readFileSync } from 'fs';
import { isLocalMode } from '../lib/configuration.js';
import {
	configuredExistingInstallState,
	inspectInstallationAttempt,
	installationAttemptStarted
} from '../lib/installation-state.js';

export interface InstallerShellOptions {
	configurationOnly: boolean;
	devServer: boolean;
	indexTemplatePath: string;
	installerDevMock: boolean;
	serverIp: string;
}

function escapeJsonForHtml( value: unknown ): string {
	return JSON.stringify( value ).replace( /</g, '\\u003c' );
}

function escapeHtmlAttribute( value: string ): string {
	return value
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' );
}

export function createInstallerShellRenderer(
	options: InstallerShellOptions
): ( scriptSrc: string ) => string {
	return ( scriptSrc: string ): string => {
		const installationAttempt = options.installerDevMock ? {
			configurationSaved: false,
			completed: false,
			failed: false
		} : inspectInstallationAttempt();
		const installationStarted = !options.installerDevMock &&
			installationAttemptStarted( installationAttempt );
		const initialState = {
			installerDevMock: options.installerDevMock,
			configurationOnly: options.configurationOnly,
			installationCompleted: installationAttempt.completed,
			installationStarted,
			existingInstallState: options.installerDevMock ? 'none' : configuredExistingInstallState(),
			isLocalMode: isLocalMode(),
			serverIp: options.serverIp
		};

		return readFileSync( options.indexTemplatePath, 'utf8' )
			.replace( '%PUBLIC_BASE_PATH%', '' )
			.replace( '%PAGE_TITLE%', 'Wikibase Suite Installer' )
			.replace( '%INSTALLER_STATE%', escapeJsonForHtml( initialState ) )
			.replace(
				'%BUILT_STYLE_LINK%',
				options.devServer ? '' : '<link rel="stylesheet" href="/assets/installer-app.css" />'
			)
			.replace( '%SCRIPT_SRC%', escapeHtmlAttribute( scriptSrc ) );
	};
}
