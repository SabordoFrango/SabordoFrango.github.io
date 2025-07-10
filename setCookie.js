import { getCookie } from "./getCookie.js";

document.addEventListener('DOMContentLoaded', () => {

	const senhaText = document.getElementById('senhaSalvaText');

	if(getCookie('password') === null){
		senhaText.textContent = "Senha salva:";
	}else{
		senhaText.textContent = `Senha salva:${getCookie('password')}`;
	}
});
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const password = document.getElementById('password').value;

    if (password) {
        document.cookie = `password=${encodeURIComponent(password)}; path=/; max-age=86400`;

        alert('Senha salva no cookie!');
        console.log('Cookie de senha criado. Verifique nas ferramentas de desenvolvedor do seu navegador.');
	console.log(getCookie('password'));
    } else {
        alert('Por favor, preencha a senha.');
    }
	window.location.reload();
});
