<?php

wfLoadExtension( 'ConfirmEdit/QuestyCaptcha' );

$wgCaptchaQuestions = [
	'What is the capital of France?' => 'Paris',
];

$wgCaptchaTriggers['edit']          = true;
$wgCaptchaTriggers['create']        = true;
$wgCaptchaTriggers['createtalk']    = true;
$wgCaptchaTriggers['addurl']        = true;
$wgCaptchaTriggers['createaccount'] = true;
$wgCaptchaTriggers['badlogin']      = true;
