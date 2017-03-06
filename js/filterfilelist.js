/*
 * Copyright (c) 2017 Robin Appelman <robin@icewind.nl>
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 */

var searchTemplate = '<?xml version="1.0"?>\
<d:searchrequest xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">\
	<d:basicsearch>\
		<d:select>\
			<d:prop>__props__</d:prop>\
		</d:select>\
		<d:from>\
			<d:scope>\
				<d:href>__path__</d:href>\
				<d:depth>infinity</d:depth>\
			</d:scope>\
		</d:from>\
		<d:where>\
			<d:like>\
				<d:prop>\
						<d:getcontenttype/>\
				</d:prop>\
				<d:literal>__mime__</d:literal>\
			</d:like>\
		</d:where>\
	</d:basicsearch>\
</d:searchrequest>';

$(document).ready(function () {
	(function (OCA) {
		if (!OCA.Files_Filter) {
			OCA.Files_Filter = {};
		}

		/**
		 * @class OCA.Files_Filter.FilterFileList
		 * @augments OCA.Files_Filter.FilterFileList
		 *
		 * @classdesc Filter file list.
		 *
		 * @param $el container element with existing markup for the #controls
		 * and a table
		 * @param [options] map of options, see other parameters
		 */
		var FilterFileList = function ($el, options, mime) {
			this.initialize($el, options);
			this.mime = mime;
		};
		FilterFileList.prototype = _.extend({}, OCA.Files.FileList.prototype,
			/** @lends OCA.Files_Filter.FilterFileList.prototype */ {
				id: 'filter',
				appName: t('files_filter', 'Filter'),
				mime: '',

				_clientSideSort: true,
				_allowSelection: false,

				/**
				 * @private
				 */
				initialize: function ($el, options) {
					OCA.Files.FileList.prototype.initialize.apply(this, arguments);
					if (this.initialized) {
						return;
					}
					OC.Plugins.attach('OCA.Files_Filter.FilterFileList', this);
					this.filesClient = new OC.Files.Client({
						host: OC.getHost(),
						port: OC.getPort(),
						root: OC.linkToRemoteBase('dav'),
						useHTTPS: OC.getProtocol() === 'https'
					});
				},

				updateEmptyContent: function () {
					var dir = this.getCurrentDirectory();
					if (dir === '/') {
						// root has special permissions
						this.$el.find('#emptycontent').toggleClass('hidden', !this.isEmpty);
						this.$el.find('#filestable thead th').toggleClass('hidden', this.isEmpty);
					}
					else {
						OCA.Files.FileList.prototype.updateEmptyContent.apply(this, arguments);
					}
				},

				getDirectoryPermissions: function () {
					return OC.PERMISSION_READ | OC.PERMISSION_DELETE;
				},

				updateStorageStatistics: function () {
					// no op because it doesn't have
					// storage info like free space / used space
				},

				reload: function () {
					var tagName = OC.TAG_FAVORITE;
					this.showMask();
					if (this._reloadCall) {
						this._reloadCall.abort();
					}

					// there is only root
					this._setCurrentDir('/', false);

					this._reloadCall = this.searchByMime('/files/' + OC.getCurrentUser().uid, this.mime);
					var callBack = this.reloadCallback.bind(this);
					return this._reloadCall.then(callBack, callBack);
				},

				reloadCallback: function (status, result) {
					if (result) {
						// prepend empty dir info because original handler
						result.unshift({});
					}

					return OCA.Files.FileList.prototype.reloadCallback.call(this, status, result);
				},

				searchByMime: function(path, mime) {
					var deferred = $.Deferred();
					var promise = deferred.promise();

					var filesClient = this.filesClient;
					var davClient = this.filesClient._client;
					var props = this._getWebdavProperties().map(function (prop) {
						var property = davClient.parseClarkNotation(prop);
						return '<' + davClient.xmlNamespaces[property.namespace] + ':' + property.name + ' />\n';
					}).join('');
					var body = searchTemplate
						.replace('__props__', props)
						.replace('__mime__', mime)
						.replace('__path__', path);

					davClient.request(
						'SEARCH',
						filesClient._buildUrl(),
						{'Content-Type': 'text/xml'},
						body
					).then(function (result) {
						if (filesClient._isSuccessStatus(result.status)) {
							var results = filesClient._parseResult(result.body);
							deferred.resolve(result.status, results);
						} else {
							deferred.reject(result.status);
						}
					});
					return promise;
				}
			});

		OCA.Files_Filter.FilterFileList = FilterFileList;
	})(OCA);
});

