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
});

// Ensure default static shelves have names for localStorage
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
    const savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
    savedShelves.forEach(shelfData => {
        // Skip custom creation for main shelf since it's already in HTML
        if (shelfData.name !== "Main Library" && shelfData.name !== "Favourites") {
            createShelf(shelfData.name, shelfData.books);
        } else {
            // Populate books into existing static shelves
            const targetShelf = shelfData.name === "Main Library" ? mainShelf : favouritesShelf;
            if (targetShelf) {
                shelfData.books.forEach(book => {
                    createBookCard(targetShelf, book.title, book.cover, book.author, book.genre, book.pages);
                });
            }
        }
    });
};

function saveShelf(name){
    const savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
    if (!savedShelves.some(s => s.name === name)) {
        savedShelves.push({ name: name, books: [] });
        localStorage.setItem('myShelves', JSON.stringify(savedShelves));
    }
}

function saveBook(shelfName, title, cover, author = "Unknown", genre = "N/A", pages = "N/A"){
    const savedShelves = JSON.parse(localStorage.getItem('myShelves')) || [];
    const target = savedShelves.find(s => s.name === shelfName);
    if (target){
        // Prevent duplicate entries of the exact same book title on the same shelf
        if (!target.books.some(b => b.title === title)) {
            target.books.push({ title, cover, author, genre, pages });
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
        // Default dummy data for initial HTML hardcoded cards
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

function createShelf(shelfName, books){
    const shelfLabel = document.createElement('span');
    shelfLabel.textContent = `✮ ${shelfName}`;
    shelfLabel.style.display = 'block';
    shelfLabel.style.marginTop = '30px';
    
    const newShelf = document.createElement('div');
    newShelf.classList.add('my-shelf');
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
        createBookCard(newShelf, book.title, book.cover, book.author, book.genre, book.pages);
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

    // Mirror to Master Library (#main-shelf) if not already adding to main shelf
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

// Target specifically the selected tropes container so we don't wipe out the menu
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

// Renders the quick-select preset buttons into the modal menu
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

    const reviewPayload = {
        startDate: document.getElementById('review-start-date').value,
        endDate: document.getElementById('review-end-date').value,
        rating: rating,
        review: document.getElementById('review-text').value,
        quotes: document.getElementById('review-quotes').value,
        tropes: tropes
    };

    const savedReviews = JSON.parse(localStorage.getItem('myBookReviews')) || {};
    savedReviews[currentReviewBook] = reviewPayload;
    localStorage.setItem('myBookReviews', JSON.stringify(savedReviews));

    alert('Review saved');
    reviewModal.style.display = 'none';
});