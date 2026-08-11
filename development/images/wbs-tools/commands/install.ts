import { Option, type Command } from 'commander';
import { completeWebInstallation } from '../lib/installation.js';
import { up } from '../lib/compose.js';
import { getConfig } from '../lib/configuration.js';
import {
	addConfigureOptions,
	configure,
	registerConfigureCommand,
	type ConfigureOptions
} from './configure.js';
import { registerPrepareCommand } from './prepare.js';

function printInstallationComplete(): void {
	const { config } = getConfig();
	const wikibaseUrl = `https://${ config.WIKIBASE_PUBLIC_HOST }`;
	console.log( [
		'',
		'Wikibase Suite is now running.',
		'',
		`  Wikibase:        ${ wikibaseUrl }`,
		`  Query Service:   https://${ config.WDQS_PUBLIC_HOST }`,
		`  QuickStatements: ${ wikibaseUrl }/tools/quickstatements`
	].join( '\n' ) );
}

export function registerInstallCommand( program: Command ): void {
	const install = addConfigureOptions( program.command( 'install' )
		.description( 'Configure and install Wikibase Suite.' ) )
		.addOption( new Option( '--from-source', 'Build and install images from this checkout.' ) )
		.action( async ( options: ConfigureOptions & { fromSource: boolean } ) => {
			await configure( { ...options, build: options.fromSource } );
			if ( !options.web ) {
				await up( options.fromSource ? { build: true } : { update: true } );
				printInstallationComplete();
			}
		} );

	registerConfigureCommand( install );
	registerPrepareCommand( install );

	install.command( 'worker', { hidden: true } )
		.option( '--local-images' )
		.option( '--build' )
		.action( completeWebInstallation );

	install.command( 'web-server', { hidden: true } )
		.action( async () => {
			await import( '../web/server.js' );
		} );
}
