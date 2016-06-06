<?php
if (!isset($TEMPLATE)) {
  $TITLE = 'CompactSelectView Example';
  $NAVIGATION = true;

  $HEAD = '
    <link rel="stylesheet" href="css/index.css"/>
    <style>
      #example {
        width: 304px;
      }
    </style>
  ';

  $FOOT = '
    <script src="js/bundle.js"></script>
    <script src="CompactSelectViewExample.js"></script>
  ';

  include_once 'template.inc.php';
}
?>

<button id="deselect">Deselect</button>
<div id="example"></div>
