import { getCookie } from "./getCookie.js";

document.addEventListener('DOMContentLoaded', () => {

	const dataHoje = document.getElementById('retirada').valueAsDate = new Date();

	const inputTelefone = document.getElementById('telefone');
	const mascaraTelefone = {
		mask: '(00) 00000-0000'
	};
	const mask = IMask(inputTelefone, mascaraTelefone)

    const form = document.getElementById('pedido-form');
    const submitButton = document.getElementById('submit-button');
    const statusMessage = document.getElementById('status-message');

    const apiUrl = 'https://script.google.com/macros/s/AKfycbym0GgNgHq5HvQCoZJMY5jgS-AWs14tJj2VAnvDegK3EHTekPhqPU9cnLsRz4W9zMnn/exec';

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        statusMessage.textContent = ''; 

        const formData = new FormData(form);
        const produtosSelecionados = formData.getAll('produto');
        const produtoFinal = produtosSelecionados.join(';');

        if(produtoFinal === ''){
            statusMessage.textContent = 'Por favor, selecione pelo menos um produto.';
            statusMessage.style.color = 'red';
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Pedido';
            return;
        }

        const dataObject = Object.fromEntries(formData.entries());
        dataObject.produto = produtoFinal;

        const payload = {
            action: 'create',
            data: dataObject,
			password: getCookie('password'),
        };

	console.log(JSON.stringify(payload));

        try {
            const response = await fetch(apiUrl, {
                method: 'POST', 
                mode: 'no-cors', 
                body: JSON.stringify(payload) 
            });
            statusMessage.textContent = 'Pedido enviado com sucesso!';
            statusMessage.style.color = 'green';
            form.reset();
			document.getElementById('retirada').valueAsDate = new Date();
        } catch (error) {
            console.error('Erro ao enviar o formulário:', error);
            statusMessage.textContent = 'Ocorreu um erro. Verifique sua conexão e tente novamente.';
            statusMessage.style.color = 'red';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Enviar Pedido';
        }
    });
});
