const shelfModal = document.getElementById('shelf-modal');
const addBookModal = document.getElementById('add-book-modal');
const reviewModal = document.getElementById('review-modal');

const shelfCloseBtn = document.getElementById('shelf-close');
const addBookCloseBtn = document.getElementById('add-book-close');
const reviewCloseBtn = document.getElementById('review-close');

const createShelfBtn = document.getElementById('create-shelf-btn');
const confirmShelfBtn = document.getElementById('confirm-shelf');
const newShelfInput = document.getElementById('new-shelf-name');

const addBookBtns = document.querySelectorAll('.add-book');
const newBookTitle = document.getElementById('add-book-title');
const addToShelf = document.getElementById('add-to-shelf');

const mainShelf = document.getElementById('main-shelf');
const favouritesShelf = document.getElementById('favourites-shelf');
const bookCards = document.querySelectorAll('.book-card');

const addTropeBtn = document.getElementById('add-trope-btn');
const newTropeInput = document.getElementById('new-trope-input');
const saveReviewBtn = document.getElementById('save-review-btn');

let currentReads = [];
let activeReadIndex = 0;

let currentDate = new Date();

// Tropes Setup
const savedTropes = JSON.parse(localStorage.getItem('myTropes')) || []; 
let tropesList = [
    "🫂 Found Family",
    "✨ Chosen One",
    "💘 Enemies to Lovers",
    "🔍 Unreliable Narrator",
    "💎 Heist",
    "🏛️ Dark Academia"
];
savedTropes.forEach(trope => {
    if (!tropesList.includes(trope)) {
        tropesList.push(trope);
    }
});

const apiKey = 'AIzaSyCatwj23gOQmzDSqE6Lplm9Dgc3IDBKkWg';
let activeShelf = null;
let currentReviewBook = null;

window.addEventListener('DOMContentLoaded', () => {
    initializeDefaultShelves();
    loadSavedData();
    renderTropesMenu();
    renderCalendar();
});

function renderCalendar(){
    const grid = document.getElementById('calendar-grid');
    const monthYearLabel = document.getElementById('month-year');
    if (!grid) return; 

    grid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (monthYearLabel) monthYearLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const savedReviews = JSON.parse(localStorage.getItem('myBookReviews')) || {};
    const savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];

    const bookCoverMap = {};
    savedShelves.forEach(shelf =>{
        shelf.books.forEach(book =>{
            bookCoverMap[book.title] = book.cover;
        });
    });
    
    const finishedBooksByDate = {};
    Object.keys(savedReviews).forEach(title =>{
        const review = savedReviews[title];
        if (review.endDate){
            if(!finishedBooksByDate[review.endDate]){
                finishedBooksByDate[review.endDate] = [];
            }
            finishedBooksByDate[review.endDate].push({
                title: title,
                cover: bookCoverMap[title] || 'six-of-crows.jpg'
            });
        }
    });

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');

        const numberSpan = document.createElement('span');
        numberSpan.classList.add('calendar-day-number');
        numberSpan.textContent = day;
        dayCell.appendChild(numberSpan);

        const formattedMonth = String(month + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const dateString = `${year}-${formattedMonth}-${formattedDay}`;

        if (finishedBooksByDate[dateString]) {
            const coversContainer = document.createElement('div');
            coversContainer.classList.add('calendar-covers-container');

            finishedBooksByDate[dateString].forEach(book => {
                const img = document.createElement('img');
                img.src = book.cover;
                img.alt = book.title;
                img.title = `Finished: ${book.title}`;
                img.classList.add('calendar-book-badge');
                coversContainer.appendChild(img);
            });
            dayCell.appendChild(coversContainer);
        }

        grid.appendChild(dayCell);
    }
};

document.getElementById('prev-month-btn').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
});

document.getElementById('next-month-btn').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
});

// Ensure default shelves have names for localStorage
function initializeDefaultShelves() {
    if (mainShelf) mainShelf.dataset.shelfName = "Main Library";
    if (favouritesShelf) favouritesShelf.dataset.shelfName = "Favourites";

    let savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
    const existingNames = savedShelves.map(s => s.name);

    if (!existingNames.includes("Main Library")) {
        savedShelves.push({ name: "Main Library", books: [] });
    }
    if (!existingNames.includes("Favourites")) {
        savedShelves.push({ name: "Favourites", books: [] });
    }
    localStorage.setItem('myShelves', JSON.stringify(savedShelves));
}

