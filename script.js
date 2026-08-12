const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("search");
const lightbox = document.querySelector(".lightbox");
const lightboxImg = document.querySelector(".lightbox-img");
const closeBtn = document.querySelector(".close");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const spinner = document.getElementById("spinner");
const backToTopBtn = document.getElementById("backToTop");
const downloadBtn = document.querySelector(".download-btn");
const likeLightboxBtn = document.querySelector(".like-lightbox-btn");
const saveLightboxBtn = document.querySelector(".save-lightbox-btn");

// ========================================
// AUTHENTICATION DOM ELEMENTS
// ========================================
const authBtn = document.getElementById("authBtn"); // Login button in header
const profileBtn = document.getElementById("profileBtn"); // Profile button (shows when logged in)
const authModal = document.getElementById("authModal"); // Login/Signup modal popup
const authModalClose = document.getElementById("authModalClose"); // Close button on auth modal
const profileModal = document.getElementById("profileModal"); // User profile modal
const profileModalClose = document.getElementById("profileModalClose"); // Close button on profile modal
const loginForm = document.getElementById("loginForm"); // Login form inside auth modal
const signupForm = document.getElementById("signupForm"); // Signup form inside auth modal
const showSignup = document.getElementById("showSignup"); // Link to switch to signup
const showLogin = document.getElementById("showLogin"); // Link to switch to login
const loginSubmit = document.getElementById("loginSubmit"); // Submit button for login
const signupSubmit = document.getElementById("signupSubmit"); // Submit button for signup
const logoutBtn = document.getElementById("logoutBtn"); // Logout button in profile modal
const likedBtn = document.getElementById("likedBtn"); // Liked images button in header
const savedBtn = document.getElementById("savedBtn"); // Saved images button in header
const likedImagesTab = document.getElementById("likedImagesTab"); // Tab for liked images in profile
const savedImagesTab = document.getElementById("savedImagesTab"); // Tab for saved images in profile

// ========================================
// APPLICATION STATE VARIABLES
// ========================================
let page = 1; // Current page for infinite scroll pagination
let loading = false; // Flag to prevent multiple simultaneous loads
let currentImageIndex = 0; // Index of image currently shown in lightbox
let allImages = []; // Array storing all loaded image data
let currentUser = null; // Logged in user data (null if not logged in)
let likedImages = []; // Array of liked image URLs
let savedImages = []; // Array of saved image URLs

// ========================================
// DATA PERSISTENCE - LOCALSTORAGE FUNCTIONS
// ========================================
// Load user data from browser localStorage
function loadFromLocalStorage() {
  currentUser = JSON.parse(localStorage.getItem("currentUser")); // Get logged in user
  likedImages = JSON.parse(localStorage.getItem("likedImages")) || []; // Get liked images or empty array
  savedImages = JSON.parse(localStorage.getItem("savedImages")) || []; // Get saved images or empty array
  updateUIForAuth(); // Update header based on login status
}

// Save user data to browser localStorage for persistence across sessions
function saveToLocalStorage() {
  localStorage.setItem("currentUser", JSON.stringify(currentUser)); // Save logged in user
  localStorage.setItem("likedImages", JSON.stringify(likedImages)); // Save liked images list
  localStorage.setItem("savedImages", JSON.stringify(savedImages)); // Save saved images list
  updateLikedSavedCounts(); // Update badge numbers
}

// ========================================
// UI UPDATE FUNCTIONS
// ========================================
// Update UI based on authentication state (show/hide auth vs profile buttons)
function updateUIForAuth() {
  if (currentUser) {
    // User is logged in - show profile button, hide login button
    authBtn.style.display = "none";
    profileBtn.style.display = "flex";
  } else {
    // User is not logged in - show login button, hide profile button
    authBtn.style.display = "flex";
    profileBtn.style.display = "none";
  }
  updateLikedSavedCounts(); // Update badge counts
}

