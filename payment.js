'use strict';

// DOM Elements
const paymentProducts = document.getElementById('paymentProducts');
const paymentTotal = document.getElementById('paymentTotal');
const paymentAmount = document.getElementById('paymentAmount');
const paymentForm = document.getElementById('paymentForm');
const submitPayment = document.getElementById('submitPayment');
const paymentModal = document.getElementById('paymentModal');
const downloadBtn = document.getElementById('downloadBtn');
const backToStore = document.getElementById('backToStore');
const methodTabs = document.querySelectorAll('.method-tab');
const methodContents = document.querySelectorAll('.method-content');
const copyUpiId = document.getElementById('copyUpiId');
const upiId = document.getElementById('upiId');
const applyCoupon = document.getElementById('applyCoupon');
const couponCode = document.getElementById('couponCode');
const orderIdNumber = document.getElementById('orderIdNumber');
const orderDateValue = document.getElementById('orderDateValue');
const orderAmountValue = document.getElementById('orderAmountValue');
const faqQuestions = document.querySelectorAll('.faq-question');
const helpBtn = document.getElementById('helpBtn');
const upiQrCode = document.getElementById('upiQrCode');
const selectedPlanName = document.getElementById('selectedPlanName');

// Initialize cart from URL parameters
let cart = [];
let totalAmount = 0;
let discountApplied = false;

// Subscription plan data
const subscriptionPlans = {
  'Free': { price: 0, image: './images/free-plan.jpg', pdf: './resources/Free_Plan_Details.pdf' },
  'Standard': { price: 499, image: './images/standard-plan.jpg', pdf: './resources/Standard_Plan_Details.pdf' },
  'Premium': { price: 1199, image: './images/premium-plan.jpg', pdf: './resources/Premium_Plan_Details.pdf' }
};

// Get plan from URL parameters
function getPlanFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('plan');
}

// Parse URL parameters
function getCartFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const cartParam = urlParams.get('cart');
  const productParam = urlParams.get('product');
  const planParam = getPlanFromURL();

  if (cartParam) {
    try {
      cart = JSON.parse(decodeURIComponent(cartParam));
    } catch (error) {
      console.error('Error parsing cart parameter:', error);
      cart = [];
    }
  } else if (productParam) {
    try {
      const product = JSON.parse(decodeURIComponent(productParam));
      cart = [product];
    } catch (error) {
      console.error('Error parsing product parameter:', error);
      cart = [];
    }
  } else if (planParam && subscriptionPlans[planParam]) {
    // Add subscription plan to cart
    const plan = subscriptionPlans[planParam];
    cart = [{
      title: `${planParam} Plan Subscription`,
      price: plan.price,
      image: plan.image,
      pdf: plan.pdf
    }];
    
    // Update UI to show selected plan
    if (selectedPlanName) {
      selectedPlanName.textContent = planParam;
    }
  }
}

// Generate dynamic UPI QR code
function generateUPIQr(amount) {
  const upiIdValue = "stoicstore@upi"; // Replace with your actual UPI ID
  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(`upi://pay?pa=${upiIdValue}&pn=STOIC%20STORE&am=${amount.toFixed(2)}&cu=INR`)}`;
  upiQrCode.src = qrUrl;
  upiId.textContent = upiIdValue;
}

// Calculate total with optional discount
function calculateTotal() {
  totalAmount = cart.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);

  if (discountApplied) {
    totalAmount = totalAmount * 0.9; // Apply 10% discount
  }

  paymentTotal.textContent = `₹${totalAmount.toFixed(2)}`;
  paymentAmount.textContent = `₹${totalAmount.toFixed(2)}`;
  generateUPIQr(totalAmount);
}

// Render cart items with responsive height
function renderCartItems() {
  paymentProducts.innerHTML = '';
  
  if (cart.length === 0) {
    paymentProducts.innerHTML = '<p class="empty-cart">No items in cart</p>';
    return;
  }
  
  cart.forEach(item => {
    const productElement = document.createElement('div');
    productElement.className = 'payment-product';
    productElement.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="payment-product-info">
        <h3>${item.title}</h3>
        <p>₹${item.price.toFixed(2)}</p>
      </div>
    `;
    paymentProducts.appendChild(productElement);
  });
  
  // Adjust container height based on item count
  const itemCount = cart.length;
  const baseHeight = 100; // Base height in pixels
  const itemHeight = 80; // Height per item in pixels
  const maxHeight = 300; // Maximum height in pixels
  
  const calculatedHeight = Math.min(baseHeight + (itemHeight * itemCount), maxHeight);
  paymentProducts.style.minHeight = `${calculatedHeight}px`;
  
  calculateTotal();
}

