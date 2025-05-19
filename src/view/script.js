async function fetchEmployee(URL) {
    try {
        const response = await fetch(URL); // Altere a URL para a rota correta
        if (!response.ok) {
            throw new Error('Erro ao buscar o funcionário');
        }
        const employees = await response.json();
        const tableBody = document.getElementById('employeeTableBody');
        tableBody.innerHTML = ''; // Limpa a tabela antes de adicionar novos dados

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.emp_no}</td>
                <td>${employee.first_name}</td>
                <td>${employee.last_name}</td>
                <td>${employee.gender}</td>
                <td>${formatDate(employee.hire_date)}</td>
                <td><button onclick="toggleDetails(this)">Detalhes</button></td>
            `;
            tableBody.appendChild(row);

            const detailsRow = document.createElement('tr');
            detailsRow.style.display = 'none'; // Esconde a linha de detalhes inicialmente
            detailsRow.innerHTML = `
                <td colspan="6">
                    <strong>Salários:</strong>
                    <ul>
                        ${employee.salaries.map(salary => `
                            <li>De: ${formatDate(salary.from_date)} Até: ${formatDate(salary.to_date)} - Salário: ${salary.salary}</li>
                        `).join('')}
                    </ul>
                    <strong>Títulos:</strong>
                    <ul>
                        ${employee.titles.map(title => `
                            <li>${title.title} (De: ${formatDate(title.from_date)} Até: ${formatDate(title.to_date)})</li>
                        `).join('')}
                    </ul>
                    <strong>Departamentos:</strong>
                    <ul>
                        ${employee.departments.map(department => `
                            <li>${department.dept_name} (${department.dept_no})</li>
                        `).join('')}
                    </ul>
                </td>
            `;
            tableBody.appendChild(detailsRow);

            row.detailsRow = detailsRow; // Associa a linha de detalhes à linha principal
        });
    } catch (error) {
        const tableBody = document.getElementById('employeeTableBody');
        tableBody.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
    }
}

function toggleDetails(button) {
    const detailsRow = button.parentElement.parentElement.detailsRow;
    if (detailsRow.style.display === 'none') {
        detailsRow.style.display = 'table-row'; // Mostra a linha de detalhes
        button.textContent = 'Esconder';
    } else {
        detailsRow.style.display = 'none'; // Esconde a linha de detalhes
        button.textContent = 'Detalhes';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}