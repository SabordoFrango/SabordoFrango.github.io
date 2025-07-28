import { getCookie } from "./getCookie.js";

async function verifyPassword(password) {
	//Gambiarra mas funciona

	const apiUrl = 'https://script.google.com/macros/s/AKfycbym0GgNgHq5HvQCoZJMY5jgS-AWs14tJj2VAnvDegK3EHTekPhqPU9cnLsRz4W9zMnn/exec';

	const payload = {
		action: 'error',
		password: password,
	};

	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			body: JSON.stringify(payload)
		});

		const resultText = await response.json();
		const responseError = resultText.detalhe;

		if(responseError == "Ação inválida."){
			return true;
		} else {
			return false
		}

	} catch (error) {
		console.error("Falha na requisição:", error);
	}
}

document.addEventListener('DOMContentLoaded', () => {

	const password = getCookie('password');
	if(password != null){
		if(verifyPassword(password)){
			window.location.href = "index.html";
		}
	}
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
	event.preventDefault();

	const form = event.target;
	const password = document.getElementById('password').value;

	if (password) {
		const passwordIsCorrect = await verifyPassword(password);
		if(passwordIsCorrect){
			document.cookie = `password=${encodeURIComponent(password)}; path=/; max-age=86400`;
			window.location.href = "index.html";
		}else{
			console.log("Senha incorreta.");
		}

	} else {
		alert('Por favor, preencha a senha.');
	}
});
