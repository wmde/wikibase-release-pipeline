import chalk from 'chalk';

export function strong(value: string): string {
	return chalk.bold(value);
}

const projectLabels: Record<string, string> = {
	opensearch: 'OpenSearch',
	qlever: 'QLever Query Service',
	quickstatements: 'QuickStatements',
	'wbs-tools': 'WBS Tools',
	wbs: 'Wikibase Suite',
	wdqs: 'Query Service',
	'wdqs-frontend': 'Query Service frontend',
	wikibase: 'Wikibase'
};

export function projectLabel(name: string): string {
	return projectLabels[name] ?? name;
}

export function projectOptionLabel(name: string): string {
	const label = projectLabels[name];
	return label ? `${label} (${name})` : name;
}
