import { parseEnv } from 'node:util';

export const WBS_VERSION_MANIFEST = '.wbs/version';

export interface WbsVersionManifest {
	version: string;
	toolsImage: string;
}

function requiredValue(values: Record<string, string>, name: string): string {
	const value = values[name];
	if (!value) {
		throw new Error(`${WBS_VERSION_MANIFEST} has no ${name} value.`);
	}
	return value;
}

export function readWbsVersionManifest(contents: string): WbsVersionManifest {
	const values = parseEnv(contents);
	return {
		version: requiredValue(values, 'WBS_VERSION'),
		toolsImage: requiredValue(values, 'WBS_TOOLS_IMAGE')
	};
}

function replaceValue(contents: string, name: string, value: string): string {
	if (!value || /[\r\n]/u.test(value)) {
		throw new Error(`${name} must be a non-empty single-line value.`);
	}
	const pattern = new RegExp(`^${name}=.*$`, 'mu');
	if (!pattern.test(contents)) {
		throw new Error(`${WBS_VERSION_MANIFEST} has no ${name} assignment.`);
	}
	return contents.replace(pattern, `${name}=${value}`);
}

export function withWbsVersion(contents: string, version: string): string {
	return replaceValue(contents, 'WBS_VERSION', version);
}

export function withWbsToolsImage(contents: string, image: string): string {
	return replaceValue(contents, 'WBS_TOOLS_IMAGE', image);
}