// Update the badge numbers showing count of liked and saved images
function updateLikedSavedCounts() {
  document.getElementById("likedCount").textContent = likedImages.length; // Show liked count
  document.getElementById("savedCount").textContent = savedImages.length; // Show saved count
}

// ========================================
// LIKE/SAVE MANAGEMENT FUNCTIONS
// ========================================
// Toggle like status for an image - adds or removes from liked array
function toggleLike(imageSrc) {
  const index = likedImages.indexOf(imageSrc); // Find image in liked array
  if (index > -1) {
    // Image already liked - remove it
    likedImages.splice(index, 1);
    return false; // Returns false = was removed
  } else {
    // Image not liked - add it
    likedImages.push(imageSrc);
    return true; // Returns true = was added
  }
}

// Toggle save status for an image - adds or removes from saved array
function toggleSave(imageSrc) {
  const index = savedImages.indexOf(imageSrc); // Find image in saved array
  if (index > -1) {
    // Image already saved - remove it
    savedImages.splice(index, 1);
    return false; // Returns false = was removed
  } else {
    // Image not saved - add it
    savedImages.push(imageSrc);
    return true; // Returns true = was added
  }
}

// Check if a specific image is in the liked array
function isImageLiked(imageSrc) {
  return likedImages.includes(imageSrc);
}

// Check if a specific image is in the saved array
function isImageSaved(imageSrc) {
  return savedImages.includes(imageSrc);
}

// Image source

// Image source
const getImage = (i) => {
  const height = 300 + (i % 10) * 40;
  return `https://picsum.photos/seed/${i}/500/${height}`;
};

// Skeleton loader
function loadSkeletons(count = 8) {
  for (let i = 0; i < count; i++) {
    const skel = document.createElement("div");
    skel.className = "card skeleton";
    gallery.appendChild(skel);
  }
}

// Load images
function loadImages() {
  if (loading) return;
  loading = true;
  spinner.classList.add("show");

  loadSkeletons();

  setTimeout(() => {
    document.querySelectorAll(".skeleton").forEach(s => s.remove());

    const startIndex = (page - 1) * 12;
    
    for (let i = 0; i < 12; i++) {
      const index = startIndex + i;
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.index = allImages.length;

      const imgSrc = getImage(index);
      
      card.innerHTML = `
        <img src="${imgSrc}" alt="Image ${index}" loading="lazy">
        <div class="overlay">
          <div class="btn like-overlay">❤️</div>
        </div>
      `;

      // Store image reference
      allImages.push({
        src: imgSrc,
        index: index
      });

      // Click to open lightbox
      card.onclick = (e) => {
        if (!e.target.classList.contains('btn')) {
          openLightbox(parseInt(card.dataset.index));
        }
      };

      // Like button in overlay
      card.querySelector('.like-overlay').onclick = (e) => {
        e.stopPropagation();
        const btn = e.target.closest('.btn');
        const imgSrc = allImages[parseInt(card.dataset.index)].src;
        
        // Toggle liked state
        if (btn.classList.contains('liked')) {
          // Remove from liked
          btn.classList.remove('liked');
          btn.innerHTML = '🤍';
          btn.style.transform = 'scale(1)';
          const index = likedImages.indexOf(imgSrc);
          if (index > -1) {
            likedImages.splice(index, 1);
          }
        } else {
          // Add to liked
          btn.classList.add('liked');
          btn.innerHTML = '❤️';
          btn.style.transform = 'scale(1.3)';
          btn.style.animation = 'heartBeat 0.6s ease';
          if (!likedImages.includes(imgSrc)) {
            likedImages.push(imgSrc);
          }
        }
        
        saveToLocalStorage();
        updateLikedSavedCounts();
      };

      gallery.appendChild(card);
    }

    loading = false;
    spinner.classList.remove("show");
    page++;
  }, 800);
}

