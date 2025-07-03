document.addEventListener('DOMContentLoaded', () => {
    // Базовый URL API (замените на ваш)
    const API_BASE_URL = 'https://your-api-domain.com/api';
    let currentUser = null;

    // ---- Логика для переключения видимости расширенных фильтров ----
    const toggleAdvancedFiltersButton = document.getElementById('toggleAdvancedFilters');
    const advancedFiltersDiv = document.getElementById('advancedFilters');

    toggleAdvancedFiltersButton.addEventListener('click', () => {
        const isHidden = advancedFiltersDiv.style.display === 'none';
        advancedFiltersDiv.style.display = isHidden ? 'block' : 'none';
        toggleAdvancedFiltersButton.textContent = isHidden ? 'Скрыть расширенные параметры' : 'Расширенные параметры поиска';
    });

    // ---- Логика для вкладок Личного кабинета ----    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const profileSection = document.getElementById('profile-section');
    const mainContent = document.querySelector('main.main-content');
    const sectionsToHide = document.querySelectorAll('main.main-content > section:not(#profile-section)');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            
            const targetTabId = button.dataset.tab;
            document.getElementById(targetTabId).classList.add('active');
            profileSection.style.display = 'block';

            // Загружаем данные для активной вкладки
            if (targetTabId === 'favorites') loadFavorites();
            else if (targetTabId === 'history') loadHistory();
            else if (targetTabId === 'notes') loadBookmarks();
        });
    });

    // ---- Меню ----
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const closeMenuButton = document.querySelector('.close-menu');
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');

    if (menuToggle && sidebarMenu && closeMenuButton) { 
        menuToggle.addEventListener('click', () => {
            sidebarMenu.classList.add('open');
            document.body.style.overflow = 'hidden'; 
        });

        closeMenuButton.addEventListener('click', () => {
            sidebarMenu.classList.remove('open');
            document.body.style.overflow = ''; 
        });

        document.addEventListener('click', (e) => {
            if (!sidebarMenu.contains(e.target) && !menuToggle.contains(e.target) && sidebarMenu.classList.contains('open')) {
                sidebarMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });

        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                sectionsToHide.forEach(section => section.style.display = 'none');
                profileSection.style.display = 'block';
                profileSection.scrollIntoView({ behavior: 'smooth' });
                sidebarMenu.classList.remove('open');
                document.body.style.overflow = ''; 

                const targetTab = link.dataset.section;
                if (targetTab) {
                    const targetButton = document.querySelector(`.profile-tabs .tab-button[data-tab="${targetTab.replace('-tab', '')}"]`);
                    if (targetButton) targetButton.click();
                }
            });
        });
    }

// ---- Логика для навигации в шапке (Каталог, Контакты) ----
const mainNavLinks = document.querySelectorAll('.main-nav a[href^="#"]');

mainNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Отменяем стандартное поведение ссылки

        const targetId = link.getAttribute('href'); // Получаем id цели, например "#catalog-section"
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // 1. Находим секцию профиля и все остальные "основные" секции
            const profileSection = document.getElementById('profile-section');
            const mainSections = document.querySelectorAll('main.main-content > section:not(#profile-section)');

            // 2. Делаем все ОСНОВНЫЕ секции видимыми
            mainSections.forEach(section => {
                section.style.display = 'block'; // Или 'grid', 'flex' в зависимости от их исходного стиля. 'block' - универсально.
            });
            
            // 3. Прячем секцию профиля, если она была открыта
            if (profileSection) {
                profileSection.style.display = 'none';
            }

            // 4. Плавно прокручиваем к нужной секции
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

    // ---- Поиск ----
    const heroSearchInput = document.getElementById('heroSearchInput');
    const heroSearchButton = document.getElementById('heroSearchButton');

    heroSearchButton.addEventListener('click', () => {
        const query = heroSearchInput.value.trim();
        if (query) {
            document.getElementById('searchTitle').value = query;
            performAdvancedSearch();
            document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Пожалуйста, введите запрос для поиска.');
        }
    });

    heroSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') heroSearchButton.click();
    });

    // ---- Расширенный поиск ----
    const searchTitleInput = document.getElementById('searchTitle');
    const searchAuthorInput = document.getElementById('searchAuthor');
    const searchYearInput = document.getElementById('searchYear');
    const searchKeywordsInput = document.getElementById('searchKeywords');
    const searchBooksButton = document.querySelector('.search-books-button');
    const resetFiltersButton = document.querySelector('.reset-filters');
    const bookListContainer = document.getElementById('bookList');
    const searchResultsPlaceholder = document.querySelector('.search-results-placeholder');

    async function performAdvancedSearch() {
        const params = new URLSearchParams();
        if (searchTitleInput.value.trim()) params.append('title', searchTitleInput.value.trim());
        if (searchAuthorInput.value.trim()) params.append('author', searchAuthorInput.value.trim());
        if (searchYearInput.value.trim()) params.append('year', searchYearInput.value.trim());
        if (searchKeywordsInput.value.trim()) params.append('keywords', searchKeywordsInput.value.trim());

        // Симуляция, чтобы показать книги, т.к. API не работает
        if (bookListContainer.querySelectorAll('.book-list-item').length > 0) {
            searchResultsPlaceholder.style.display = 'none';
            return;
        }

        try {
            // const response = await fetch(`${API_BASE_URL}/books?${params.toString()}`);
            // if (!response.ok) throw new Error('Ошибка сервера');
            // const { books } = await response.json();
            // renderBooks(books);
        } catch (error) {
            console.error('Ошибка поиска:', error);
            searchResultsPlaceholder.textContent = 'Ошибка загрузки данных';
            searchResultsPlaceholder.style.display = 'block';
        }
    }

    function renderBooks(books) {
        bookListContainer.innerHTML = '';
        
        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.classList.add('book-list-item');
            bookItem.dataset.annotation = `Аннотация: ${book.description || 'Нет описания'}`;
            bookItem.innerHTML = `
                <div class="book-cover-small">
                    <img src="${book.cover_url || 'https://via.placeholder.com/80x120?text=No+Cover'}" alt="${book.title}">
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="book-author">Автор: ${book.author}</p>
                    <p class="book-year">Год: ${book.publication_year}</p>
                </div>
                <div class="book-actions">
                    <button class="button small read-button" data-book-id="${book.id}">Читать</button>
                    <button class="button small secondary favorite-button" data-book-id="${book.id}">В избранное</button>
                </div>
            `;
            bookListContainer.appendChild(bookItem);
        });
    }

    resetFiltersButton.addEventListener('click', () => {
        document.querySelectorAll('#catalog-section input, #catalog-section textarea, #catalog-section select').forEach(el => {
            if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
            else el.value = '';
        });
        bookListContainer.innerHTML = '<p class="search-results-placeholder">Результаты поиска появятся здесь.</p>';
    });

    // ---- Личный кабинет ----
    async function loadFavorites() { /* ... */ }
    async function loadHistory() { /* ... */ }
    async function loadBookmarks() { /* ... */ }

    // ---- Логика для всплывающих окон (Popups) и Авторизации ----
    const loginPopup = document.getElementById('loginPopup');
    const registerPopup = document.getElementById('registerPopup');
    const editProfilePopup = document.getElementById('editProfilePopup'); 

    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');

    const closePopupButtons = document.querySelectorAll('.close-popup');
    const showRegisterFormLink = document.getElementById('showRegisterForm');
    const showLoginFormLink = document.getElementById('showLoginForm');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const editProfileForm = document.getElementById('editProfileForm');

    const openPopup = (popup) => {
        if (popup) popup.style.display = 'block';
    };

    const closeAllPopups = () => {
        document.querySelectorAll('.popup').forEach(popup => {
            popup.style.display = 'none';
        });
    };

    if (loginBtn) {
        loginBtn.addEventListener('click', () => openPopup(loginPopup));
    }
    if (registerBtn) {
        registerBtn.addEventListener('click', () => openPopup(registerPopup));
    }
    // НОВЫЙ ОБРАБОТЧИК
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => openPopup(editProfilePopup));
    }

    closePopupButtons.forEach(button => {
        button.addEventListener('click', closeAllPopups);
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('popup')) {
            closeAllPopups();
        }
    });

    if (showRegisterFormLink) {
        showRegisterFormLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllPopups();
            openPopup(registerPopup);
        });
    }

   if (showLoginFormLink) {
        showLoginFormLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllPopups();
            openPopup(loginPopup); // Закрываем все и открываем окно входа
        });
    }

    // --- ЛОГИКА ФОРМЫ ВХОДА ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.loginEmail.value;
            const password = loginForm.loginPassword.value;

            try {
                // Здесь будет ваш код для отправки запроса на API
                alert(`Вход выполнен (симуляция). Добро пожаловать!`);
                closeAllPopups();
            } catch (error) {
                alert('Ошибка входа (симуляция)');
                console.error('Ошибка входа:', error);
            }
        });
    }

    // --- ЛОГИКА ФОРМЫ РЕГИСТРАЦИИ ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = registerForm.registerName.value;
            const email = registerForm.registerEmail.value;
            const password = registerForm.registerPassword.value;
            const passwordConfirm = registerForm.registerPasswordConfirm.value;

            if (password !== passwordConfirm) {
                alert('Пароли не совпадают!');
                return;
            }
            
            try {
                // Здесь будет ваш код для отправки запроса на API
                alert('Регистрация успешна (симуляция). Теперь вы можете войти.');
                closeAllPopups();
                openPopup(loginPopup);
            } catch (error) {
                alert('Ошибка регистрации (симуляция)');
                console.error('Ошибка регистрации:', error);
            }
        });
    }

    // --- ЛОГИКА ФОРМЫ РЕДАКТИРОВАНИЯ ПРОФИЛЯ ---
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = editProfileForm.editName.value;
            const newPassword = editProfileForm.editPassword.value;
            const newPasswordConfirm = editProfileForm.editPasswordConfirm.value;
            
            // Проверяем пароли, только если поле нового пароля не пустое
            if (newPassword) {
                if (newPassword !== newPasswordConfirm) {
                    alert('Новые пароли не совпадают!');
                    return;
                }
            }

            // Здесь будет код для отправки запроса на API
            try {
                // const response = await fetch(`${API_BASE_URL}/profile/update`, { ... });
                alert('Профиль успешно обновлен (симуляция).');
                // Можно обновить имя пользователя на странице
                document.querySelector('#profile p:first-of-type').innerHTML = `<strong>Имя пользователя:</strong> ${newName}`;
                closeAllPopups();
            } catch (error) {
                alert('Ошибка обновления профиля (симуляция)');
                console.error('Ошибка обновления:', error);
            }
        });
    }

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

    // ---- Обработчики ----
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('read-button')) {
            const bookId = e.target.dataset.bookId;
            window.location.href = `reader.html?id=${bookId}`;
        }
        
        if (e.target.classList.contains('favorite-button')) {
            if (!currentUser) return alert('Нужно войти в систему');
            
            try {
                await fetch(`${API_BASE_URL}/favorites`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ 
                        book_id: e.target.dataset.bookId 
                    })
                });
                alert('Добавлено в избранное');
            } catch (error) {
                alert('Ошибка');
            }
        }
    });

    // ---- Инициализация ----
    async function init() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                currentUser = await response.json();

                const authButtons = document.querySelector('.auth-buttons');
                if (currentUser && authButtons) {
                    // Эта часть кода не будет работать, т.к. login/register кнопки
                    // уже объявлены как const. При реальной авторизации
                    // этот блок нужно будет пересмотреть.
                }

            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        
        performAdvancedSearch();
    }
    init();
});