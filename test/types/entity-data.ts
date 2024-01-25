type DataValue = {
	value: string;
	type: 'string';
};
export type Reference = {
	datavalue: DataValue;
};
export type Claim = {
	mainsnak: {
		datatype: unknown;
		datavalue: DataValue;
	};
	references: {
		snaks: Record<string, Reference[]>;
	}[];
	type: unknown;
};
type Entity = {
	id: string;
	aliases: unknown;
	claims: Record<string, Claim[]>;
	descriptions: unknown;
	labels: Record<string, DataValue>;
	sitelinks: unknown;
};
export type EntityData = {
	entities: Record<string, Entity>;
};
