

// ==== Unsplash Config ====
const accessKey = '3uOLK52VqFrMV-ByRP2pbptWL_KHl6TkdbGTgymkhJg'; // Replace this with your real key
const dropdownMenu = document.querySelector('.dropdown-menu');
const menuToggle = document.getElementById('menu-toggle');
let isOpen = false;

menuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  isOpen = !isOpen;
  dropdownMenu.classList.toggle('show');
  menuToggle.innerHTML = isOpen
    ? '<i class="bi bi-x-lg"></i>'
    : '<i class="bi bi-list"></i>';
});

document.addEventListener('click', (e) => {
  if (!dropdownMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    dropdownMenu.classList.remove('show');
    isOpen = false;
    menuToggle.innerHTML = '<i class="bi bi-list"></i>';
  }
});
// Replace with your real key
const loader = document.getElementById("loader");
const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("Email");

let currentPage = 1;
let currentQuery = "phone";
let totalPages = Infinity;
let isLoading = false;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("Email").value = "phone";
  searchImages();

  fetchCategoryImages("phone", "phone-gallery");
  fetchCategoryImages("laptop", "laptop-gallery");
});

function getIconByCategory(category) {
  const cat = category.toLowerCase();
  if (cat.includes("phone")) return "bi-phone";
  if (cat.includes("laptop")) return "bi-laptop";
  if (cat.includes("anime")) return "bi-camera-reels";
  if (cat.includes("nature")) return "bi-tree";
  return "bi-image";
}

function fetchCategoryImages(query, containerId) {
  fetch(`https://api.unsplash.com/search/photos?query=${query}&page=1&per_page=8&client_id=${accessKey}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById(containerId);
      container.innerHTML = "";
      data.results.forEach(photo => {
        const iconClass = getIconByCategory(query);
        const div = document.createElement("div");
        div.className = "gallery-item";
        div.innerHTML = `
          <img src="${photo.urls.small}" alt="${photo.alt_description || query}">
          <p>${photo.alt_description || query}</p>
          <span class="category"><i class="bi ${iconClass}"></i></span>
          <a class="download-btn" data-url="${photo.urls.full}" data-name="${photo.alt_description || 'wallpaper'}"><i class="bi bi-cloud-download-fill"></i></a>
        `;
        container.appendChild(div);
      });
    });
}

function loadImages(query, page = 1, append = false) {
  if (isLoading || page > totalPages) return;
  isLoading = true;
  loader.style.display = "block";

  fetch(`https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=12&client_id=${accessKey}`)
    .then(res => res.json())
    .then(data => {
      totalPages = data.total_pages;
      if (!append) gallery.innerHTML = "";

      data.results.forEach(photo => {
        const iconClass = getIconByCategory(query);
        const div = document.createElement("div");
        div.className = "gallery-item";
        div.innerHTML = `
          <img src="${photo.urls.small}" alt="${photo.alt_description || query}">
          <p>${photo.alt_description || query}</p>
          <span class="category"><i class="bi ${iconClass}"></i></span>
          <a class="download-btn" data-url="${photo.urls.full}" data-name="${photo.alt_description || 'wallpaper'}"><i class="bi bi-cloud-download-fill"></i></a>
        `;
        gallery.appendChild(div);
      });

      isLoading = false;
      loader.style.display = "none";
    })
    .catch(err => {
      console.error("Error loading images:", err);
      if (!append) gallery.innerHTML = "<p>Error loading images.</p>";
      isLoading = false;
      loader.style.display = "none";
    });
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const handleScroll = debounce(() => {
  const scrollPos = window.innerHeight + window.scrollY;
  const nearBottom = document.body.offsetHeight - 150;

  if (scrollPos >= nearBottom && !isLoading && currentPage < totalPages) {
    currentPage++;
    loadImages(currentQuery, currentPage, true);
  }
}, 200);

window.addEventListener("scroll", handleScroll);

document.getElementById("search-btn").addEventListener("click", () => {
  searchImages();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchImages();
  }
});

function searchImages() {
  const query = searchInput.value.trim();
  if (query) {
    currentQuery = query;
    currentPage = 1;
    loadImages(query, currentPage, false);
  }
}

// Handle downloads (for each image)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".download-btn");
  if (btn) {
    const url = btn.getAttribute("data-url");
    const name = btn.getAttribute("data-name") || "wallpaper";

    if (url) {
      downloadImage(url, name);
    }
  }
});

function downloadImage(url, name) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${name.replace(/\s+/g, '_').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    })
    .catch(() => {
      alert("Failed to download image.");
    });
}



