'use strict';

/* ==================== UTILITY FUNCTIONS ==================== */
const addEventOnElements = (elements, eventType, callback) => {
  if (!elements) return;
  elements.forEach(element => {
    if (element) element.addEventListener(eventType, callback);
  });
};

const toggleClass = (element, className, condition) => {
  if (element) element.classList.toggle(className, condition);
};

/* ==================== FIREBASE INITIALIZATION ==================== */
const firebaseConfig = {
  apiKey: "AIzaSyBk0t-hj6Mh9-uZBVD7sul265VdCHJx44Y",
  authDomain: "user-data-835b4.firebaseapp.com",
  projectId: "user-data-835b4",
  storageBucket: "user-data-835b4.appspot.com",
  messagingSenderId: "1059286337115",
  appId: "1:1059286337115:web:97200ded630b5abc27a17e"
};

// Initialize Firebase
if (firebase && firebase.initializeApp) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase?.auth();

/* ==================== PRELOADER ==================== */
const preloader = document.querySelector("[data-preloader]");
if (preloader) {
  window.addEventListener("DOMContentLoaded", () => {
    preloader.classList.add("loaded");
    document.body.classList.add("loaded");
  });
}

/* ==================== NAVBAR TOGGLE ==================== */
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
const navbar = document.querySelector("[data-navbar]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = () => {
  if (navbar) navbar.classList.toggle("active");
  if (navToggleBtn) navToggleBtn.classList.toggle("active");
  if (overlay) overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
};

addEventOnElements(navTogglers, "click", toggleNavbar);

/* ==================== HEADER SCROLL EFFECT ==================== */
const header = document.querySelector("[data-header]");
if (header) {
  window.addEventListener("scroll", () => {
    toggleClass(header, "active", window.scrollY >= 100);
  });
}

/* ==================== SLIDERS ==================== */
const initSlider = (slider) => {
  if (!slider) return;

  const container = slider.querySelector("[data-slider-container]");
  const prevBtn = slider.querySelector("[data-slider-prev]");
  const nextBtn = slider.querySelector("[data-slider-next]");
  
  if (!container || !prevBtn || !nextBtn) return;

  let visibleItems = Number(getComputedStyle(slider).getPropertyValue("--slider-items")) || 1;
  let totalItems = container.childElementCount - visibleItems;
  let currentPos = 0;

  const moveSlider = () => {
    if (container.children[currentPos]) {
      container.style.transform = `translateX(-${container.children[currentPos].offsetLeft}px)`;
    }
  };

  const slideNext = () => {
    currentPos = currentPos >= totalItems ? 0 : currentPos + 1;
    moveSlider();
  };

  const slidePrev = () => {
    currentPos = currentPos <= 0 ? totalItems : currentPos - 1;
    moveSlider();
  };

  nextBtn.addEventListener("click", slideNext);
  prevBtn.addEventListener("click", slidePrev);

  slider.addEventListener("wheel", (e) => {
    if (e.shiftKey) e.deltaY > 0 ? slideNext() : slidePrev();
  });

  window.addEventListener("resize", () => {
    visibleItems = Number(getComputedStyle(slider).getPropertyValue("--slider-items")) || 1;
    totalItems = container.childElementCount - visibleItems;
    moveSlider();
  });

  if (totalItems <= 0) {
    if (nextBtn) nextBtn.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'none';
  }
};

document.querySelectorAll("[data-slider]").forEach(initSlider);

/* ==================== SUBSCRIPTION PLANS DATA ==================== */
const planPrices = {
  'Free': { 
    monthly: { price: '₹0', desc: 'Free forever' },
    yearly: { price: '₹0', desc: 'Free forever' }
  },
  'Standard': { 
    monthly: { price: '₹499', desc: 'Billed monthly' },
    yearly: { price: '₹4,999', desc: 'Save 17% (₹5,988)' }
  },
  'Premium': { 
    monthly: { price: '₹1,199', desc: 'Billed monthly' },
    yearly: { price: '₹11,999', desc: 'Save 16% (₹14,388)' }
  }
};

/* ==================== AUTHENTICATION SYSTEM ==================== */
const authModal = document.getElementById('authModal');
const closeAuth = document.getElementById('closeAuth');
const showSignUp = document.getElementById('showSignUp');
const showSignIn = document.getElementById('showSignIn');
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');
const signInMessage = document.getElementById('signInMessage');
const signUpMessage = document.getElementById('signUpMessage');

