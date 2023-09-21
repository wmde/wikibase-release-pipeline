'use strict';

const MWBot = require( 'mwbot' );
const request = require( 'request' );

class WikibaseApiPatch {
	/**
	 * Initialize the API
	 *
	 * @param {string} [cpPosIndex] The value of the cpPosIndex browser cookie.
	 * Optional, but strongly recommended to have chronology protection.
	 * @return {Promise<MWBot>} resolving with MWBot
	 */
	async initialize( cpPosIndex ) {
		const config = browser.options;

		const jar = request.jar();
		if ( cpPosIndex ) {
			const cookie = request.cookie( `cpPosIndex=${cpPosIndex}` );
			jar.setCookie( cookie, config.baseUrl );
		}
		const bot = new MWBot(
			{ apiUrl: `${config.baseUrl}/api.php` },
			{ jar: jar }
		);
		const loginCredentials = {
			username: process.env.MW_ADMIN_NAME,
			password: process.env.MW_ADMIN_PASS
		};
		await bot.loginGetEditToken( loginCredentials );
		this.bot = bot;

		return bot;
	}

	/**
	 * @return {Promise<MWBot>} resolving with MWBot
	 */
	getBot() {
		if ( !this.bot ) {
			console.trace( 'WARNING: WikibaseApi not initialized' );
			return this.initialize();
		}

		return Promise.resolve( this.bot );
	}

	/**
	 * Create an item
	 *
	 * @param {string|Object} [label] Optional English label of the item or object
	 *  containing all labels
	 * @param {Object} [data] Optional data to populate the item with
	 * @return {Promise<string>} resolving with the id of the created item
	 */
	async createItem( label, data ) {
		const itemData = {};
		let labels = {};

		if ( typeof label === 'object' ) {
			labels = label;
		} else if ( label ) {
			labels = {
				en: {
					language: 'en',
					value: label
				}
			};
		}

		Object.assign( itemData, { labels }, data );

		const bot = await this.getBot();

		const response = await bot.request( {
			action: 'wbeditentity',
			new: 'item',
			data: JSON.stringify( itemData ),
			token: bot.editToken
		} );

		return response.entity.id;
	}

	/**
	 * Create a property
	 *
	 * @param {string} datatype The datatype of the property
	 * @param {Object} [data] Optional data to populate the property with
	 * @return {Promise<string>} resolving with the id of the created property
	 */
	async createProperty( datatype, data ) {
		let propertyData = {};

		propertyData = Object.assign( {}, { datatype }, data );

		const bot = await this.getBot();
		const response = await bot.request( {
			action: 'wbeditentity',
			new: 'property',
			data: JSON.stringify( propertyData ),
			token: bot.editToken
		} );

		return response.entity.id;
	}

	/**
	 * @param {string} id The id of the entity
	 * @return {Promise<Object>} resolving with the requested entity
	 */
	async getEntity( id ) {
		const bot = await this.getBot();
		const response = await bot.request( {
			ids: id,
			action: 'wbgetentities',
			token: bot.editToken
		} );
		return response.entities[ id ];
	}

	/**
	 * @param {string} entityId The id of the entity
	 * @return {Promise<Object>}
	 */
	async protectEntity( entityId ) {
		const bot = await this.getBot();

		const getEntitiesResponse = await bot.request( {
			action: 'wbgetentities',
			format: 'json',
			ids: entityId,
			props: 'info'
		} );
		const entityTitle = getEntitiesResponse.entities[ entityId ].title;
		return bot.request( {
			action: 'protect',
			title: entityTitle,
			protections: 'edit=sysop',
			token: bot.editToken
		} );
	}

	/**
	 * @param {string} datatype
	 * @return {Promise<string>} resolving with the id of the property
	 */
	async getProperty( datatype ) {
		const envName = `WIKIBASE_PROPERTY_${datatype.toUpperCase()}`;
		if ( envName in process.env ) {
			return process.env[ envName ];
		} else {
			const propertyId = await this.createProperty( datatype );
			process.env[ envName ] = propertyId;
			return propertyId;
		}
	}
}

module.exports = new WikibaseApiPatch();
