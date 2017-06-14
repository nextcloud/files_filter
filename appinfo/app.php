<?php

$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener(
	'OCA\Files::loadAdditionalScripts',
	function () {
		\OCP\Util::addScript('files_filter', 'filterfilelist');
		\OCP\Util::addScript('files_filter', 'filterplugin');
		\OCP\Util::addStyle('files_filter', 'filter');
	}
);

$l = \OC::$server->getL10N('files_filter');

\OCA\Files\App::getNavigationManager()->add([
	'id' => 'filter-image',
	'appname' => 'files_filter',
	'script' => 'image_list.php',
	'order' => 15,
	'name' => $l->t('Images'),
]);
\OCA\Files\App::getNavigationManager()->add([
	'id' => 'filter-video',
	'appname' => 'files_filter',
	'script' => 'video_list.php',
	'order' => 15,
	'name' => $l->t('Videos'),
]);
