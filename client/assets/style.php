<?php
	header('Content-Type: text/css');
	$accent = '#444444';
	$darkac = '#333333';
?>

/** <?=$darkac?> **/

/**  [0]  **/
html						{background:#f8f8f8 url("../assets/img/back.png");background-position:center center;background-attachment:fixed;}

/**  [1]  **/
#popup-yes,
.popup-button,

#loading,

#side-head,
#side-loading,
#side-cache,
.side-select,
.side-select:hover,

.notes-title,

.user-avatar,

.post-ribbon,
.post-loading,
.post-button,

.comment-avatar,
.comment-more:hover,

.settings-toggle			{background:<?=$accent?>;color:#fff;}

/**  [2]  **/
.user-ribbon::before,
.post-button::after			{border-top-color:<?=$darkac?>;}

/**  [3]  **/
#side-head::after,
.comment-active,			
.post-text blockquote		{border-left-color:<?=$accent?>;}

/**  [4]  **/
.notes-title::after,
.user-ribbon::after			{border-right-color:<?=$darkac?>;}

/**  [5]  **/
.usr-link-active,
.usr-link:hover				{border-bottom-color:<?=$accent?>}

/**  [6]  **/
.post-name a:hover,
.post-content a,
.post-content a:hover,

.comment-name a:hover,
.comment-content a,
.comment-content a:hover	{color:<?=$accent?>;}

/**  [7]  **/
#side-logo					{background:rgba(0,0,0,0) url("../assets/img/<?=(isset($_GET['dev']))?'dev':'gra';?>.svg") no-repeat top;z-index:1;}

/**  [8]  **/
::selection					{background:<?=$accent?>;color:#fff;}

/**  [9]  **/
::-moz-selection			{background:<?=$accent?>;color:#fff;}