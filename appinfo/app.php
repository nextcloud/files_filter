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

\OCA\Files\App::getNavigationManager()->add([
	'id' => 'filter-image',
	'appname' => 'files_filter',
	'script' => 'list.php',
	'order' => 15,
	'name' => 'Images'
]);
\OCA\Files\App::getNavigationManager()->add([
	'id' => 'filter-video',
	'appname' => 'files_filter',
	'script' => 'list.php',
	'order' => 15,
	'name' => 'Videos'
]);