// Toggle auth modal
const toggleAuthModal = (show) => {
  if (!authModal) return;
  
  if (show) {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

if (closeAuth) {
  closeAuth.addEventListener('click', () => toggleAuthModal(false));
}

if (showSignUp && showSignIn && signInForm && signUpForm) {
  // Toggle between sign in and sign up
  showSignUp.addEventListener('click', (e) => {
    e.preventDefault();
    signInForm.style.display = 'none';
    signUpForm.style.display = 'block';
    if (signInMessage) {
      signInMessage.textContent = '';
      signInMessage.className = 'auth-message';
    }
  });

  showSignIn.addEventListener('click', (e) => {
    e.preventDefault();
    signUpForm.style.display = 'none';
    signInForm.style.display = 'block';
    if (signUpMessage) {
      signUpMessage.textContent = '';
      signUpMessage.className = 'auth-message';
    }
  });
}

// Handle post-login redirect
const handlePostLoginRedirect = () => {
  const attemptedPlan = localStorage.getItem('attemptedPlan');
  if (attemptedPlan) {
    showPaymentDashboard(attemptedPlan);
    localStorage.removeItem('attemptedPlan');
  }
};

// Firebase Sign Up
const signUpFormEl = document.getElementById('signUp');
if (signUpFormEl && auth) {
  signUpFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const confirm = document.getElementById('signupConfirm')?.value;
    const name = document.getElementById('signupName')?.value;
    
    if (!email || !password || !confirm || !name) return;
    
    // Validation
    if (password !== confirm) {
      if (signUpMessage) {
        signUpMessage.textContent = "Passwords don't match!";
        signUpMessage.className = 'auth-message error';
      }
      return;
    }
    
    if (password.length < 6) {
      if (signUpMessage) {
        signUpMessage.textContent = "Password should be at least 6 characters";
        signUpMessage.className = 'auth-message error';
      }
      return;
    }
    
    // Create user with Firebase
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return user.updateProfile({ displayName: name });
      })
      .then(() => {
        if (signUpMessage) {
          signUpMessage.textContent = "Account created! Please check your email to verify your account.";
          signUpMessage.className = 'auth-message success';
        }
        return auth.currentUser.sendEmailVerification();
      })
      .then(() => {
        setTimeout(() => {
          toggleAuthModal(false);
          showPdfModal();
          handlePostLoginRedirect();
        }, 1500);
      })
      .catch((error) => {
        if (signUpMessage) {
          signUpMessage.textContent = error.message;
          signUpMessage.className = 'auth-message error';
        }
      });
  });
}

// Firebase Sign In
const signInFormEl = document.getElementById('signIn');
if (signInFormEl && auth) {
  signInFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) return;
    
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        
        if (!user.emailVerified) {
          if (signInMessage) {
            signInMessage.textContent = "Please verify your email first. Check your inbox.";
            signInMessage.className = 'auth-message error';
          }
          auth.signOut();
          return;
        }
        
        if (signInMessage) {
          signInMessage.textContent = "Login successful!";
          signInMessage.className = 'auth-message success';
        }
        
        setTimeout(() => {
          toggleAuthModal(false);
          handlePostLoginRedirect();
        }, 1500);
      })
      .catch((error) => {
        if (signInMessage) {
          signInMessage.textContent = error.message;
          signInMessage.className = 'auth-message error';
        }
      });
  });
}

// Password reset
const forgotPasswordLink = document.getElementById('forgotPassword');
if (forgotPasswordLink && auth) {
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value;
    
    if (!email) {
      if (signInMessage) {
        signInMessage.textContent = "Please enter your email first";
        signInMessage.className = 'auth-message error';
      }
      return;
    }
    
    auth.sendPasswordResetEmail(email)
      .then(() => {
        if (signInMessage) {
          signInMessage.textContent = "Password reset email sent! Check your inbox.";
          signInMessage.className = 'auth-message success';
        }
      })
      .catch((error) => {
        if (signInMessage) {
          signInMessage.textContent = error.message;
          signInMessage.className = 'auth-message error';
        }
      });
  });
}

/* ==================== USER DASHBOARD ==================== */
const userMenu = document.getElementById('userMenu');
const userAvatar = document.getElementById('userAvatar');
const avatarInitials = document.getElementById('avatarInitials');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logout');
const editProfileBtn = document.getElementById('editProfile');
const profileModal = document.getElementById('profileModal');
const closeProfile = document.getElementById('closeProfile');
const profileForm = document.getElementById('profileForm');