// Loading saved data
function loadSavedData(){
    const dnfShelf = document.getElementById('dnf-shelf');
    if (dnfShelf) dnfShelf.innerHTML = '';
    const shelves = document.querySelectorAll('.my-shelf');
    shelves.forEach(shelf => {
        shelf.querySelectorAll('.book-card').forEach(card => card.remove());
    });
    document.querySelectorAll('.custom-shelf').forEach(el => el.remove());

    const savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
    savedShelves.forEach(shelfData => {
        // Skip custom creation for main shelf
        if (shelfData.name !== "Main Library" && shelfData.name !== "Favourites") {
            createShelf(shelfData.name, shelfData.books);
        } else {
            // Populate books into existing  shelves
            const targetShelf = shelfData.name === "Main Library" ? mainShelf : favouritesShelf;
            if (targetShelf) {
                shelfData.books.forEach(book => {
                    if (book.status === 'dnf'){
                        shelveAsDNF(book.title, book.cover);
                    }
                    else {
                    createBookCard(targetShelf, book.title, book.cover, book.author, book.genre, book.pages);
                    }    
            });
            }
        }
    });
    updateCurrentReads();
};

//Saving custom shelf
function saveShelf(name){
    const savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
    if (!savedShelves.some(s => s.name === name)) {
        savedShelves.push({ name: name, books: [] });
        localStorage.setItem('myShelves', JSON.stringify(savedShelves));
    }
}

//Saving new book
function saveBook(shelfName, title, cover, author = "Unknown", genre = "N/A", pages = "N/A", status){
    const savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
    const target = savedShelves.find(s => s.name === shelfName);
    if (target){
        // Prevent duplicate entries
        if (!target.books.some(b => b.title === title)) {
            target.books.push({ title, cover, author, genre, pages, status});
            localStorage.setItem('myShelves', JSON.stringify(savedShelves));
        }
    }
}

// Opening modal boxes
createShelfBtn.addEventListener('click', () => {
    shelfModal.style.display = 'block';
});

addBookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        activeShelf = btn.closest('.my-shelf');
        addBookModal.style.display = 'block';
    });
});

bookCards.forEach(card => {
    card.addEventListener('click', () => {
        // Default data for fallback
        openReview({
            title: card.querySelector('img')?.alt || "Book Title",
            author: "Unknown",
            genre: "N/A",
            pages: "N/A",
            cover: card.querySelector('img')?.src || 'six-of-crows.jpg'
        });
    });
});

// Closing modal boxes
shelfCloseBtn.addEventListener('click', () => { shelfModal.style.display = 'none'; });
addBookCloseBtn.addEventListener('click', () => { addBookModal.style.display = 'none'; });
reviewCloseBtn.addEventListener('click', () => { reviewModal.style.display = 'none'; });

//Creating a new shelf
function createShelf(shelfName, books){
    const shelfLabel = document.createElement('span');
    shelfLabel.textContent = `✮ ${shelfName}`;
    shelfLabel.classList.add('custom-shelf');
    shelfLabel.style.display = 'block';
    shelfLabel.style.marginTop = '30px';
    
    const newShelf = document.createElement('div');
    newShelf.classList.add('my-shelf','custom-shelf');
    newShelf.dataset.shelfName = shelfName;

    const addBookBtn = document.createElement('div');
    addBookBtn.classList.add('add-book');
    addBookBtn.innerHTML = '<span>+</span>';

    addBookBtn.addEventListener('click', () => {
        activeShelf = newShelf;
        addBookModal.style.display = 'block';
    });

    newShelf.appendChild(addBookBtn);
    books.forEach(book => {
        if (book.status === 'dnf') {
            shelveAsDNF(book.title, book.cover);
        } else {
            createBookCard(newShelf, book.title, book.cover, book.author, book.genre, book.pages);
        }
    });
    document.body.insertBefore(shelfLabel, createShelfBtn);
    document.body.insertBefore(newShelf, createShelfBtn);    

    return newShelf;
}

confirmShelfBtn.addEventListener('click', () => {
    const shelfName = newShelfInput.value.trim();
    if (shelfName !== ""){
        createShelf(shelfName, []);
        saveShelf(shelfName);
        newShelfInput.value = '';
        shelfModal.style.display = 'none';
    }
});