// Initialize payment page
function initPaymentPage() {
  // Hide cart icon on payment page
  const cartIcon = document.querySelector('.payment-page .cart-icon');
  if (cartIcon) {
    cartIcon.style.display = 'none';
  }

  getCartFromURL();
  
  // Redirect if Free plan is selected (no payment needed)
  const plan = getPlanFromURL();
  if (plan === 'Free') {
    window.location.href = 'index.html';
    return;
  }
  
  renderCartItems();
  
  // Set current date for order
  const now = new Date();
  orderDateValue.textContent = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Generate random order ID
  orderIdNumber.textContent = Math.floor(100000 + Math.random() * 900000);
}

// Handle payment method tab switching
function setupPaymentMethodTabs() {
  methodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const method = tab.dataset.method;
      
      // Update active tab
      methodTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show corresponding content
      methodContents.forEach(content => {
        content.classList.remove('active');
        if (content.dataset.method === method) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Handle UPI ID copy functionality
function setupUPICopy() {
  copyUpiId.addEventListener('click', () => {
    navigator.clipboard.writeText(upiId.textContent).then(() => {
      const originalText = copyUpiId.innerHTML;
      copyUpiId.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon> Copied';
      
      setTimeout(() => {
        copyUpiId.innerHTML = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy UPI ID:', err);
    });
  });
}

// Handle coupon code application
function setupCouponApplication() {
  applyCoupon.addEventListener('click', () => {
    const code = couponCode.value.trim();
    
    if (!code) {
      return;
    }
    
    // Simple coupon logic - in a real app, validate server-side
    if (code.toUpperCase() === 'STOIC10') {
      discountApplied = true;
      calculateTotal();
      
      // Show discount applied message
      const couponGroup = applyCoupon.parentElement;
      let discountMsg = couponGroup.querySelector('.discount-msg');
      
      if (!discountMsg) {
        discountMsg = document.createElement('div');
        discountMsg.className = 'discount-msg';
        discountMsg.textContent = '10% discount applied!';
        discountMsg.style.color = 'var(--accent)';
        discountMsg.style.marginTop = '10px';
        discountMsg.style.fontSize = 'var(--fs-8)';
        couponGroup.appendChild(discountMsg);
      }
    } else {
      alert('Invalid coupon code');
    }
  });
}

// Handle form submission
function setupFormSubmission() {
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Basic validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const deliveryEmail = document.getElementById('deliveryEmail').value.trim();
    
    if (!name || !email || !phone || !deliveryEmail) {
      alert('Please fill all required fields');
      return;
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Validate phone number (basic Indian format)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert('Please enter a valid 10-digit Indian phone number');
      return;
    }
    
    // Show loading state
    submitPayment.disabled = true;
    submitPayment.innerHTML = '<span id="paymentBtnText">Processing...</span>';
    
    // Simulate payment processing
    setTimeout(processPayment, 1500);
  });
}

// Process payment and show success modal
function processPayment() {
  // Show success modal
  paymentModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Set order details
  orderAmountValue.textContent = `₹${totalAmount.toFixed(2)}`;
  
  // Reset form
  submitPayment.disabled = false;
  submitPayment.innerHTML = '<span id="paymentBtnText">Pay Now</span> <span id="paymentAmount">₹0.00</span>';
  
  // For subscription plans, you might want to add additional logic here
  // to activate the subscription on your backend
}

// Handle product download
function setupDownloadHandler() {
  downloadBtn.addEventListener('click', () => {
    // Download all PDFs in cart
    let downloaded = false;
    
    cart.forEach(item => {
      if (item.pdf) {
        downloaded = true;
        const link = document.createElement('a');
        link.href = item.pdf;
        link.download = item.pdf.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
    
    if (!downloaded) {
      alert('Your download will start now. Check your email for the download link.');
    }
  });
}

// Setup FAQ accordion functionality
function setupFAQAccordion() {
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const isActive = question.classList.contains('active');
      
      // Close all FAQs first
      faqQuestions.forEach(q => {
        q.classList.remove('active');
        q.nextElementSibling.style.maxHeight = null;
      });
      
      // Open clicked one if it wasn't active
      if (!isActive) {
        question.classList.add('active');
        const answer = question.nextElementSibling;
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
}

// Setup "Need Help" button
function setupHelpButton() {
  helpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Will be implemented with chatbot later
    console.log('Chatbot will be implemented here');
  });
}

// Initialize all functionality
function initialize() {
  initPaymentPage();
  setupPaymentMethodTabs();
  setupUPICopy();
  setupCouponApplication();
  setupFormSubmission();
  setupDownloadHandler();
  setupFAQAccordion();
  setupHelpButton();
  
  // Back to store button
  backToStore.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

// Start the application
document.addEventListener('DOMContentLoaded', initialize);