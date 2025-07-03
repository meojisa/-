document.addEventListener('DOMContentLoaded', async () => {
    // Базовый URL API (замените на ваш)
    const API_BASE_URL = 'https://your-api-domain.com/api';
    
    // Получаем ID книги из URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    // Загружаем данные книги с сервера
    let bookData = {};
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
        if (!response.ok) throw new Error('Книга не найдена');
        bookData = await response.json();
        
        // Заполняем метаданные
        document.getElementById('bookTitle').textContent = bookData.title;
        document.getElementById('bookAuthor').textContent = bookData.author || 'Автор не указан';
        document.getElementById('bookYear').textContent = bookData.publication_year || 'Год не указан';
        document.getElementById('bookAnnotation').textContent = bookData.annotation || 'Описание отсутствует';
        document.getElementById('bookCover').src = bookData.cover_url || 'https://via.placeholder.com/200x300?text=Обложка';
        document.getElementById('pageCount').textContent = bookData.pages || 'неизвестно';
    } catch (error) {
        console.error('Ошибка загрузки данных книги:', error);
        alert('Не удалось загрузить данные книги');
        return;
    }

    // Показ/скрытие деталей книги
    document.getElementById('toggleDetails').addEventListener('click', function() {
        const detailsDiv = document.getElementById('bookDetails');
        if (detailsDiv.style.display === 'none') {
            if (detailsDiv.innerHTML === '') {
                loadBookDetails(bookData);
            }
            detailsDiv.style.display = 'block';
            this.textContent = 'Скрыть детали';
        } else {
            detailsDiv.style.display = 'none';
            this.textContent = 'Показать детали';
        }
    });

    function loadBookDetails(book) {
        const detailsHTML = `
            <p><strong>Порядковый номер:</strong> ${book.order_number || 'не указано'}</p>
            <p><strong>Место издания:</strong> ${book.publication_place || 'не указано'}</p>
            <p><strong>Шифр УДК/ББК:</strong> ${book.udc_bbk_code || 'не указано'}</p>
            <p><strong>ISBN:</strong> ${book.isbn || 'не указано'}</p>
            <p><strong>Переплет:</strong> ${book.binding_type || 'не указано'}</p>
        `;
        document.getElementById('bookDetails').innerHTML = detailsHTML;
    }

    // Инициализация PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
    
    let pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        scale = 1.5;
    
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    
    // Загрузка PDF
    async function loadPdf(url) {
        try {
            // Если PDF хранится на сервере
            const pdfUrl = `${API_BASE_URL}/books/${bookId}/pdf`;
            
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            pdfDoc = await loadingTask.promise;
            
            document.getElementById('totalPages').textContent = pdfDoc.numPages;
            document.getElementById('currentPage').textContent = pageNum;
            
            renderPage(pageNum);
        } catch (error) {
            console.error('Ошибка загрузки PDF:', error);
            
            // Создаем сообщение об ошибке
            const errorDiv = document.createElement('div');
            errorDiv.className = 'pdf-error';
            errorDiv.innerHTML = `
                <p>Не удалось загрузить книгу</p>
                <button class="button primary" id="retryLoad">Попробовать снова</button>
            `;
            document.querySelector('.reader-viewport').appendChild(errorDiv);
            
            document.getElementById('retryLoad').addEventListener('click', () => {
                errorDiv.remove();
                loadPdf(url);
            });
        }
    }
    
    // Рендеринг страницы
    function renderPage(num) {
        pageRendering = true;
        
        // Очищаем canvas перед рендерингом
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            const renderTask = page.render(renderContext);
            
            renderTask.promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
                
                // Обновляем информацию о странице
                document.getElementById('currentPage').textContent = num;
            });
        }).catch(error => {
            console.error('Ошибка рендеринга страницы:', error);
            pageRendering = false;
        });
    }
    
    // Перелистывание страниц
    function queueRenderPage(num) {
        if (!pdfDoc) {
            console.error('PDF документ не загружен');
            return;
        }
        
        if (num < 1 || num > pdfDoc.numPages) {
            console.warn('Некорректный номер страницы');
            return;
        }
        
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }
    
    // Навигация по страницам
    document.getElementById('prevPage').addEventListener('click', () => {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    });
    
    // Кнопка "Вернуться в каталог" - ИСПРАВЛЕННЫЙ КОД
    const backToCatalogBtn = document.getElementById('backToCatalog');
    if (backToCatalogBtn) {
        backToCatalogBtn.addEventListener('click', function() {
            // Проверяем, откуда пришли
            if (document.referrer && document.referrer.includes(window.location.hostname)) {
                window.history.back();
            } else {
                // Если пришли не с нашего сайта, идем на главную
                window.location.href = 'index.html';
            }
        });
    }
    
    // Кнопка "Добавить закладку"
    const addBookmarkBtn = document.getElementById('addBookmark');
    if (addBookmarkBtn) {
        addBookmarkBtn.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Для добавления закладки необходимо войти в систему');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/bookmarks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        book_id: bookId,
                        page: pageNum
                    })
                });
                
                if (response.ok) {
                    alert('Закладка добавлена!');
                } else {
                    throw new Error('Ошибка сервера');
                }
            } catch (error) {
                console.error('Ошибка добавления закладки:', error);
                alert('Не удалось добавить закладку');
            }
        });
    }
    
    // Переключение темы
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    
    // Проверка сохраненной темы
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
        // --- НАЧАЛО: Функционал гамбургер-меню для reader.js ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const closeMenuButton = document.querySelector('.close-menu');
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');

    if (menuToggle && sidebarMenu && closeMenuButton) { // Убедимся, что элементы существуют
        // Открытие меню
        menuToggle.addEventListener('click', () => {
            sidebarMenu.classList.add('open');
            document.body.style.overflow = 'hidden'; // Запрещаем прокрутку основного контента
        });

        // Закрытие меню по кнопке X
        closeMenuButton.addEventListener('click', () => {
            sidebarMenu.classList.remove('open');
            document.body.style.overflow = ''; // Разрешаем прокрутку
        });

        // Закрытие меню по клику вне его области
        document.addEventListener('click', (e) => {
            if (!sidebarMenu.contains(e.target) && !menuToggle.contains(e.target) && sidebarMenu.classList.contains('open')) {
                sidebarMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });

        // Обработка кликов по ссылкам в боковом меню
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Предотвращаем стандартный переход по ссылке

                const section = link.getAttribute('data-section'); // Получаем 'profile-tab', 'favorites-tab' и т.д.
                
                // Перенаправляем на index.html, и там, в script.js, мы обработаем этот параметр
                // для открытия нужной вкладки.
                // #profile-section используется для прокрутки к разделу на index.html
                // ?tab=${section} используется для script.js на index.html для активации вкладки
                window.location.href = `index.html#profile-section?tab=${section}`;

                sidebarMenu.classList.remove('open'); // Закрываем меню
                document.body.style.overflow = ''; // Разрешаем прокрутку
            });
        });
    }
    // Загрузка PDF
    loadPdf(bookData.file_url);
});