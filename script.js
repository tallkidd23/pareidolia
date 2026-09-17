// Configure your image folder and extensions here
const IMAGE_FOLDER = 'images/';
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

const stage = document.getElementById('stage');
const photoEl = document.getElementById('photo');

let imageUrls = [];
let currentIndex = 0;
let loadedImages = [];

// Build list of image URLs
async function loadImageList() {
  // If directory listing is not available, uncomment and use this manual list:
  // const filenames = ['01.jpg', '02.jpg', '03.jpg'];
  // imageUrls = filenames.map(name => IMAGE_FOLDER + name);
  // loadedImages = new Array(imageUrls.length).fill(null);
  // return;

  try {
    const res = await fetch(IMAGE_FOLDER);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));

    const filenames = links
      .map(a => decodeURIComponent(a.getAttribute('href') || ''))
      .filter(href => {
        if (!href) return false;
        if (href.endsWith('/') || href.includes('..')) return false;
        const ext = href.split('.').pop().toLowerCase();
        return IMAGE_EXTENSIONS.includes(ext);
      })
      .sort();

    imageUrls = filenames.map(name => IMAGE_FOLDER + name);
    loadedImages = new Array(imageUrls.length).fill(null);
  } catch {
    // Fallback: manual list if auto-discovery fails
    const filenames = [
      '01.jpg',
      '02.jpg',
      '03.jpg'
    ];
    imageUrls = filenames.map(name => IMAGE_FOLDER + name);
    loadedImages = new Array(imageUrls.length).fill(null);
  }
}

// Preload an image by index
function preloadImage(index) {
  if (!imageUrls[index] || loadedImages[index]) return;
  const img = new Image();
  img.src = imageUrls[index];
  img.onload = () => {
    loadedImages[index] = img;
    if (index === currentIndex) {
      showImage(index);
    }
  };
}

function showImage(index) {
  const img = loadedImages[index];
  if (!img) return;
  photoEl.src = img.src;
}

function nextImage() {
  if (imageUrls.length === 0) return;
  currentIndex = (currentIndex + 1) % imageUrls.length;
  preloadImage(currentIndex);
  showImage(currentIndex);
}

function init() {
  if (imageUrls.length === 0) return;
  // preload first few images
  for (let i = 0; i < Math.min(3, imageUrls.length); i++) {
    preloadImage(i);
  }
  showImage(currentIndex);
}

// Advance on click/tap
stage.addEventListener('click', (e) => {
  e.preventDefault();
  nextImage();
});

// Also advance on arrow keys / space for desktop
window.addEventListener('keydown', (e) => {
  if (['ArrowRight', 'ArrowLeft', 'Space', 'Enter'].includes(e.code)) {
    e.preventDefault();
    nextImage();
  }
});

// Start
loadImageList().then(init);