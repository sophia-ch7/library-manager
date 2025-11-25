const savedData = localStorage.getItem('libraryData');

let authors = [];

if (savedData) {
    authors = JSON.parse(savedData);
} else {
    authors = [
        {
            id: 1,
            name: "Тарас Шевченко",
            books: [
                { id: 101, title: "Кобзар" },
                { id: 102, title: "Катерина" }
            ]
        },
        {
            id: 2,
            name: "Джордж Орвелл",
            books: [
                { id: 201, title: "1984" }
            ]
        }
    ];
}

let currentUser = localStorage.getItem('libraryUser') || ""; 
let editParams = null;

function saveData() {
    localStorage.setItem('libraryData', JSON.stringify(authors));
}


if (currentUser) {
    document.getElementById('user-display').innerText = `Привіт, ${currentUser}`;
    toggleScreens(true);
    renderApp();
}

function login() {
    const name = document.getElementById('username').value.trim();
    if (name) {
        currentUser = name;
        localStorage.setItem('libraryUser', currentUser);
        document.getElementById('user-display').innerText = `Привіт, ${currentUser}`;
        toggleScreens(true);
        renderApp();
    } else {
        alert("Введіть ім'я");
    }
}

function logout() {
    currentUser = "";
    localStorage.removeItem('libraryUser'); 
    document.getElementById('username').value = "";
    toggleScreens(false);
}

function toggleScreens(isLoggedIn) {
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    if (isLoggedIn) {
        loginScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
    } else {
        loginScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
    }
}

function renderApp() {
    const listContainer = document.getElementById('library-list');
    const authorSelect = document.getElementById('authorSelect');
    const searchTerm = document.getElementById('searchAuthor').value.toLowerCase();
    
    listContainer.innerHTML = "";
    authorSelect.innerHTML = "";

    const filteredAuthors = authors.filter(author => {
        const matchesAuthorName = author.name.toLowerCase().includes(searchTerm);
        const matchesBookTitle = author.books.some(book => book.title.toLowerCase().includes(searchTerm));
        return matchesAuthorName || matchesBookTitle;
    });

    if (filteredAuthors.length === 0) {
        listContainer.innerHTML = "<p style='text-align:center; color:grey;'>Нікого не знайдено...</p>";
    }

    filteredAuthors.forEach(author => {
        const option = document.createElement('option');
        option.value = author.id;
        option.innerText = author.name;
        authorSelect.appendChild(option);

        let booksHtml = "";
        if (author.books.length === 0) {
            booksHtml = "<li class='book-item' style='color:grey; font-style:italic;'>Книг поки немає...</li>";
        } else {
            author.books.forEach(book => {
                booksHtml += `
                    <li class="book-item">
                        <span>📖 "${book.title}"</span>
                        <div>
                             <button onclick="editBook(${author.id}, ${book.id})" class="btn btn-edit">Ред</button>
                             <button onclick="deleteBook(${author.id}, ${book.id})" class="btn btn-del">X</button>
                        </div>
                    </li>
                `;
            });
        }

        const authorCard = `
            <div class="author-card">
                <div class="author-header">
                    <span>👤 ${author.name}</span>
                    <button onclick="deleteAuthor(${author.id})" class="btn btn-del">Видалити автора</button>
                </div>
                <ul class="book-list">
                    ${booksHtml}
                </ul>
            </div>
        `;
        listContainer.innerHTML += authorCard;
    });
}

function addAuthor() {
    const nameInput = document.getElementById('newAuthorName');
    const name = nameInput.value.trim();
    
    if (name) {
        authors.push({ id: Date.now(), name: name, books: [] });
        saveData(); 
        nameInput.value = "";
        renderApp();
    } else {
        alert("Введіть ім'я автора!");
    }
}

function addBook() {
    const authorId = Number(document.getElementById('authorSelect').value);
    const titleInput = document.getElementById('newBookTitle');
    const title = titleInput.value.trim();

    if (!authorId) {
        alert("Спочатку додайте автора!");
        return;
    }
    if (title) {
        const author = authors.find(a => a.id === authorId);
        if (author) {
            author.books.push({ id: Date.now(), title: title });
            saveData(); 
            titleInput.value = "";
            renderApp();
        }
    } else {
        alert("Введіть назву книги!");
    }
}

function deleteAuthor(authorId) {
    if(confirm("Видалити автора і всі його книги?")) {
        authors = authors.filter(a => a.id !== authorId);
        saveData(); 
        renderApp();
    }
}

function deleteBook(authorId, bookId) {
    if(confirm("Видалити цю книгу?")) {
        const author = authors.find(a => a.id === authorId);
        if (author) {
            author.books = author.books.filter(b => b.id !== bookId);
            saveData(); 
            renderApp();
        }
    }
}

function editBook(authorId, bookId) {
    const author = authors.find(a => a.id === authorId);
    const book = author.books.find(b => b.id === bookId);
    
    document.getElementById('edit-input').value = book.title;
    editParams = { authorId, bookId };
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

function saveEdit() {
    const newTitle = document.getElementById('edit-input').value.trim();
    if (newTitle && editParams) {
        const author = authors.find(a => a.id === editParams.authorId);
        if (author) {
            const book = author.books.find(b => b.id === editParams.bookId);
            if (book) {
                book.title = newTitle;
                saveData(); 
                renderApp();
            }
        }
        closeEditModal();
    } else {
        alert("Назва не може бути порожньою!");
    }
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
    editParams = null;
}

function exportData() {
    let csvContent = "Author;Title\n"; 
    
    authors.forEach(author => {
        author.books.forEach(book => {
            csvContent += `"${author.name}";"${book.title}"\n`;
        });
    });

    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "library.csv");
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}