//Creating new book card
function createBookCard(shelf, title, cover, author = "Unknown", genre = "N/A", pages = "N/A"){
    const newBookCard = document.createElement('div');
    newBookCard.classList.add('book-card');
    const img = document.createElement('img');
    img.src = cover;
    img.alt = title;
    newBookCard.appendChild(img);

    const bookData = { title, cover, author, genre, pages };
    newBookCard.addEventListener('click', () => {
        openReview(bookData);
    });

    const addButton = shelf.querySelector('.add-book');
    if (addButton) {
        shelf.insertBefore(newBookCard, addButton);
    } else {
        shelf.appendChild(newBookCard);
    }

    // Mirror to Master Library
    if (shelf !== mainShelf) {
        const newMasterBookCard = newBookCard.cloneNode(true);
        newMasterBookCard.addEventListener('click', () => {
            openReview(bookData);
        });
        const mainShelfAddButton = mainShelf.querySelector('.add-book');
        if (mainShelfAddButton) {
            mainShelf.insertBefore(newMasterBookCard, mainShelfAddButton);
        } else {
            mainShelf.appendChild(newMasterBookCard);
        }
    }

    return newBookCard;
}

addToShelf.addEventListener('click', async(e) => {
    e.preventDefault();
    const query = newBookTitle.value.trim();

    if (query !== "" && activeShelf) {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const bookInfo = data.items[0].volumeInfo;

                const title = bookInfo.title || query;
                const author = bookInfo.authors ? bookInfo.authors[0] : "Unknown";
                const genre = bookInfo.categories ? bookInfo.categories[0] : "N/A"; 
                const pages = bookInfo.pageCount || "N/A";
                const cover = bookInfo.imageLinks && bookInfo.imageLinks.thumbnail 
                    ? bookInfo.imageLinks.thumbnail.replace('http:', 'https:')
                    : 'six-of-crows.png';
                
                createBookCard(activeShelf, title, cover, author, genre, pages);
                saveBook(activeShelf.dataset.shelfName, title, cover, author, genre, pages);
                
                newBookTitle.value = '';
                addBookModal.style.display = 'none';
            }
        } catch (error) {
            console.error("Error fetching book:", error);
        }
    }
});


//Opening review
function openReview(bookData){
    currentReviewBook = bookData.title;

    document.getElementById('review-title').textContent = bookData.title;
    document.getElementById('review-author').textContent = `Author: ${bookData.author}`;
    document.getElementById('review-genre').textContent = `Genre: ${bookData.genre}`;
    document.getElementById('review-pages').textContent = `${bookData.pages || 'N/A'} pages`;
    

    const coverImg = document.getElementById('review-cover-img');
    if (coverImg) {
        coverImg.src = bookData.cover || 'six-of-crows.jpg';
        coverImg.alt = bookData.title;
    }
    
    const savedReviews = JSON.parse(localStorage.getItem('myBookReviews')) || {};
    const reviewData = savedReviews[bookData.title] || {};

    document.getElementById('review-start-date').value = reviewData.startDate || '';
    document.getElementById('review-end-date').value = reviewData.endDate || '';
    document.getElementById('review-text').value = reviewData.review || '';
    document.getElementById('review-quotes').value = reviewData.quotes || '';
    document.getElementById('review-status').value =  reviewData.status 

    renderRatingStars(reviewData.rating || 0);
    renderTropes(reviewData.tropes || []);
    reviewModal.style.display = 'grid';
}

function renderRatingStars(selectedRating = 0){
    const ratingBox = document.querySelector('.rating-box');
    ratingBox.innerHTML = '<label id="review-rating">Rating: </label>';

    const starsContainer = document.createElement('span');
    starsContainer.classList.add('star-rating');

    for (let i = 1; i <= 5; i++){
        const star = document.createElement('span');
        star.textContent = i <= selectedRating ? '★' : '☆';
        star.style.cursor = 'pointer';
        star.style.fontSize = '20px';
        star.style.color = '#764c4c';
        star.dataset.value = i;

        star.addEventListener('click', () => {
            renderRatingStars(i);
        });
        starsContainer.appendChild(star);
    }
    ratingBox.appendChild(starsContainer);
};

function renderTropes(tropesArray){
    const tropesContainer = document.getElementById('selected-tropes-tags');
    if (!tropesContainer) return;
    tropesContainer.innerHTML = '';

    tropesArray.forEach((trope, index) => {
        const tag = document.createElement('span');
        tag.classList.add('trope-tag');
        tag.textContent = `#${trope}`;
        tag.style.background = '#e6d7c3';
        tag.style.padding = '2px 8px';
        tag.style.borderRadius = '12px';
        tag.style.marginRight = '5px';
        tag.style.cursor = 'pointer';
        tag.title = 'click to remove';

        tag.addEventListener('click', () => {
            tropesArray.splice(index, 1);
            renderTropes(tropesArray);
        });
        tropesContainer.appendChild(tag);
    });
    tropesContainer.dataset.tropes = JSON.stringify(tropesArray);
}

