<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<link rel="stylesheet" href="../assets/style.css" type="text/css"  id="basecss">
	<title>Login - Graphene</title>
</head>
<body>
	<div id="login-container">
	<div id="login-box">
	<form id="login-form" method="post" action="http://dev.phene.co:3000/login">
		<?=(isset($_GET['fail']))?'<div class="login-fail">Login Failed :\</div>':'';?>
		<input class="login-text" name="email"    type="text"       autofocus="autofocus"   placeholder="Email Address">
		<input class="login-text" name="password" type="password"   placeholder="Password">
		<input class="login-butn" name="submit"   type="submit"     value="Login">
		<div id="login-link"><a href="../register">Sign Up</a></div>
	</form>
	</div>
	</div>
	<a href="http://phene.co"><div id="brand" style="color:#111 !important;font-family:serif;">
		phene.co
	</div></a>
</body>
</html>