// Open lightbox
function openLightbox(index) {
  currentImageIndex = index;
  lightboxImg.src = allImages[index].src;
  lightboxImg.alt = `Image ${index + 1}`;
  lightbox.classList.add("show");
  document.body.style.overflow = "hidden";
  
  // Update navigation buttons
  updateNavButtons();
  // Update like/save buttons
  updateLightboxButtons();
}

// Close lightbox
function closeLightbox() {
  lightbox.classList.remove("show");
  document.body.style.overflow = "auto";
}

// Navigate to next image
function nextImage() {
  if (currentImageIndex < allImages.length - 1) {
    currentImageIndex++;
    lightboxImg.src = allImages[currentImageIndex].src;
    updateNavButtons();
    updateLightboxButtons();
  }
}

// Navigate to previous image
function prevImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    lightboxImg.src = allImages[currentImageIndex].src;
    updateNavButtons();
    updateLightboxButtons();
  }
}

// Update navigation button states
function updateNavButtons() {
  prevBtn.style.opacity = currentImageIndex > 0 ? "1" : "0.5";
  nextBtn.style.opacity = currentImageIndex < allImages.length - 1 ? "1" : "0.5";
  prevBtn.style.cursor = currentImageIndex > 0 ? "pointer" : "not-allowed";
  nextBtn.style.cursor = currentImageIndex < allImages.length - 1 ? "pointer" : "not-allowed";
}

