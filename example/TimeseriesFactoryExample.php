<?php

  if (!isset($TEMPLATE)) {
    $TITLE = "TimeseriesFactory Example";
    $NAVIGATION = true;
    $HEAD = '<link rel="stylesheet" href="css/index.css"/>';
    $FOOT = '<script src="js/bundle.js"></script>' .
        '<script src="TimeseriesFactoryExample.js"></script>';

    include 'template.inc.php';
  }
?>

<div id="example"></div>
