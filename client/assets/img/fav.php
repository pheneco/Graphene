<?php
	header("Content-Type:image/jpg");
	$hex	= str_replace("#", "", $_GET['c']);
	$r		= hexdec(substr($hex,0,2));
	$g		= hexdec(substr($hex,2,2));
	$b		= hexdec(substr($hex,4,2));
	$in		= 'fav.png';
	$im_src	= imagecreatefrompng($in);
    $im_dst	= imagecreatefrompng($in);
    $w		= imagesx($im_src);
    $h		= imagesy($im_src);
	imagefill($im_dst,0,0,IMG_COLOR_TRANSPARENT);
    imagesavealpha($im_dst,true);
    imagealphablending($im_dst,true);
    $flagOK = 1;
	for($x=0;$x<$w;$x++)
		for($y=0;$y<$h;$y++){
			$rgb	= imagecolorat( $im_src, $x, $y );
			$old	= imagecolorsforindex($im_src, $rgb);
			$a		= $old["alpha"];
			$new	= imagecolorallocatealpha($im_src,$r,$g,$b,$a);
			$flag	= true;
			if($new === false)
				$flagOK = 0; 
			elseif($flag)
				imagesetpixel($im_dst,$x,$y,$new);
		}
	imagepng($im_dst);
	imagedestroy($im_dst);
	imagedestroy($im_src);