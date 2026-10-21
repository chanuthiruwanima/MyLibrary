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

const bookCards = document.querySelectorAll('.book-card');


let activeShelf = null;

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

//Creating a new shelf
confirmShelfBtn.addEventListener('click',()=>{
    //validating if shelp input contains characters
    const shelfName = newShelfInput.value.trim();

    if (shelfName != ""){
        const shelfLabel = document.createElement('span');
        shelfLabel.textContent = '✮ ${shelfName}';

        const newShelf = document.createElement('div');
        newShelf.classList.add('my-shelf');

        const addBookBtn = document.createElement('div');
        addBookBtn.classList.add('add-book')
        addBookBtn.innerHTML = '<span>+<span>'

        addBookBtn.addEventListener('click',() => {
            addBookModal.style.display = 'block'
        });

        newShelf.appendChild(addBookBtn);

        document.body.insertBefore(shelfLabel,shelfModal);
        document.body.insertBefore(newShelf, shelfModal);

        newShelfInput.value = '';
        shelfModal.style.display = 'none';
    };
});

addToShelf.addEventListener('click', async(e)=>{
    //stopping page reload
    e.preventDefault();
    //validating if new book title has characters other than spaces
    const query = newBookTitle.value.trim();

    if (query !== "" && activeShelf{
        try {
            const response = await fetch('https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}');
            const data = await response.json();

            if (data.items && data.items.length > 0 {
                const bookInfo = data.items[0].volumeInfo;

                const title = bookInfo.title || query;
                //applying fallback if author/cover is missing
                const author = bookInfo.authors ? bookCardsInfo.authors[0] : "Unknown";
                const cover = bookInfo.imageLinks && bookInfo.imageLinks.thumbnail ? bookInfo.imageLinks.thumbnail.replace('http:',"https:")
                : 'six-of-crows.png'

                const newBookCard = document.createElement ('img');
                img.src = thumbnail;
                img.alt = title;
                newBookCard.appendChild(img);

                newBookCard.addEventListener('click',()=>{
                    reviewModal.style.display = 'grid';
                })
            });
        };
    });
});
