const shelfModal = document.getElementById('shelf-modal');
const addBookModal = document.getElementById('add-book-modal');
const reviewModal = document.getElementById('review-modal');

const shelfCloseBtn = document.getElementById('shelf-close')
const addBookCloseBtn = document.getElementById('add-book-close')
const reviewCloseBtn = document.getElementById('review-close');

const createShelfBtn = document.getElementById('create-shelf-btn');
const confirmShelfBtn = document.getElementById('confirm-shelf');
const newShelfInput = document.getElementById('new-shelf-name');

const addBookBtns = document.querySelectorAll('.add-book');
const newBookTitle = document.getElementById('add-book-title');
const addToShelf = document.getElementById('add-to-shelf')

const mainShelf = document.getElementById('main-shelf')
const bookCards = document.querySelectorAll('.book-card');


const apiKey = 'AIzaSyCatwj23gOQmzDSqE6Lplm9Dgc3IDBKkWg';

let activeShelf = null;
let currentReviewBook = null;

window.addEventListener('DOMContentLoaded',()=>{
    loadSavedData();
});

//loaidng saved data
function loadSavedData(){
    const savedShelves = JSON.parse(localStorage.getItem('myShelves'))||[];
    savedShelves.forEach(shelfData => {
        createShelfElement(shelfData.name,shelfData.books);
    });
};

function saveShelf(name){
    const savedShelves = JSON.parse(localStorage.getItem('myShelves'))||[];
    savedShelves.push({name: name, books:[]});
    localStorage.setItem('myShelves',JSON.stringify(savedShelves));
}

function saveBook(shelf, title, cover){
    const savedShelves = JSON.parse(localStorage.getItem('myShelves'))||[];
    const target = savedShelves.find(s => s.name === shelf);
    if (target){
        target.books.push({title,cover});
        localStorage.setItem('myShelves',JSON.stringify(savedShelves));
    }
    
}
//Opening the modal boxes
createShelfBtn.addEventListener('click',() =>{
    shelfModal.style.display = 'block';
});

addBookBtns.forEach(btn => {
    btn.addEventListener('click',()=>{
        activeShelf = btn.closest('.my-shelf')
        addBookModal.style.display = 'block';
    });
});

bookCards.forEach(card => {
    card.addEventListener('click',() =>{
        reviewModal.style.display = 'grid';
    });
});

//Closing modal boxes
shelfCloseBtn.addEventListener('click',()=>{
shelfModal.style.display = 'none';
});
addBookCloseBtn.addEventListener('click',()=>{
addBookModal.style.display = 'none';
});
reviewCloseBtn.addEventListener('click',()=>{
reviewModal.style.display = 'none';
});

function createShelf(shelfName,books){
        const shelfLabel = document.createElement('span');
        shelfLabel.textContent = `✮ ${shelfName}`;
        shelfLabel.style.display = 'block';
        shelfLabel.style.marginTop = '30px';
        const newShelf = document.createElement('div');
        newShelf.classList.add('my-shelf');
        newShelf.dataset.shelfName = shelfName;

        const addBookBtn = document.createElement('div');
        addBookBtn.classList.add('add-book')
        addBookBtn.innerHTML = '<span>+</span>'

        addBookBtn.addEventListener('click',() => {
            activeShelf = newShelf;
            addBookModal.style.display = 'block';
        });

        newShelf.appendChild(addBookBtn);
        
        books.forEach(book =>{
            createBookCard(newShelf, book.title, book.cover)
        });

        document.body.insertBefore(shelfLabel,createShelfBtn);
        document.body.insertBefore(newShelf, createShelfBtn);    

        return newShelf
}
//Creating a new shelf
confirmShelfBtn.addEventListener('click',()=>{
    //validating if shelp input contains characters
    const shelfName = newShelfInput.value.trim();

    if (shelfName != ""){
        createShelf(shelfName,[]);
        saveShelf(shelfName);

        newShelfInput.value = '';
        shelfModal.style.display = 'none';
    };
});

function createBookCard(shelf,title,cover){
    const newBookCard = document.createElement ('div');
    newBookCard.classList.add('book-card')
    const img = document.createElement ('img');
    img.src = cover;
    img.alt = title;
    newBookCard.appendChild(img);

    newBookCard.addEventListener('click',()=>{
        reviewModal.style.display = 'grid';
    });

    const addButton = shelf.querySelector('.add-book');
    shelf.insertBefore(newBookCard,addButton);

    const newMasterBookCard = newBookCard.cloneNode(true);
                
    newMasterBookCard.addEventListener('click',()=>{
        reviewModal.style.display = 'grid';
    });

    const mainShelfAddButton = mainShelf.querySelector('.add-book');
    mainShelf.insertBefore(newMasterBookCard,mainShelfAddButton);

    return newBookCard
                
}
addToShelf.addEventListener('click', async(e)=> {
    //stopping page reload
    e.preventDefault();
    //validating if new book title has characters other than spaces
    const query = newBookTitle.value.trim();

    if (query !== "" && activeShelf) {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`);
            const data = await response.json();
            console.log(data);
            
            if (data.items && data.items.length > 0) {
                const bookInfo = data.items[0].volumeInfo;

                const title = bookInfo.title || query;
                //applying fallback if author/cover is missing
                const author = bookInfo.authors ? bookInfo.authors[0] : "Unknown";
                const cover = bookInfo.imageLinks && bookInfo.imageLinks.thumbnail ? bookInfo.imageLinks.thumbnail.replace('http:','https:')
                : 'six-of-crows.png'

                createBookCard(activeShelf, title, cover);
                saveBook(activeShelf.dataset.shelfName, title, cover);
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
    document.getElementById('review-pages').textContent = `${bookData.pages || 'N/A'} pages`

    const coverImg = document.getElementById('review-cover-img');
    if (coverImg) {
        coverImg.src = bookData.cover || 'six-of-crows.jpg';
        coverImg.alt = bookData.title;
    }
    document.getElementById('review-start-date').value = reviewData.startDate || '';
    document.getElementById('review-end-date').value = reviewData.endDate || '';
    document.getElementById('review-text').value = reviewData.review || '';
    document.getElementById('review-quotes').value = reviewData.quotes || '';

    renderRatingStars(reviewData.rating || 0);
    renderTropes(reviewData.tropes || []);
    reviewModal.style.display = 'grid';

    
}