// Download image
function downloadImage() {
  const link = document.createElement('a');
  link.href = lightboxImg.src;
  link.download = `image-${currentImageIndex + 1}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Toggle like
function toggleLike(element) {
  element.classList.toggle('liked');
  element.style.transform = element.classList.contains('liked') 
    ? 'scale(1.3)' 
    : 'scale(1)';
  element.style.filter = element.classList.contains('liked')
    ? 'hue-rotate(320deg)'
    : 'none';
}

// Infinite Scroll
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadImages();
  }

  // Show/hide back to top button
  if (window.scrollY > 300) {
    backToTopBtn.classList.add("show");
  } else {
    backToTopBtn.classList.remove("show");
  }
});

// Search functionality with debounce
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  
  gallery.style.opacity = "0.5";
  gallery.style.transition = "opacity 0.3s ease";
  
  searchTimeout = setTimeout(() => {
    gallery.style.opacity = "1";
  }, 300);
});

// Lightbox controls
closeBtn.onclick = closeLightbox;
nextBtn.onclick = nextImage;
prevBtn.onclick = prevImage;
downloadBtn.onclick = downloadImage;

likeLightboxBtn.onclick = () => {
  if (!currentUser) {
    alert("Please login to like images");
    return;
  }
  const imgSrc = lightboxImg.src;
  const liked = toggleLike(imgSrc);
  const icon = likeLightboxBtn.querySelector('i');
  if (liked) {
    icon.classList.remove('far');
    icon.classList.add('fas');
    likeLightboxBtn.style.color = '#ff4757';
  } else {
    icon.classList.remove('fas');
    icon.classList.add('far');
    likeLightboxBtn.style.color = 'white';
  }
  saveToLocalStorage();
};

saveLightboxBtn.onclick = () => {
  if (!currentUser) {
    alert("Please login to save images");
    return;
  }
  const imgSrc = lightboxImg.src;
  const saved = toggleSave(imgSrc);
  const icon = saveLightboxBtn.querySelector('i');
  if (saved) {
    icon.classList.remove('far');
    icon.classList.add('fas');
    saveLightboxBtn.style.color = '#ffd700';
  } else {
    icon.classList.remove('fas');
    icon.classList.add('far');
    saveLightboxBtn.style.color = 'white';
  }
  saveToLocalStorage();
};

// Update like/save buttons in lightbox
function updateLightboxButtons() {
  const imgSrc = lightboxImg.src;
  
  // Update like button
  const likeIcon = likeLightboxBtn.querySelector('i');
  if (isImageLiked(imgSrc)) {
    likeIcon.classList.remove('far');
    likeIcon.classList.add('fas');
    likeLightboxBtn.style.color = '#ff4757';
  } else {
    likeIcon.classList.remove('fas');
    likeIcon.classList.add('far');
    likeLightboxBtn.style.color = 'white';
  }
  
  // Update save button
  const saveIcon = saveLightboxBtn.querySelector('i');
  if (isImageSaved(imgSrc)) {
    saveIcon.classList.remove('far');
    saveIcon.classList.add('fas');
    saveLightboxBtn.style.color = '#ffd700';
  } else {
    saveIcon.classList.remove('fas');
    saveIcon.classList.add('far');
    saveLightboxBtn.style.color = 'white';
  }
}

// ========================================
// AUTHENTICATION CONTROLS
// ========================================

// Open auth modal when auth button clicked
authBtn.onclick = () => {
  authModal.classList.add("show");
  loginForm.style.display = "block";
  signupForm.style.display = "none";
};

// Close auth modal and clear all form fields
authModalClose.onclick = () => {
  authModal.classList.remove("show");
  // Clear form fields when closing
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("signupName").value = "";
  document.getElementById("signupEmail").value = "";
  document.getElementById("signupPassword").value = "";
  // Reset to login form
  loginForm.style.display = "block";
  signupForm.style.display = "none";
};

// Open profile modal when profile button clicked
profileBtn.onclick = () => {
  document.getElementById("userNameDisplay").textContent = `Name: ${currentUser.name}`;
  document.getElementById("userEmailDisplay").textContent = `Email: ${currentUser.email}`;
  displayLikedImages();
  profileModal.classList.add("show");
};

// Close profile modal
profileModalClose.onclick = () => {
  profileModal.classList.remove("show");
};

// Switch to signup form
showSignup.onclick = (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  signupForm.style.display = "block";
};

// Switch to login form
showLogin.onclick = (e) => {
  e.preventDefault();
  loginForm.style.display = "block";
  signupForm.style.display = "none";
};

// ========================================
// LOGIN FUNCTIONALITY
// ========================================
loginSubmit.onclick = () => {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  
  // Validate email and password are filled
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }
  
  // Validate email format with strict regex pattern
  // Requirements:
  // - Username: letters, numbers, dots, underscores, hyphens (min 1 char)
  // - @ symbol required
  // - Domain: letters, numbers, dots, hyphens (min 3 chars required)
  // - Dot required before TLD
  // - TLD: letters only (min 2 chars)
  const emailRegex = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]{3,}([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.\nExample: user@example.com\n\nEmail must have:\n- Valid username part\n- @ symbol\n- Domain name (at least 3 characters)\n- Proper extension (.com, .org, etc)");
    return;
  }
  
  // Validate password length
  if (password.length < 4) {
    alert("Password must be at least 4 characters long");
    return;
  }
  
  // Create user object with email and username (part before @)
  currentUser = { email, name: email.split("@")[0] };
  saveToLocalStorage();
  updateUIForAuth();
  authModal.classList.remove("show");
  
  // Clear form
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
  
  alert(`Welcome back, ${currentUser.name}!`);
};

// ========================================
// SIGNUP FUNCTIONALITY
// ========================================
signupSubmit.onclick = () => {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  
  // Validate all fields are filled
  if (!name || !email || !password) {
    alert("Please fill in all fields");
    return;
  }
  
  // Validate name - at least 2 characters
  if (name.length < 2) {
    alert("Name must be at least 2 characters long");
    return;
  }
  
  // Validate name - only letters and spaces allowed
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    alert("Name can only contain letters and spaces");
    return;
  }
  
  // Validate email format with strict regex pattern
  // Requirements:
  // - Username: letters, numbers, dots, underscores, hyphens (min 1 char)
  // - @ symbol required
  // - Domain: letters, numbers, dots, hyphens (min 3 chars required)
  // - Dot required before TLD
  // - TLD: letters only (min 2 chars)
  const emailRegex = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]{3,}([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.\nExample: user@example.com\n\nEmail must have:\n- Valid username part\n- @ symbol\n- Domain name (at least 3 characters like 'gmail', 'yahoo', etc)\n- Proper extension (.com, .org, .co, etc)");
    return;
  }
  
  // Validate password length
  if (password.length < 4) {
    alert("Password must be at least 4 characters long");
    return;
  }
  
  // Validate password - must contain at least one number or special character
  const passwordRegex = /^(?=.*[0-9!@#$%^&*])/;
  if (!passwordRegex.test(password)) {
    alert("Password must contain at least one number or special character (!@#$%^&*)");
    return;
  }
  
  // Create user object with name and email
  currentUser = { name, email };
  saveToLocalStorage();
  updateUIForAuth();
  authModal.classList.remove("show");
  
  // Clear form
  document.getElementById("signupName").value = "";
  document.getElementById("signupEmail").value = "";
  document.getElementById("signupPassword").value = "";
  
  // Switch back to login form
  loginForm.style.display = "block";
  signupForm.style.display = "none";
  
  alert(`Welcome, ${name}! Your account has been created.`);
};

// ========================================
// LOGOUT FUNCTIONALITY
// ========================================
logoutBtn.onclick = () => {
  // Ask user to confirm logout
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (confirmLogout) {
    // Clear all user data
    currentUser = null;
    likedImages = [];
    savedImages = [];
    saveToLocalStorage();
    updateUIForAuth();
    profileModal.classList.remove("show");
    alert("You have been logged out successfully");
  }
};

likedImagesTab.onclick = () => {
  likedImagesTab.classList.add("active");
  savedImagesTab.classList.remove("active");
  document.getElementById("likedContent").style.display = "block";
  document.getElementById("savedContent").style.display = "none";
  displayLikedImages();
};

savedImagesTab.onclick = () => {
  savedImagesTab.classList.add("active");
  likedImagesTab.classList.remove("active");
  document.getElementById("savedContent").style.display = "block";
  document.getElementById("likedContent").style.display = "none";
  displaySavedImages();
};

// Display liked images
function displayLikedImages() {
  const likedGallery = document.getElementById("likedGallery");
  likedGallery.innerHTML = "";
  
  if (likedImages.length === 0) {
    likedGallery.innerHTML = '<div class="empty-message">No liked images yet</div>';
    return;
  }
  
  likedImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Liked image ${index + 1}`;
    img.style.cursor = "pointer";
    img.onclick = () => {
      profileModal.classList.remove("show");
      // Find the image in allImages array
      const imageIndex = allImages.findIndex(img => img.src === src);
      if (imageIndex !== -1) {
        openLightbox(imageIndex);
      }
    };
    likedGallery.appendChild(img);
  });
}

