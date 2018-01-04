<?php
/**
 * @copyright Copyright (c) 2016, ownCloud, Inc.
 *
 * @author Morris Jobke <hey@morrisjobke.de>
 * @author Vincent Petry <pvince81@owncloud.com>
 *
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

// TODO: move to handlebars

$l = \OC::$server->getL10N('files_filter');

// renders the controls and table headers template
$tmpl = new OCP\Template('files_filter', 'list', '');
$tmpl->assign('empty_header', $l->t('No images found'));
$tmpl->assign('empty_text', $l->t('Any uploaded image will show up here'));
$tmpl->assign('empty_icon', 'nav-icon-filter-image');
$tmpl->assign('title', $l->t('Images'));
$tmpl->printPage();

