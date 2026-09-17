const OWNER = 'tallkidd23';
const REPO = 'pareidolia';
const BRANCH = 'main';
const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
const SLIDE_INTERVAL_MS = 6000;
const REFRESH_LIST_MS = 5 * 60 * 1000;

let images = [];
let idx = 0;
let slideTimer = null;

const photoEl = document.getElementById('photo');
const captionEl = document.getElementById('caption');

async function loadImages() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/images?ref=${BRANCH}`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error('GitHub API error ' + res.status);
    const files = await res.json();
    const newImages = files
      .filter((f) => f.type === 'file' && IMAGE_EXT.test(f.name))
      .map((f) => f.name)
      .sort();

    const changed = JSON.stringify(newImages) !== JSON.stringify(images);
    images = newImages;

    if (images.length === 0) {
      captionEl.textContent = 'No photos yet \u2014 upload one to the images folder!';
      photoEl.removeAttribute('src');
      return;
    }
    captionEl.textContent = '';
    if (changed) {
      idx = Math.min(idx, images.length - 1);
      showImage(idx);
    }
  } catch (err) {
    captionEl.textContent = 'Could not load photos right now.';
    console.error(err);
  }
}

function showImage(i) {
  if (images.length === 0) return;
  photoEl.src = `images/${images[i]}`;
  photoEl.alt = images[i];
}

function next() {
  if (images.length === 0) return;
  idx = (idx + 1) % images.length;
  showImage(idx);
}

function startSlideshow() {
  if (slideTimer) clearInterval(slideTimer);
  slideTimer = setInterval(next, SLIDE_INTERVAL_MS);
}

async function init() {
  await loadImages();
  showImage(idx);
  startSlideshow();
  setInterval(loadImages, REFRESH_LIST_MS);
}

photoEl.addEventListener('click', next);
window.addEventListener('load', init);
