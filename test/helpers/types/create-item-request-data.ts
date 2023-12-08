export type Claim = {
	mainsnak: {
		snaktype: 'value';
		property: string;
		datavalue: { value: string; type: 'string' };
	};
	type: 'statement';
	rank: string;
};

export type CreateItemRequestData = {
	claims: Claim[];
};
