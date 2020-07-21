/**
 * Custom preloading middleware.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress dependencies.
 */
import { getStablePath } from '@wordpress/api-fetch/build/middlewares/preloading';

/**
 * createPreloadingMiddleware
 *
 * Based on preloadMiddleware from from @wordpress/api-fetch, this middle is a single-use per-endpoint and provides cached
 * data for the first request only and any subsequent requests hit the server.
 *
 * @since n.e.x.t
 *
 * @param {Object} preloadedData Preloaded data paths.
 * @param {number} timeout       Timeout value.
 * @return {Function} Function.
 */
function createPreloadingMiddleware( preloadedData, timeout = 1000 ) {
	const cache = Object.keys( preloadedData ).reduce( ( result, path ) => {
		result[ getStablePath( path ) ] = preloadedData[ path ];
		return result;
	}, {} );

	let cacheHasExpired = false;
	return ( options, next ) => {
		const { parse = true } = options;
		const uri = options.path;
		setTimeout( () => {
			cacheHasExpired = true;
		}, timeout );
		if ( typeof options.path === 'string' && ! cacheHasExpired ) {
			const method = options.method?.toUpperCase() || 'GET';

			const path = getStablePath( uri );
			if ( parse && 'GET' === method && cache[ path ] ) {
				const result = Promise.resolve( cache[ path ].body );
				delete cache[ path ];
				return result;
			} else if (
				'OPTIONS' === method &&
				cache[ method ] &&
				cache[ method ][ path ]
			) {
				const result = Promise.resolve( cache[ method ][ path ] );
				delete cache[ method ][ path ];
				return result;
			}
		}
		return next( options );
	};
}
export default createPreloadingMiddleware;
