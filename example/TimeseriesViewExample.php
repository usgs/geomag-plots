<?php

  if (!isset($TEMPLATE)) {
    $TITLE = "TimeseriesView Example";
    $NAVIGATION = true;
    $HEAD = '<link rel="stylesheet" href="css/index.css"/>';
    $FOOT = '<script src="js/bundle.js"></script>' .
        '<script src="TimeseriesViewExample.js"></script>';

    include 'template.inc.php';
  }
?>

<div id="example"></div>
