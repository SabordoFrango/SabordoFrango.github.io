import { getCookie } from "./getCookie.js";

function formatarData(dataInput, tipo){
	const data = new Date(dataInput);
	const dia = String(data.getUTCDate()).padStart(2, '0');
	const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
	const ano = data.getUTCFullYear();
	switch(tipo){
		case 0:
			return `${dia}/${mes}/${ano}`;
		case 1:
			return `${ano}-${mes}-${dia}`;
	}
}

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('pedidos-table-body');
    const modal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeModalBtn = document.querySelector('.close-btn');

	const inputTelefone = document.getElementById('edit-telefone');
	const mascaraTelefone = {
		mask: '(00) 00000-0000'
	};
	const mask = IMask(inputTelefone, mascaraTelefone)
    
    const apiUrl = 'https://script.google.com/macros/s/AKfycbym0GgNgHq5HvQCoZJMY5jgS-AWs14tJj2VAnvDegK3EHTekPhqPU9cnLsRz4W9zMnn/exec';

    async function carregarPedidos() {
        try {
            const response = await fetch(apiUrl);
            const result = await response.json();

            if (result.status === "sucesso") {
				console.log(result);
                tableBody.innerHTML = ''; 
                result.dados.forEach(pedido => {
                    const tr = document.createElement('tr');

					const dataRetiradaFormatada = formatarData(pedido.retirada, 0);

					//Formatar pedidos
					const produto = pedido.produto;
					const produtoList = produto.split(';');
					const produtoFormatado = `Frango:${produtoList[0]} | Maionese:${produtoList[1]} | Sobrecoxa:${produtoList[2]}`
					const pago = pedido.pago ? "Sim" : "Não";

                    tr.innerHTML = `
                        <td>${pedido.nome}</td>
                        <td>${produtoFormatado}</td>
                        <td>${pedido.telefone}</td>
						<td>${pago}</td>
                        <td>${dataRetiradaFormatada}</td>
                        <td>
                            <button class="edit-btn" data-id="${pedido.id}">Alterar</button>
                            <button class="delete-btn" data-id="${pedido.id}">Deletar</button>
                        </td>
                    `;
                    tr.dataset.pedido = JSON.stringify(pedido);
                    tableBody.appendChild(tr);
                });
            } else {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Erro ao carregar pedidos: ${result.detalhe}</td></tr>`;
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Erro de conexão. Verifique a URL da API e sua internet.</td></tr>`;
        }
    }

    tableBody.addEventListener('click', (e) => {
        const pedidoId = e.target.dataset.id;
        
        if (e.target.classList.contains('delete-btn')) {
            if (confirm(`Tem certeza que deseja deletar o pedido de ID ${pedidoId}?`)) {
                enviarAcaoParaAPI({ action: 'delete', id: pedidoId, password: getCookie('password') });
            }
        }
        
        if (e.target.classList.contains('edit-btn')) {
            const pedido = JSON.parse(e.target.closest('tr').dataset.pedido);

			const produtos = pedido.produto;
			const produtosList = produtos.split(';');
			const frango = produtosList[0];
			const maionese = produtosList[1];
			const sobrecoxa = produtosList[2];

            document.getElementById('edit-pedido-id').value = pedido.id;
            document.getElementById('edit-nome').value = pedido.nome;
			document.getElementById('edit-frango').value = frango;
			document.getElementById('edit-maionese').value = maionese;
			document.getElementById('edit-sobrecoxa').value = sobrecoxa;
            document.getElementById('edit-telefone').value = pedido.telefone;
            document.getElementById('edit-retirada').value = formatarData(pedido.retirada, 1);
			document.getElementById('edit-pago').checked = pedido.pago;
            modal.style.display = 'flex';
        }
    });

    closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => {
        if (e.target == modal) { modal.style.display = 'none'; }
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-pedido-id').value;

		const frangoEditado = document.getElementById('edit-frango').value;
		const maioneseEditado = document.getElementById('edit-maionese').value;
		const sobrecoxaEditado = document.getElementById('edit-sobrecoxa').value;

		const produtosListEditado = new Array(frangoEditado, maioneseEditado, sobrecoxaEditado);

		const produtosEditado = produtosListEditado.join(';');

        const dadosDoFormulario = {
            nome: document.getElementById('edit-nome').value,
            produto: produtosEditado,
            telefone: document.getElementById('edit-telefone').value,
            retirada: document.getElementById('edit-retirada').value,
			pago: document.getElementById('edit-pago').checked ? "1" : "0",
        };
        enviarAcaoParaAPI({ action: 'update', id: id, data: dadosDoFormulario, password: getCookie('password')});
        modal.style.display = 'none';
    });

    async function enviarAcaoParaAPI(payload) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                mode: 'no-cors',
				headers: {
					'Content-Type': 'application/json',
				},
                body: JSON.stringify(payload)
            });
            alert('Ação enviada com sucesso! Atualizando a lista...');
			setTimeout(() => {
				carregarPedidos();
			}, 2000);
            carregarPedidos();
        } catch (error) {
            console.error('Erro ao enviar ação:', error);
            alert('Falha ao enviar ação para o servidor.');
        }
    }

    carregarPedidos();
});
