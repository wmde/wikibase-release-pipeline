import { cancel, isCancel, multiselect } from '@clack/prompts';
import process from 'node:process';

interface SelectionOptions {
	command: string;
	noun: string;
	requireExplicit?: boolean;
}

interface TargetRequestOptions {
	command: string;
	message: string;
	noun: string;
}

export async function requestTargetNames(
	requested: string[],
	available: string[],
	options: TargetRequestOptions
): Promise<string[] | undefined> {
	if ( requested.length > 0 ) {
		return requested;
	}
	if ( !process.stdin.isTTY || !process.stdout.isTTY ) {
		throw new Error(
			`${ options.command } requires explicit ${ options.noun } names or "all" when input is non-interactive.`
		);
	}
	const selected = await multiselect<string>( {
		message: `${ options.message } (press "a" to toggle all)`,
		options: available.map( ( name ) => ( { value: name, label: name } ) ),
		required: true
	} );
	if ( isCancel( selected ) ) {
		cancel( 'No targets selected.' );
		return undefined;
	}
	return selected;
}

export function resolveNames(
	requested: string[],
	available: string[],
	options: SelectionOptions
): string[] {
	if ( requested.length === 0 ) {
		if ( options.requireExplicit ) {
			throw new Error(
				`${ options.command } requires a ${ options.noun } name or "all".`
			);
		}
		return available;
	}

	if ( requested.includes( 'all' ) ) {
		if ( requested.length !== 1 ) {
			throw new Error(
				`${ options.command }: "all" cannot be combined with ${ options.noun } names.`
			);
		}
		return available;
	}

	const unknown = requested.filter( ( name ) => !available.includes( name ) );
	if ( unknown.length > 0 ) {
		throw new Error(
			`${ options.command }: unknown ${ options.noun }${ unknown.length === 1 ? '' : 's' } ${ unknown.join( ', ' ) }. ` +
				`Available ${ options.noun }s: ${ available.join( ', ' ) }.`
		);
	}

	return [ ...new Set( requested ) ];
}
