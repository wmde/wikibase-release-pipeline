import assert from 'assert';
import axios, { AxiosResponse } from 'axios';
import lodash from 'lodash';
import { Context } from 'mocha';
import { TestEnvironment } from '../setup/TestEnvironment.js';
import { TestSettings } from './types/TestSettings.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import Binding from './types/binding.js';
import BotResponse from './types/bot-response.js';
import DatabaseConfig from './types/database-config.js';
import ExternalChange from './types/external-change.js';
import LuaCPUValue from './types/lua-cpu-value.js';
import testLog from '../setup/testLog.js';

export function defaultFunctions( environment: TestEnvironment ): void {
	const settings: TestSettings = environment.settings;

	/**
	 * Make a get request to get full request response
	 */
	browser.addCommand(
		'makeRequest',
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( url: string, params?: any, postData?: any ): Promise<AxiosResponse> => {
			if ( postData ) {
				return axios.post( url, postData, params );
			} else {
				return axios.get( url, params );
			}
		}
	);

	/**
	 * Execute query on database
	 */
	browser.addCommand(
		'dbQuery',
		( query: string, config?: DatabaseConfig ): string => {
			if ( !config ) {
				config = {
					user: globalThis.env.DB_USER,
					pass: globalThis.env.DB_PASS,
					database: globalThis.env.DB_NAME
				};
			}

			if ( !config.user || !config.pass || !config.database ) {
				throw new Error(
					`dbQuery: Configuration error! ${JSON.stringify( config )}`
				);
			}

			return environment.runDockerComposeCmd(
				`exec mysql mysql --user ${config.user} --password=${config.pass} ${config.database} -e '${query}'`
			);
		}
	);

	/**
	 * Delete a claim by guid or pipe-separated list of guids
	 */
	browser.addCommand(
		'deleteClaim',
		async ( claimGuid: string ): Promise<BotResponse> => {
			const bot = await WikibaseApi.getBot();

			return bot.request( {
				action: 'wbremoveclaims',
				claim: claimGuid,
				token: bot.editToken
			} );
		}
	);

	/**
	 * Get installed extensions on wiki
	 */
	browser.addCommand(
		'getInstalledExtensions',
		async ( server: string ): Promise<string[] | undefined> => {
			const result = await browser.makeRequest(
				`${server}/w/api.php?action=query&meta=siteinfo&siprop=extensions&format=json`
			);
			return lodash.map( result.data.query.extensions, 'name' );
		}
	);

	/**
	 * Creates or edits a page with content
	 */
	browser.addCommand(
		'editPage',
		async (
			host: string,
			title: string,
			content: Buffer | string,
			captcha: string = null
		): Promise<string> => {
			await browser.url( `${host}/wiki/${title}?action=edit` );

			// wait for javascript to settle
			// eslint-disable-next-line wdio/no-pause
			await browser.pause( 5 * 1000 );

			// this shows up one time for anonymous users (VisualEditor)
			const startEditbutton = await $(
				'.oo-ui-messageDialog-actions .oo-ui-flaggedElement-progressive'
			);
			if ( startEditbutton.elementId ) {
				await startEditbutton.click();

				// wait for fade out animation to finish
				// eslint-disable-next-line wdio/no-pause
				await browser.pause( 2 * 1000 );
			}

			// fill out form
			await $( '#wpTextbox1' ).setValue( content.toString() );

			if ( captcha ) {
				await $( '#wpCaptchaWord' ).setValue( captcha );
			}

			// save page
			await browser.execute( async () => $( '#editform.mw-editform' ).submit() );

			// eslint-disable-next-line wdio/no-pause
			await browser.pause( 2 * 1000 );

			return await $( '#mw-content-text' ).getText();
		}
	);

	/**
	 * Moves browser to recent changes then asserts that a change is in the api result
	 */
	browser.addCommand(
		'getDispatchedExternalChange',
		async (
			host: string,
			expectedChange: ExternalChange
		): Promise<ExternalChange | null> => {
			// to get a screenshot
			await browser.url(
				`${host}/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2`
			);

			// get all external changes
			const apiURL = `${host}/w/api.php?format=json&action=query&list=recentchanges&rctype=external&rcprop=comment|title`;
			const result = await browser.makeRequest( apiURL );
			const changes = result.data.query.recentchanges;
			const foundResult = lodash.find( changes, expectedChange );

			assert.strictEqual( result.status, 200 );

			if ( !foundResult ) {
				testLog.error( 'Could not find:' );
				testLog.error( expectedChange );
				testLog.error( 'Response: ' );
				testLog.error( changes );
			}

			return foundResult;
		}
	);

	/**
	 * Makes a request to a page and returns the lua cpu profiling data
	 */
	browser.addCommand(
		'getLuaCpuTime',
		async ( host: string, page: string ): Promise<LuaCPUValue> => {
			const response = await browser.makeRequest( `${host}/wiki/${page}` );

			const cpuMatches = response.data.match(
				/(CPU time usage:) ([-.0-9]+) (\w+)/
			);
			const cpuTime = parseFloat( cpuMatches[ 2 ] );
			const cpuTimeScale = cpuMatches[ 3 ];

			return { value: cpuTime, scale: cpuTimeScale };
		}
	);

	/**
	 * Execute quickstatements query
	 */
	browser.addCommand(
		'executeQuickStatement',
		async ( theQuery: string ): Promise<void> => {
			await browser.url( `${globalThis.env.QS_SERVER}/#/batch` );

			// create a batch
			await $( '.create_batch_box textarea' ).setValue( theQuery );

			// eslint-disable-next-line wdio/no-pause
			await browser.pause( 1000 );

			// click import
			await $( "button[tt='dialog_import_v1']" ).click();

			// eslint-disable-next-line wdio/no-pause
			await browser.pause( 1000 );

			// click run
			await $( "button[tt='run']" ).click();

			const commands = await $$( '.command_status' );

			await browser.waitUntil(
				async () => {
					const commandTextArray = await Promise.all(
						commands.map( async ( command ) => command.getText() )
					);
					return commandTextArray.every(
						( commandText ) => commandText === 'done'
					);
				},
				{
					timeout: 10000,
					timeoutMsg: 'Expected to be done after 10 seconds'
				}
			);
		}
	);

	/**
	 * Query blazegraph directly (only works if proxy is disabled, used in upgrade test)
	 */
	browser.addCommand(
		'queryBlazeGraphItem',
		async ( itemId: string ): Promise<Binding[]> => {
			const sparqlEndpoint = `${globalThis.env.WDQS_SERVER}/bigdata/namespace/wdq/sparql`;
			const params = {
				headers: { Accept: 'application/sparql-results+json' },
				validateStatus: false
			};

			// essentially 'SELECT * WHERE { <http://wikibase.svc/entity/Q101> ?p ?o }' but encoded with some special chars
			const queryString = `query=SELECT+*+WHERE%7B+%3Chttp%3A%2F%2Fwikibase.svc%2Fentity%2F${itemId}%3E+%3Fp+%3Fo+%7D`;

			const response = await browser.makeRequest(
				sparqlEndpoint,
				params,
				queryString
			);
			return response.data.results.bindings;
		}
	);

	browser.addCommand(
		'waitForJobs',
		async (
			serverURL: string = globalThis.env.MW_SERVER,
			timeout: number = settings.testTimeout - 1000,
			timeoutMsg: string = null
		): Promise<boolean> => {
			let jobsInQueue: number;

			return browser.waitUntil(
				async () => {
					const result = await browser.makeRequest(
						`${serverURL}/w/api.php?action=query&meta=siteinfo&siprop=statistics&format=json`,
						{ validateStatus: false },
						{}
					);
					jobsInQueue = result.data.query.statistics.jobs;

					return jobsInQueue === 0;
				},
				{
					timeout,
					timeoutMsg:
						timeoutMsg ||
						`Timeout: Job queue on "${serverURL}" still contains ${jobsInQueue} jobs after waiting ${
							timeout / 1000
						} seconds.`
				}
			);
		}
	);
}

export async function skipIfExtensionNotPresent(
	test: Context,
	extension: string
): Promise<void> {
	const installedExtensions = await browser.getInstalledExtensions(
		globalThis.env.MW_SERVER
	);
	if ( !installedExtensions || installedExtensions.length === 0 ) {
		return;
	} else if (
		installedExtensions &&
		installedExtensions.includes( 'WikibaseRepository' ) &&
		installedExtensions.includes( extension )
	) {
		return;
	} else {
		test.skip();
	}
}