function renderTropesMenu(){
    const container = document.getElementById('tropes-options-container');
    if (!container) return;
    
    container.innerHTML = '';

    tropesList.forEach(trope => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = trope;
        btn.style.background = '#f4ebd0';
        btn.style.border = '1px solid #d4c39c';
        btn.style.padding = '3px 8px';
        btn.style.borderRadius = '10px';
        btn.style.fontSize = '11px';
        btn.style.marginRight = '5px';
        btn.style.marginBottom = '5px';
        btn.style.cursor = 'pointer';

        btn.addEventListener('click', () => {
            const tropesContainer = document.getElementById('selected-tropes-tags');
            const currentTropes = JSON.parse(tropesContainer.dataset.tropes || '[]');
            if (!currentTropes.includes(trope)) {
                currentTropes.push(trope);
                renderTropes(currentTropes);
            }
        });
        container.appendChild(btn);
    });
}

// Adding custom tropes
addTropeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const tropeText = newTropeInput.value.trim();
    
    if (tropeText){
        if (!tropesList.includes(tropeText)) {
            tropesList.push(tropeText);
            const currentCustom = JSON.parse(localStorage.getItem('myTropes')) || [];
            if (!currentCustom.includes(tropeText)) {
                currentCustom.push(tropeText);
                localStorage.setItem('myTropes', JSON.stringify(currentCustom));
            }
            renderTropesMenu();
        }

        const tropesContainer = document.getElementById('selected-tropes-tags');
        const currentTropes = JSON.parse(tropesContainer.dataset.tropes || '[]');
        if (!currentTropes.includes(tropeText)) {
            currentTropes.push(tropeText);
            renderTropes(currentTropes);
        }

        newTropeInput.value = '';
    }
});

saveReviewBtn.addEventListener('click', () => {
    if(!currentReviewBook) return;

    const starsContainer = document.querySelector('.star-rating');
    let rating = 0;
    if (starsContainer){
        rating = Array.from(starsContainer.children).filter(s => s.textContent === '★').length;
    }
    const tropesContainer = document.getElementById('selected-tropes-tags');
    const tropes = JSON.parse(tropesContainer.dataset.tropes || '[]');
    const status = document.getElementById('review-status').value;

    const reviewPayload = {
        startDate: document.getElementById('review-start-date').value,
        endDate: document.getElementById('review-end-date').value,
        rating: rating,
        review: document.getElementById('review-text').value,
        quotes: document.getElementById('review-quotes').value,
        status: status,
        tropes: tropes

    };

    const savedReviews = JSON.parse(localStorage.getItem('myBookReviews')) || {};
    savedReviews[currentReviewBook] = reviewPayload;
    localStorage.setItem('myBookReviews', JSON.stringify(savedReviews));
    let savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
    savedShelves.forEach(shelf => {
        shelf.books.forEach(book => {
            if (book.title === currentReviewBook) {
                book.status = status;
            }
        });
    });
    
    localStorage.setItem('myShelves', JSON.stringify(savedShelves));
    loadSavedData();
    alert('Review saved');
    reviewModal.style.display = 'none';
});


//Transferring book to DNF shelf
function shelveAsDNF(title, cover='six-of-crows.jpg'){
    const dnfShelf = document.getElementById('dnf-shelf');

    const alreadyExists = Array.from(dnfShelf.children).some(card => {
        return card.querySelector('img')?.alt === title;
    });
    if (alreadyExists) return;
    const dnfCard = document.createElement('div');
    dnfCard.classList.add('book-card');
    dnfCard.style.opacity = '0.7'; 
    dnfCard.innerHTML = `<img src="${cover}" alt="${title}" title="${title} (DNF)">`;

    dnfCard.addEventListener('click', () => {
            const savedReviews = JSON.parse(localStorage.getItem('myBookReviews')) || {};
            const reviewData = savedReviews[title] || {};
            openReview({
                title: title,
                author: "Unknown",
                genre: "N/A",
                pages: reviewData.totalPages || "N/A",
                cover: cover
            });
        });

    dnfShelf.appendChild(dnfCard);
};

