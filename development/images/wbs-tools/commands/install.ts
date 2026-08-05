import { Option, type Command } from 'commander';
import { completeWebInstallation } from '../lib/installation.js';
import { up } from '../lib/compose.js';
import {
	addConfigureOptions,
	configure,
	type ConfigureOptions
} from './configure.js';

export function registerInstallCommand( program: Command ): void {
	addConfigureOptions( program.command( 'install' )
		.description( 'Configure and install Wikibase Suite.' ) )
		.addOption( new Option( '--from-source', 'Build and install images from this checkout.' ) )
		.action( async ( options: ConfigureOptions & { fromSource: boolean } ) => {
			await configure( options );
			if ( !options.web ) {
				await up( options.fromSource ? { build: true } : { update: true } );
			}
		} );

	program.command( 'install-worker', { hidden: true } )
		.option( '--local-images' )
		.option( '--build' )
		.action( completeWebInstallation );
}