// Display saved images
function displaySavedImages() {
  const savedGallery = document.getElementById("savedGallery");
  savedGallery.innerHTML = "";
  
  if (savedImages.length === 0) {
    savedGallery.innerHTML = '<div class="empty-message">No saved images yet</div>';
    return;
  }
  
  savedImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Saved image ${index + 1}`;
    img.style.cursor = "pointer";
    img.onclick = () => {
      profileModal.classList.remove("show");
      // Find the image in allImages array
      const imageIndex = allImages.findIndex(img => img.src === src);
      if (imageIndex !== -1) {
        openLightbox(imageIndex);
      }
    };
    savedGallery.appendChild(img);
  });
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("show")) return;
  
  switch(e.key) {
    case "Escape":
      closeLightbox();
      break;
    case "ArrowRight":
      nextImage();
      break;
    case "ArrowLeft":
      prevImage();
      break;
  }
});

// Close modals on background click
authModal.addEventListener("click", (e) => {
  if (e.target === authModal) {
    authModal.classList.remove("show");
    // Clear form fields when closing
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";
    // Reset to login form
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  }
});

profileModal.addEventListener("click", (e) => {
  if (e.target === profileModal) {
    profileModal.classList.remove("show");
  }
});

// Close lightbox on background click
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

// Back to top
backToTopBtn.onclick = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

// Make header badges clickable
likedBtn.onclick = () => {
  if (!currentUser) {
    alert("Please login to view liked images");
    return;
  }
  showLikedPage();
};

savedBtn.onclick = () => {
  if (!currentUser) {
    alert("Please login to view saved images");
    return;
  }
  showSavedPage();
};

// Show liked images page
function showLikedPage() {
  document.getElementById("gallery").style.display = "none";
  document.getElementById("savedPage").style.display = "none";
  document.getElementById("likedPage").style.display = "block";
  displayLikedPage();
}

// Show saved images page
function showSavedPage() {
  document.getElementById("gallery").style.display = "none";
  document.getElementById("likedPage").style.display = "none";
  document.getElementById("savedPage").style.display = "block";
  displaySavedPage();
}

// Back to gallery
document.getElementById("backFromLiked").onclick = () => {
  document.getElementById("likedPage").style.display = "none";
  document.getElementById("gallery").style.display = "block";
};

document.getElementById("backFromSaved").onclick = () => {
  document.getElementById("savedPage").style.display = "none";
  document.getElementById("gallery").style.display = "block";
};

// Display liked images on page
function displayLikedPage() {
  const likedPageGallery = document.getElementById("likedPageGallery");
  likedPageGallery.innerHTML = "";
  
  if (likedImages.length === 0) {
    likedPageGallery.innerHTML = `
      <div class="empty-collection">
        <i class="fas fa-heart-broken"></i>
        <h3>No liked images yet</h3>
        <p>Start liking images to see them here</p>
      </div>
    `;
    return;
  }
  
  likedImages.forEach((src, index) => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    
    card.innerHTML = `
      <img src="${src}" alt="Liked image ${index + 1}">
      <button class="remove-btn" title="Remove from liked">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Click image to open lightbox
    card.querySelector("img").onclick = () => {
      const imageIndex = allImages.findIndex(img => img.src === src);
      if (imageIndex !== -1) {
        openLightbox(imageIndex);
      }
    };
    
    // Remove from liked
    card.querySelector(".remove-btn").onclick = (e) => {
      e.stopPropagation();
      const imgIndex = likedImages.indexOf(src);
      if (imgIndex > -1) {
        likedImages.splice(imgIndex, 1);
        saveToLocalStorage();
        displayLikedPage();
      }
    };
    
    likedPageGallery.appendChild(card);
  });
}

