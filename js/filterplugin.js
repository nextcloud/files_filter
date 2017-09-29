/*
 * Copyright (c) 2017 Robin Appelman <robin@icewind.nl>
 *
 * This file is licensed under the Affero General Public License version 3
 * or later.
 */

(function (OCA) {
	if (!OCA.Files_Filter) {
		OCA.Files_Filter = {};
	}

	/**
	 * @namespace OCA.Files_Filter.FilterPlugin
	 *
	 * Registers the favorites file list from the files app sidebar.
	 */
	OCA.Files_Filter.FilterPlugin = {
		name: 'Filter',

		filterFileList: {},

		activeMime: null,

		attach: function () {
			var self = this;
			var $viewConteainers = $('#app-content .viewcontainer');
			$viewConteainers.each(function (i, el) {
				var $el = $(el);
				var id = $el.attr('id');
				var matches = id.match(/app-content-filter-(\w+)/);
				if (matches) {
					var mime = matches[1].replace('-', '/');
					if (mime.indexOf('/') === -1) {
						mime += '/%';
					}

					$el.on('show.plugin-filter', function (e) {
						self.showFileList($(e.target), mime);
					});
					$el.on('hide.plugin-filter', function () {
						self.hideFileList(mime);
					});
				}
			});
		},

		detach: function () {
			if (this.filterFileList) {
				this.filterFileList.destroy();
				OCA.Files.fileActions.off('setDefault.plugin-filter', this._onActionsUpdated);
				OCA.Files.fileActions.off('registerAction.plugin-filter', this._onActionsUpdated);
				$('#app-content .viewcontainer').off('.plugin-filter');
				this.filterFileList = null;
			}
		},

		showFileList: function ($el, mime) {
			this.activeMime = mime;
			if (!this.filterFileList[mime]) {
				this.filterFileList[mime] = this._createFilterFileList($el, mime);
			}
			this.filterFileList[mime].reload();
			return this.filterFileList[mime];
		},

		hideFileList: function (mime) {
			if (this.filterFileList[mime]) {
				this.filterFileList[mime].$fileList.empty();
			}
		},

		/**
		 * Creates the favorites file list.
		 *
		 * @param $el container for the file list
		 * @param mime mimetype to filter on
		 * @return {OCA.Files_Filter.FilterFileList} file list
		 */
		_createFilterFileList: function ($el, mime) {
			var fileActions = this._createFileActions();
			// register favorite list for sidebar section
			return new OCA.Files_Filter.FilterFileList(
				$el, {
					fileActions: fileActions,
					scrollContainer: $('#app-content')
				},
				mime
			);
		},

		_createFileActions: function () {
			// inherit file actions from the files app
			var fileActions = new OCA.Files.FileActions();
			// note: not merging the legacy actions because legacy apps are not
			// compatible with the sharing overview and need to be adapted first
			fileActions.registerDefaultActions();
			fileActions.merge(OCA.Files.fileActions);

			if (!this._globalActionsInitialized) {
				// in case actions are registered later
				this._onActionsUpdated = _.bind(this._onActionsUpdated, this);
				OCA.Files.fileActions.on('setDefault.plugin-filter', this._onActionsUpdated);
				OCA.Files.fileActions.on('registerAction.plugin-filter', this._onActionsUpdated);
				this._globalActionsInitialized = true;
			}

			// when the user clicks on a folder, redirect to the corresponding
			// folder in the files app instead of opening it directly
			fileActions.register('dir', 'Open', OC.PERMISSION_READ, '', function (filename, context) {
				OCA.Files.App.setActiveView('files', {silent: true});
				OCA.Files.App.fileList.changeDirectory(OC.joinPaths(context.$file.attr('data-path'), filename), true, true);
			});
			fileActions.setDefault('dir', 'Open');
			return fileActions;
		},

		_onActionsUpdated: function (ev) {
			if (ev.action) {
				this.filterFileList[this.activeMime].fileActions.registerAction(ev.action);
			} else if (ev.defaultAction) {
				this.filterFileList[this.activeMime].fileActions.setDefault(
					ev.defaultAction.mime,
					ev.defaultAction.name
				);
			}
		}
	};

})(OCA);

OC.Plugins.register('OCA.Files.App', OCA.Files_Filter.FilterPlugin);

