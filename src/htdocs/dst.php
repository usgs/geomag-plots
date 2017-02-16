<?php
if (!isset($TEMPLATE)) {
  include_once '../conf/config.inc.php';

  $TITLE = 'Disturbance Storm Time (DST) Index';
  $NAVIGATION = true;

  $HEAD = '
    <link rel="stylesheet" href="css/index.css"/>
    <style>
      .timeseries-elements,
      .timeseries-observatories {
        display: none;
      }
    </style>
  ';
  $FOOT = '
    <script>
      var _CONFIG = {
        obsMetaUrl: \'' . $OBS_META_URL . '\',
        obsDataUrl: \'' . $OBS_DATA_URL . '\'
      };
    </script>
    <script src="js/dst.js"></script>
  ';

  include_once 'template.inc.php';
}
?>

<div id="geomag-plots">
  <noscript>
    <p>This application requires javascript.</p>
  </noscript>
</div>