// Display saved images on page
function displaySavedPage() {
  const savedPageGallery = document.getElementById("savedPageGallery");
  savedPageGallery.innerHTML = "";
  
  if (savedImages.length === 0) {
    savedPageGallery.innerHTML = `
      <div class="empty-collection">
        <i class="fas fa-bookmark"></i>
        <h3>No saved images yet</h3>
        <p>Start saving images to see them here</p>
      </div>
    `;
    return;
  }
  
  savedImages.forEach((src, index) => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    
    card.innerHTML = `
      <img src="${src}" alt="Saved image ${index + 1}">
      <button class="remove-btn" title="Remove from saved">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Click image to open lightbox
    card.querySelector("img").onclick = () => {
      const imageIndex = allImages.findIndex(img => img.src === src);
      if (imageIndex !== -1) {
        openLightbox(imageIndex);
      }
    };
    
    // Remove from saved
    card.querySelector(".remove-btn").onclick = (e) => {
      e.stopPropagation();
      const imgIndex = savedImages.indexOf(src);
      if (imgIndex > -1) {
        savedImages.splice(imgIndex, 1);
        saveToLocalStorage();
        displaySavedPage();
      }
    };
    
    savedPageGallery.appendChild(card);
  });
}

// Initial load
loadFromLocalStorage();
loadImages();
