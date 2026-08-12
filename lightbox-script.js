// Lightbox navigation
let currentIndex = 0;

function showLightbox(index) {
  lightboxImg.src = getImage(index);
  lightbox.classList.add('show');
  currentIndex = index;
}

function nextImage() {
  currentIndex = (currentIndex + 1) % 8; // Assuming 8 images
  showLightbox(currentIndex);
}

function prevImage() {
  currentIndex = (currentIndex - 1 + 8) % 8;
  showLightbox(currentIndex);
}

// Event listeners for lightbox buttons
document.querySelector('.next').onclick = nextImage;
document.querySelector('.prev').onclick = prevImage;