function updateCurrentReads(){
    currentlyReadingBooks = [];
    const savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
    const savedReviews = JSON.parse(localStorage.getItem('myBookReviews')) || {};

    savedShelves.forEach(shelf => {
        shelf.books.forEach(book => {
            if (book.status === 'reading') {
                const review = savedReviews[book.title] || {};
                if (!currentlyReadingBooks.some(b => b.title === book.title)) {
                    currentlyReadingBooks.push({
                        title: book.title,
                        author: book.author || 'Unknown',
                        cover: book.cover || 'six-of-crows.jpg',
                        currentPage: review.currentPage || 0,
                        totalPages: review.totalPages || parseInt(book.pages) || 0
                    });
                }
            }}
        )}
    )
if (activeReadIndex >= currentlyReadingBooks.length) {
        activeReadIndex = Math.max(0, currentlyReadingBooks.length - 1);
    }
    renderDashboardWidget();
};

function renderDashboardWidget() {
    const currentTitle = document.getElementById('current-title');
    const currentAuthor = document.getElementById('current-author');
    const coverImg = document.querySelector('.currently-reading img');
    const pagesSpan = document.getElementById('progress-pages');
    const pageInput = document.getElementById('current-page-input');
    const indexSpan = document.getElementById('current-read-index');
    const progressFill = document.getElementById('progress-fill');

    if (currentlyReadingBooks.length === 0) {
        if (currentTitle) currentTitle.textContent = "No active read";
        if (currentAuthor) currentAuthor.textContent = "";
        if (coverImg) coverImg.src = "six-of-crows.jpg";
        if (pagesSpan) pagesSpan.textContent = "Page 0 of 0";
        if (pageInput) pageInput.value = 0;
        if (indexSpan) indexSpan.textContent = "0 / 1";
        if (progressFill) {
            let inner = progressFill.querySelector('.progress-inner');
            if (inner) inner.style.width = "0%";
        }
        return;
    }

    const currentBook = currentlyReadingBooks[activeReadIndex];

    if (currentTitle) currentTitle.textContent = currentBook.title;
    if (currentAuthor) currentAuthor.textContent = currentBook.author;
    if (coverImg) coverImg.src = currentBook.cover;
    if (pagesSpan) pagesSpan.textContent = `Page ${currentBook.currentPage} of ${currentBook.totalPages}`;
    if (pageInput) pageInput.value = currentBook.currentPage;
    if (indexSpan) indexSpan.textContent = `${activeReadIndex + 1} / ${currentlyReadingBooks.length}`;


    if (progressFill) {
        let inner = progressFill.querySelector('.progress-inner');
        if (!inner) {
            progressFill.style.position = 'relative';
            progressFill.style.overflow = 'hidden';
            inner = document.createElement('div');
            inner.classList.add('progress-inner');
            inner.style.height = '100%';
            inner.style.backgroundColor = 'var(--accent-color)';
            inner.style.borderRadius = '5px';
            inner.style.transition = 'width 0.3s ease';
            progressFill.appendChild(inner);
        }
        const percentage = currentBook.totalPages > 0 
            ? Math.min(Math.round((currentBook.currentPage / currentBook.totalPages) * 100), 100) 
            : 0;
        inner.style.width = `${percentage}%`;
    }
}

document.getElementById('prev-read-btn')?.addEventListener('click', () => {
    if (currentlyReadingBooks.length > 0) {
        activeReadIndex = (activeReadIndex - 1 + currentlyReadingBooks.length) % currentlyReadingBooks.length;
        renderDashboardWidget();
    }
});

document.getElementById('next-read-btn')?.addEventListener('click', () => {
    if (currentlyReadingBooks.length > 0) {
        activeReadIndex = (activeReadIndex + 1) % currentlyReadingBooks.length;
        renderDashboardWidget();
    }
});

document.getElementById('update-progress-btn')?.addEventListener('click', () => {
    if (currentlyReadingBooks.length === 0) return;

    const currentBook = currentlyReadingBooks[activeReadIndex];
    const newPage = parseInt(document.getElementById('current-page-input').value) || 0;
    
    currentBook.currentPage = newPage;

    const savedReviews = JSON.parse(localStorage.getItem('myBookReviews')) || {};
    if (!savedReviews[currentBook.title]) savedReviews[currentBook.title] = {};
    savedReviews[currentBook.title].currentPage = newPage;

    if (currentBook.totalPages > 0 && newPage >= currentBook.totalPages) {
        savedReviews[currentBook.title].status = 'read';
        
        let savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
        savedShelves.forEach(shelf => {
            shelf.books.forEach(b => {
                if (b.title === currentBook.title) b.status = 'read';
            });
        });
        localStorage.setItem('myShelves', JSON.stringify(savedShelves));
        alert(`🎉 Congratulations! You finished "${currentBook.title}"!`);
    }

    localStorage.setItem('myBookReviews', JSON.stringify(savedReviews));
    loadSavedData();
    updateCurrentReads();
});