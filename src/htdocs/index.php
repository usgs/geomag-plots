<?php
if (!isset($TEMPLATE)) {
  include_once '../conf/config.inc.php';

  $TITLE = 'Geomagnetism Plots';
  $NAVIGATION = true;

  $HEAD = '<link rel="stylesheet" href="css/index.css"/>';
  $FOOT = '
    <script>
      var _CONFIG = {
        obsMetaUrl: \'' . $OBS_META_URL . '\',
        obsDataUrl: \'' . $OBS_DATA_URL . '\'
      };
    </script>
    <script src="js/index.js"></script>
  ';

  include_once 'template.inc.php';
}
?>

<div class="alert info">
  <p>
    We're working on an
    <a href="/beta/plots/">
      updated version of this application
    </a>, and will replace the existing application in early 2020.

    Please
    <a href="mailto:gs-haz_dev_team_group@usgs.gov?subject=Beta+Geomagnetism+Plots">
      email any comments or concerns
    </a>.
  </p>
</div>

<div id="geomag-plots">
  <noscript>
    <p>This application requires javascript.</p>
  </noscript>
</div>
