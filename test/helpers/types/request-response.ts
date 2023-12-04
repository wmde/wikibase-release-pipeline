type DataValue = {
	value: string;
	type: 'string';
};
export type Reference = {
	datavalue: DataValue;
};
export type Claim = {
	mainsnak: {
		datavalue: DataValue;
	};
	references: {
		snaks: Record<string, Reference[]>;
	}[];
};
type Entity = {
	claims: Record<string, Claim[]>;
};
export type SpecialEntityData = {
	entities: Record<string, Entity>;
};
