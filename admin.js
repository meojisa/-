document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const API_BASE_URL = 'https://your-api-domain.com/api'; // Замените!

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(uploadForm);

        try {
            const response = await fetch(`${API_BASE_URL}/admin/upload`, { // Endpoint для загрузки книг
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Проверка авторизации админа
                },
                body: formData
            });

            if (response.ok) {
                alert('Книга успешно загружена!');
                uploadForm.reset(); // Очистка формы
            } else {
                const errorData = await response.json();
                alert(`Ошибка загрузки: ${errorData.message || 'Неизвестная ошибка'}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            alert('Произошла ошибка при загрузке книги.');
        }
    });

    // Выход из админ-панели
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html'; // Перенаправление на главную страницу
    });
        // ---- Темная тема ----
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.add(`${savedTheme}-theme`);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        body.classList.toggle('light-theme');

        const newTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // Мб Дополнительные функции для управления книгами (получение, редактирование, удаление) можно добавить здесь
});