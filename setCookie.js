import { getCookie } from "./getCookie.js";

async function gerarHashCliente(senha, email) {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha + email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function verifyPassword(password) {
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
	const email = document.getElementById('user').value;
	const password = document.getElementById('password').value;

	if (password && email) {

		const hashPassword = await gerarHashCliente(password, email);
		
		const passwordIsCorrect = await verifyPassword(hashPassword);
		if(passwordIsCorrect){
			document.cookie = `password=${encodeURIComponent(hashPassword)}; path=/; max-age=86400`;
			window.location.href = "index.html";
		}else{
			console.log("Senha incorreta.");
		}

	} else {
		alert('Por favor, preencha a senha.');
	}
});
