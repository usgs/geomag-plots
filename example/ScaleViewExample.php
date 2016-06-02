<?php

  if (!isset($TEMPLATE)) {
    $TITLE = "ScaleView Example";
    $NAVIGATION = true;
    $HEAD = '
      <link rel="stylesheet" href="css/index.css"/>
      <style>
      #log {
        margin-bottom: 1em;
      }
      </style>
    ';
    $FOOT = '<script src="js/bundle.js"></script>' .
        '<script src="ScaleViewExample.js"></script>';

    include 'template.inc.php';
  }
?>

<pre id="log"><code></code></pre>
<div id="example"></div>
