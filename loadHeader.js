document.addEventListener("DOMContentLoaded", function() {
    const headerPlaceholder = document.querySelector("div[data-include='header']");

    if (headerPlaceholder) {
        fetch('header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar o cabeçalho.');
                }
                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;
            })
            .catch(error => {
                console.error('Falha ao buscar o cabeçalho:', error);
                headerPlaceholder.innerHTML = "<p>Erro ao carregar o cabeçalho.</p>";
            });
    }
});
