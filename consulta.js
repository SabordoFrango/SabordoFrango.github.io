import { getCookie } from "./getCookie.js";

function formatarData(dataInput, tipo) {
    if (!dataInput) return '';
    const data = new Date(dataInput);
    const dia = String(data.getUTCDate()).padStart(2, '0');
    const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
    const ano = data.getUTCFullYear();

    switch (tipo) {
        case 0: 
            return `${dia}/${mes}/${ano}`;
        case 1:
            return `${ano}-${mes}-${dia}`;
        case 2: 
            return `${ano}${mes}${dia}`;
        default:
            return '';
    }
}

async function carregarPedidos() {
    const apiUrl = 'https://script.google.com/macros/s/AKfycbym0GgNgHq5HvQCoZJMY5jgS-AWs14tJj2VAnvDegK3EHTekPhqPU9cnLsRz4W9zMnn/exec';
    const tableBody = document.getElementById('pedidos-table-body');

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro na rede: ${response.statusText}`);
        }
        const result = await response.json();

		if (result.status === "sucesso") {
			if ($.fn.DataTable.isDataTable('#TabelaPedidos')) {
				$('#TabelaPedidos').DataTable().destroy();
			}
			tableBody.innerHTML = '';
			
			console.log(result.dados);
			$('#TabelaPedidos').DataTable({
				destroy: true,
				data: result.dados,

				columnDefs: [
					{
						targets: [0, 1], 
						type: 'string-accent-neutralise' 
					},
					{
						targets: 1, 
						render: (data) => {
							const produtoList = data.split(';');
							return `Frango:${produtoList[0]}\n  Maionese:${produtoList[1]}\n Sobrecoxa:${produtoList[2]}`;
						}
					},
					{
						targets: 3, 
						render: (data) => data ? "Sim" : "Não"
					},
					{
						targets: 4, 
						render: (data, type) => {
							if (type === 'display') return formatarData(data, 0);
							return formatarData(data, 2); // Formato para ordenação
						}
					},
					{
						targets: 5, 
						render: (data) => data ? "Sim" : "Não"
					},
					{
						targets: 6, 
						orderable: false,
						searchable: false,
						render: (data, type, row) => `
							<button class="btn btn-secondary edit-btn" data-id="${row.id}">Alterar</button>
							<button class="btn btn-danger delete-btn" data-id="${row.id}">Deletar</button>
							<button class="btn btn-success success-btn" data-id="${row.id}">Retirou</button>
						`
					}
				],
				columns: [
					{ data: 'nome' },
					{ data: 'produto' },
					{ data: 'telefone' },
					{ data: 'pago' },
					{ data: 'retirada' },
					{ data: 'retirou'},
					{ data: null }, 
				],
				language: {
					url: 'https://cdn.datatables.net/plug-ins/2.0.8/i18n/pt-BR.json',
				}
			});

	} else {
		tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Erro ao carregar pedidos: ${result.detalhe}</td></tr>`;
	}
} catch (error) {
	console.error('Erro na função carregarPedidos:', error);
	tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Falha na conexão. Verifique a URL da API e sua internet.</td></tr>`;
}
}

async function enviarAcaoParaAPI(payload) {
	const apiUrl = 'https://script.google.com/macros/s/AKfycbym0GgNgHq5HvQCoZJMY5jgS-AWs14tJj2VAnvDegK3EHTekPhqPU9cnLsRz4W9zMnn/exec';
	try {
		await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			mode: 'no-cors',
			body: JSON.stringify(payload),
			redirect: "follow"
		});

		alert('Ação enviada com sucesso! A lista será atualizada em instantes.');
		setTimeout(() => {
			carregarPedidos();
		}, 1500);

	} catch (error) {
		console.error('Erro ao enviar ação:', error);
		alert('Falha ao enviar ação para o servidor.');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const modal = document.getElementById('edit-modal');
	const editForm = document.getElementById('edit-form');
	const closeModalBtn = document.querySelector('.close-btn');
	const tableBody = document.getElementById('pedidos-table-body');

	const inputTelefone = document.getElementById('edit-telefone');
	IMask(inputTelefone, { mask: '(00) 00000-0000' });

	tableBody.addEventListener('click', (e) => {
		const target = e.target;

		if (target.classList.contains('delete-btn')) {
			const pedidoId = target.dataset.id;
			if (confirm(`Tem certeza que deseja deletar o pedido de ID ${pedidoId}?`)) {
				enviarAcaoParaAPI({ action: 'delete', id: pedidoId, password: getCookie('password') });
			}
		}

		if (target.classList.contains('edit-btn')) {
			const pedidoId = target.dataset.id;
			const dataTable = $('#TabelaPedidos').DataTable();
			const pedidoData = dataTable.row($(target).closest('tr')).data();

			if (pedidoData) {
				const produtosList = pedidoData.produto.split(';');
				document.getElementById('edit-pedido-id').value = pedidoData.id;
				document.getElementById('edit-nome').value = pedidoData.nome;
				document.getElementById('edit-frango').value = produtosList[0];
				document.getElementById('edit-maionese').value = produtosList[1];
				document.getElementById('edit-sobrecoxa').value = produtosList[2];
				document.getElementById('edit-telefone').value = pedidoData.telefone;
				document.getElementById('edit-retirada').value = formatarData(pedidoData.retirada, 1);
				document.getElementById('edit-pago').checked = pedidoData.pago;
				modal.style.display = 'flex';
			}
		}

		if (target.classList.contains('success-btn')) {
			const pedidoId = target.dataset.id;
			enviarAcaoParaAPI({action: 'retirou', id: pedidoId, password:getCookie('password')});
		}
	});

	closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
	window.addEventListener('click', (e) => {
		if (e.target == modal) { modal.style.display = 'none'; }
	});

	editForm.addEventListener('submit', (e) => {
		e.preventDefault();

		const produtosListEditado = [
			document.getElementById('edit-frango').value,
			document.getElementById('edit-maionese').value,
			document.getElementById('edit-sobrecoxa').value
		];

		const dadosDoFormulario = {
			nome: document.getElementById('edit-nome').value,
			produto: produtosListEditado.join(';'),
			telefone: document.getElementById('edit-telefone').value,
			retirada: document.getElementById('edit-retirada').value,
			pago: document.getElementById('edit-pago').checked ? "1" : "0",
		};

		const id = document.getElementById('edit-pedido-id').value;
		enviarAcaoParaAPI({ action: 'update', id: id, data: dadosDoFormulario, password: getCookie('password') });
		modal.style.display = 'none';
	});

	carregarPedidos();
});
