<?php

  if (!isset($TEMPLATE)) {
    $TITLE = "D3TimeseriesView Example";
    $NAVIGATION = true;
    $HEAD = '<link rel="stylesheet" href="css/index.css"/>';
    $FOOT = '<script src="js/bundle.js"></script>' .
        '<script src="D3TimeseriesViewExample.js"></script>';

    include 'template.inc.php';
  }
?>

<div id="example"></div>
