import { getCookie } from "./getCookie.js";

document.addEventListener("DOMContentLoaded", function() {
	const password = getCookie('password');

	if(password === null){
		window.location.href = "codigo.html";
	}

});