// Toggle dropdown menu
if (userAvatar && dropdownMenu) {
  userAvatar.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
  });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (userMenu && !userMenu.contains(e.target)) {
    if (dropdownMenu) dropdownMenu.style.display = 'none';
  }
});

// Logout function
if (logoutBtn && auth) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut().then(() => {
      window.location.reload();
    }).catch((error) => {
      console.error("Logout error:", error);
    });
  });
}

// Edit profile function
if (editProfileBtn && profileModal) {
  editProfileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (dropdownMenu) dropdownMenu.style.display = 'none';
    toggleProfileModal(true);
    
    // Fill form with current user data
    const user = auth?.currentUser;
    if (user) {
      const profileNameInput = document.getElementById('profileName');
      const profileEmailInput = document.getElementById('profileEmail');
      if (profileNameInput) profileNameInput.value = user.displayName || '';
      if (profileEmailInput) profileEmailInput.value = user.email || '';
    }
  });
}

// Toggle profile modal
const toggleProfileModal = (show) => {
  if (!profileModal) return;
  
  if (show) {
    profileModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    profileModal.style.display = 'none';
    document.body.style.overflow = '';
    const profileMessage = document.getElementById('profileMessage');
    if (profileMessage) profileMessage.textContent = '';
  }
};

// Update profile
if (profileForm && auth) {
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('profileName')?.value;
    const password = document.getElementById('profilePassword')?.value;
    const confirm = document.getElementById('profileConfirm')?.value;
    const profileMessage = document.getElementById('profileMessage');
    
    // Validation
    if (password && password !== confirm) {
      if (profileMessage) {
        profileMessage.textContent = "Passwords don't match!";
        profileMessage.className = 'auth-message error';
      }
      return;
    }
    
    const user = auth.currentUser;
    if (!user) return;
    
    const promises = [];
    
    // Update display name
    if (name !== user.displayName) {
      promises.push(user.updateProfile({ displayName: name }));
    }
    
    // Update password if provided
    if (password) {
      promises.push(user.updatePassword(password));
    }
    
    Promise.all(promises)
      .then(() => {
        if (profileMessage) {
          profileMessage.textContent = "Profile updated successfully!";
          profileMessage.className = 'auth-message success';
        }
        updateUserUI();
        
        setTimeout(() => {
          toggleProfileModal(false);
        }, 1500);
      })
      .catch((error) => {
        if (profileMessage) {
          profileMessage.textContent = error.message;
          profileMessage.className = 'auth-message error';
        }
      });
  });
}

// Update UI based on auth state
const updateUserUI = () => {
  const user = auth?.currentUser;
  if (userMenu) {
    if (user) {
      userMenu.style.display = 'block';
      const name = user.displayName || user.email;
      if (name && avatarInitials) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        avatarInitials.textContent = initials;
      }
    } else {
      userMenu.style.display = 'none';
    }
  }
};

// Auth state listener
if (auth) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User signed in:", user);
      updateUserUI();
    } else {
      console.log("User signed out");
      updateUserUI();
    }
  });
}

/* ==================== PDF MODAL ==================== */
const pdfModal = document.getElementById('pdfModal');
const closePdf = document.getElementById('closePdf');

const showPdfModal = () => {
  if (pdfModal) {
    pdfModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

const hidePdfModal = () => {
  if (pdfModal) {
    pdfModal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

if (closePdf) {
  closePdf.addEventListener('click', hidePdfModal);
}

if (pdfModal) {
  pdfModal.addEventListener('click', (e) => {
    if (e.target === pdfModal) {
      hidePdfModal();
    }
  });
}

function setupSubscriptionButtons() {
  const accessBtns = document.querySelectorAll('.access-btn');
  
  accessBtns.forEach(btn => {
    btn?.addEventListener('click', function(e) {
      const user = auth?.currentUser;
      const plan = this.dataset.plan;
      
      if (plan !== 'Free' && !user) {
        e.preventDefault();
        toggleAuthModal(true);
        localStorage.setItem('attemptedPlan', plan);
      }
      // For free plans or logged in users, allow default link behavior
    });
  });
}

/* ==================== INITIALIZATION ==================== */
document.addEventListener('DOMContentLoaded', function() {
  
  // Close modal when clicking outside
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        toggleAuthModal(false);
      }
    });
  }
});