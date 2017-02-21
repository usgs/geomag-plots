<?php

// application injects its navigation into this element

echo '<div id="geomag-config"></div>';

echo navItem($MOUNT_PATH . '/index.php', 'Geomagnetism Plots');
echo navItem($MOUNT_PATH . '/dst.php',
		'<abbr title="Disturbance Storm Time">Dst</abbr> Index');
echo navItem('/ws/edge/', 'Web Service');
