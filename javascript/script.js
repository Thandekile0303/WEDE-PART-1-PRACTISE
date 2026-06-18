
(function() {
  'use strict';

  console.log('🌸 Mood & Bites - All Systems Ready');


  let cartItems = [];

  function saveCartToStorage() {
    localStorage.setItem('moodBites_cart', JSON.stringify(cartItems));
  }

  function loadCartFromStorage() {
    const stored = localStorage.getItem('moodBites_cart');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cartItems = parsed;
          return;
        }
      } catch(e) {}
    }
    cartItems = [];
  }


  function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active-page');
    });
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
      targetPage.classList.add('active-page');
    }
    
    if (pageId === 'review') {
      renderReviewCart();
    }
  }

  function collectSelectedItems(pageType = 'menu') {
    const items = [];
    let selector, emoji;
    
    if (pageType === 'promo') {
      selector = '.promo-item';
      emoji = '🧇';
    } else {
      selector = '#menuPage .menu-item';
      emoji = '🍽️';
    }
    
    const itemElements = document.querySelectorAll(selector);
    console.log(`🔍 Found ${itemElements.length} items on ${pageType} page`);
    
    itemElements.forEach(item => {
      const qtySpan = item.querySelector('.quantity');
      if (!qtySpan) {
        console.warn('⚠️ No quantity span found for item:', item);
        return;
      }
      const quantity = parseInt(qtySpan.innerText) || 0;
      if (quantity > 0) {
        const name = item.getAttribute('data-item-name') || item.querySelector('h4')?.innerText || 'Unknown Item';
        const price = parseFloat(item.getAttribute('data-item-price')) || 0;
        items.push({
          id: name.replace(/\s/g, '_') + Date.now() + Math.random(),
          name: name,
          price: price,
          quantity: quantity,
          emoji: emoji
        });
        console.log(`✅ Added ${quantity}x ${name} (${emoji})`);
      }
    });
    
    return items;
  }


  function renderReviewCart() {
    const container = document.getElementById('cartItemsContainer');
    const totalSpan = document.getElementById('totalAmountDisplay');
    
    if (!container) return;
    
    if (!cartItems || cartItems.length === 0) {
      container.innerHTML = `<div class="empty-message">✨ Your cart feels light — add some mood food! ✨</div>`;
      if (totalSpan) totalSpan.innerText = 'R 0';
      return;
    }
    
    let html = '';
    let total = 0;
    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      html += `
        <div class="cart-item" data-id="${item.id}">
          <div class="item-info">
            <div class="item-preview">${item.emoji || '🍽️'}</div>
            <div class="item-details">
              <div class="item-name">${item.name}</div>
              <div class="item-price">R${item.price.toFixed(2)} each</div>
              <div class="item-actions">
                <button class="qty-btn decr" data-id="${item.id}" data-delta="-1">−</button>
                <span class="item-qty">${item.quantity}</span>
                <button class="qty-btn incr" data-id="${item.id}" data-delta="+1">+</button>
                <button class="remove-btn" data-remove="${item.id}">REMOVE</button>
              </div>
            </div>
          </div>
          <div class="item-total">R ${itemTotal.toFixed(2)}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    if (totalSpan) totalSpan.innerText = 'R ' + total.toFixed(2);
    
    document.querySelectorAll('#reviewPage .decr').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        updateQuantity(id, -1);
      });
    });
    document.querySelectorAll('#reviewPage .incr').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        updateQuantity(id, 1);
      });
    });
    document.querySelectorAll('#reviewPage .remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-remove');
        removeItemById(id);
      });
    });
  }

  function updateQuantity(itemId, delta) {
    const index = cartItems.findIndex(i => i.id === itemId);
    if (index !== -1) {
      let newQty = cartItems[index].quantity + delta;
      if (newQty <= 0) {
        cartItems.splice(index, 1);
      } else {
        cartItems[index].quantity = newQty;
      }
      saveCartToStorage();
      renderReviewCart();
    }
  }

  function removeItemById(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    saveCartToStorage();
    renderReviewCart();
  }

  function initMenuQuantityControls() {
    const allItems = document.querySelectorAll('#menuPage .menu-item');
    allItems.forEach(item => {
      const qtySpan = item.querySelector('.quantity');
      const incBtn = item.querySelector('.increase');
      const decBtn = item.querySelector('.decrease');
      if (!incBtn || !decBtn || !qtySpan) return;
      
      const newInc = incBtn.cloneNode(true);
      const newDec = decBtn.cloneNode(true);
      incBtn.parentNode.replaceChild(newInc, incBtn);
      decBtn.parentNode.replaceChild(newDec, decBtn);
      
      newInc.addEventListener('click', (e) => {
        e.stopPropagation();
        let val = parseInt(qtySpan.innerText) || 0;
        val++;
        qtySpan.innerText = val;
      });
      newDec.addEventListener('click', (e) => {
        e.stopPropagation();
        let val = parseInt(qtySpan.innerText) || 0;
        if (val > 0) {
          val--;
          qtySpan.innerText = val;
        }
      });
    });
  }


  function initPromoQuantityControls() {
    const promoItems = document.querySelectorAll('.promo-item');
    console.log(`🔄 Initializing ${promoItems.length} promo items`);
    
    promoItems.forEach((item, index) => {
      const qtySpan = item.querySelector('.quantity');
      const incBtn = item.querySelector('.increase');
      const decBtn = item.querySelector('.decrease');
      
      if (!qtySpan) {
        console.warn(`⚠️ Promo item ${index} has no quantity span`);
        return;
      }
      if (!incBtn || !decBtn) {
        console.warn(`⚠️ Promo item ${index} has no +/- buttons`);
        return;
      }
      
      const newInc = incBtn.cloneNode(true);
      const newDec = decBtn.cloneNode(true);
      incBtn.parentNode.replaceChild(newInc, incBtn);
      decBtn.parentNode.replaceChild(newDec, decBtn);
      
      newInc.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        let val = parseInt(qtySpan.innerText) || 0;
        val++;
        qtySpan.innerText = val;
        console.log(`⬆️ ${item.querySelector('h4')?.innerText || 'Item'}: ${val}`);
      });
      
      newDec.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        let val = parseInt(qtySpan.innerText) || 0;
        if (val > 0) {
          val--;
          qtySpan.innerText = val;
          console.log(`⬇️ ${item.querySelector('h4')?.innerText || 'Item'}: ${val}`);
        }
      });
    });
  }


  const orderAlertBtn = document.getElementById('orderAlertBtn');
  if (orderAlertBtn) {
    orderAlertBtn.addEventListener('click', function() {
      const selectedItems = collectSelectedItems('menu');
      if (selectedItems.length === 0) {
        alert("🛍️ Please select at least one item quantity before adding to cart.");
        return;
      }
      
      loadCartFromStorage();
      
      selectedItems.forEach(newItem => {
        const existing = cartItems.find(i => i.name === newItem.name);
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          cartItems.push(newItem);
        }
      });
      
      saveCartToStorage();
      
      let totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
      alert(`✅ ${totalItems} item(s) added to cart!`);
      
      document.querySelectorAll('#menuPage .quantity').forEach(qtySpan => {
        qtySpan.innerText = '0';
      });
    });
  }


  document.addEventListener('DOMContentLoaded', function() {
    initPromoQuantityControls();
    
    const addToCartBtn = document.querySelector('.add-to-cart');
    if (addToCartBtn) {
      console.log('✅ Found promo add to cart button');
      
      const newBtn = addToCartBtn.cloneNode(true);
      addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
      
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🛒 Promo Add to Cart clicked');
        
        const selectedItems = collectSelectedItems('promo');
        
        if (selectedItems.length === 0) {
          alert('🛍️ Please select at least one promo item quantity before adding to cart.');
          return;
        }
        
        loadCartFromStorage();
        
        selectedItems.forEach(newItem => {
          const existing = cartItems.find(i => i.name === newItem.name);
          if (existing) {
            existing.quantity += newItem.quantity;
          } else {
            cartItems.push(newItem);
          }
        });
        
        saveCartToStorage();
        
        let totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
        alert(`✅ ${totalItems} promo item(s) added to cart!`);
        
        document.querySelectorAll('.promo-item .quantity').forEach(qtySpan => {
          qtySpan.innerText = '0';
        });
        
        showPage('review');
      });
    } else {
      console.warn('⚠️ No .add-to-cart button found on promo page');
    }
  });


  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      loadCartFromStorage();
      if (cartItems.length === 0) {
        alert("🧾 Your cart is empty! Add some delicious items before checkout.");
        return;
      }
      showPage('payment');
    });
  }

  const catBtns = document.querySelectorAll('#menuPage .category-btn');
  const allGroups = document.querySelectorAll('#menuPage .category-group');

  function setActiveCategory(categoryId) {
    allGroups.forEach(group => {
      const groupCat = group.getAttribute('data-category');
      if (groupCat === categoryId) {
        group.classList.add('active-group');
        group.style.display = 'flex';
      } else {
        group.classList.remove('active-group');
        group.style.display = 'none';
      }
    });
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      setActiveCategory(cat);
      catBtns.forEach(b => b.classList.remove('active-cat'));
      btn.classList.add('active-cat');
      performSearch();
    });
  });

  if (allGroups.length > 0) {
    setActiveCategory('coffee');
  }


  const searchInputEl = document.getElementById('searchInput');

  function performSearch() {
    if (!searchInputEl) return;
    const query = searchInputEl.value.trim().toLowerCase();
    const activeGroup = document.querySelector('#menuPage .category-group.active-group');
    if (!activeGroup) return;
    const itemsInsideActive = activeGroup.querySelectorAll('.menu-item');
    itemsInsideActive.forEach(item => {
      const textContent = item.innerText.toLowerCase();
      if (query === '' || textContent.includes(query)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  if (searchInputEl) {
    searchInputEl.addEventListener('input', performSearch);
  }


  const menuBtn = document.getElementById('menuBtn');
  const promoBtn = document.getElementById('promoBtn');
  const orderBtn = document.getElementById('orderBtn');
  const contactBtn = document.getElementById('contactBtn');

  function showFloatingMessage(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '25px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#e8846e';
    toast.style.color = '#FFF6EA';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '60px';
    toast.style.fontFamily = "'Inter', sans-serif";
    toast.style.fontWeight = '600';
    toast.style.fontSize = '0.9rem';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
    toast.style.backdropFilter = 'blur(4px)';
    toast.style.border = '1px solid rgba(255,245,210,0.5)';
    toast.style.letterSpacing = '0.3px';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2200);
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showFloatingMessage('✨ Our delicious MENU is loading soon — stay hungry! ✨');
    });
  }
  if (promoBtn) {
    promoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showFloatingMessage('🎉 PROMOTIONS & weekly specials coming — get ready for tasty deals! 🎉');
    });
  }
  if (orderBtn) {
    orderBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showFloatingMessage('🛵 ORDER ONLINE will be activated shortly — quick bites to your door! 🛵');
    });
  }
  if (contactBtn) {
    contactBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showFloatingMessage('📞 CONTACT US: (555) 123-BITE | hello@moodandbites.com | We\'d love to hear from you! 📞');
    });
  }

  const brandElem = document.querySelector('.brand-heading');
  if (brandElem && brandElem.parentElement) {
    brandElem.style.cursor = 'default';
    brandElem.addEventListener('click', function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      return false;
    });
    brandElem.setAttribute('aria-label', 'Brand heading, not a button');
  }

  const aboutLink = document.querySelector('a.nav-btn.about-active');
  if (aboutLink) {
    aboutLink.style.backgroundColor = 'transparent';
    aboutLink.style.fontWeight = '600';
  }


  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('formStatus');
  const contactSubmit = document.getElementById('submitBtn');
  const charCount = document.getElementById('charCount');
  const messageField = document.getElementById('message');

  if (messageField && charCount) {
    messageField.addEventListener('input', function() {
      const count = this.value.length;
      charCount.textContent = count;
      if (count > 900) {
        charCount.style.color = '#e67e22';
      } else if (count > 950) {
        charCount.style.color = '#e74c3c';
      } else {
        charCount.style.color = '';
      }
    });
  }

  const contactInputs = contactForm ? contactForm.querySelectorAll('input, select, textarea') : [];
  contactInputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateContactField(this);
    });
    input.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        validateContactField(this);
      }
    });
  });

  function validateContactField(field) {
    const errorSpan = document.getElementById(field.id + 'Error');
    if (!errorSpan) return true;

    let error = '';

    if (field.required && !field.value.trim()) {
      error = 'This field is required';
    } else if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
      if (!emailRegex.test(field.value)) {
        error = 'Please enter a valid email address (e.g., name@domain.com)';
      }
    } else if (field.id === 'phone' && field.value.trim()) {
      const phoneRegex = /^[0-9+\-\s]{10,15}$/;
      if (!phoneRegex.test(field.value)) {
        error = 'Enter a valid phone number (10-15 digits, e.g., +63 929 847 0795)';
      }
    } else if (field.id === 'message' && field.value.trim()) {
      if (field.value.length < 10) {
        error = 'Message must be at least 10 characters (currently ' + field.value.length + ')';
      } else if (field.value.length > 1000) {
        error = 'Message cannot exceed 1000 characters';
      }
    } else if (field.id === 'fullname' && field.value.trim()) {
      if (field.value.length < 2) {
        error = 'Name must be at least 2 characters';
      }
    } else if (field.id === 'subject' && field.value === '') {
      error = 'Please select a subject';
    }

    if (error) {
      field.classList.add('error');
      field.classList.remove('success');
      errorSpan.textContent = error;
      errorSpan.style.display = 'block';
      return false;
    } else {
      field.classList.remove('error');
      field.classList.add('success');
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
      return true;
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      let isValid = true;
      contactInputs.forEach(input => {
        if (!validateContactField(input)) isValid = false;
      });

      if (!isValid) {
        setContactStatus('❌ Please fix the errors highlighted above.', true);
        const firstError = contactForm.querySelector('.error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const formData = {
        fullname: document.getElementById('fullname').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        subject: document.getElementById('subject').value,
        subjectLabel: document.getElementById('subject').options[document.getElementById('subject').selectedIndex]?.text || '',
        message: document.getElementById('message').value.trim(),
        newsletter: document.getElementById('newsletter').checked,
        timestamp: new Date().toLocaleString()
      };

      console.log('📬 Form Data:', formData);

      contactSubmit.disabled = true;
      const btnText = document.querySelector('#submitBtn .btn-text');
      const btnLoader = document.querySelector('#submitBtn .btn-loader');
      if (btnText) btnText.style.display = 'none';
      if (btnLoader) btnLoader.style.display = 'inline';

      setTimeout(function() {
        const mailtoLink = `mailto:Mood&Bites@gmail.com?subject=${encodeURIComponent(
          formData.subjectLabel + ' - ' + formData.fullname
        )}&body=${encodeURIComponent(
          'Name: ' + formData.fullname + '\n' +
          'Email: ' + formData.email + '\n' +
          'Phone: ' + (formData.phone || 'Not provided') + '\n' +
          'Subject: ' + formData.subjectLabel + '\n' +
          'Newsletter: ' + (formData.newsletter ? 'Yes' : 'No') + '\n\n' +
          'Message:\n' + formData.message + '\n\n' +
          '---\n' +
          'Sent from: Mood & Bites Contact Form\n' +
          'Date: ' + formData.timestamp
        )}`;

        setContactStatus(
          `✅ Thanks ${formData.fullname.split(' ')[0]}! Your message is ready. ` +
          `Your email client will open to send it. We'll respond within 24h.`,
          false
        );
        
        window.open(mailtoLink, '_blank');

        contactForm.reset();
        if (charCount) charCount.textContent = '0';
        
        contactInputs.forEach(input => {
          input.classList.remove('success');
        });

        contactSubmit.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';

        setTimeout(() => {
          if (contactStatus.innerHTML.includes('Thanks')) {
            contactStatus.innerHTML = '';
            contactStatus.className = 'form-status';
          }
        }, 6000);

      }, 800);
    });
  }

  function setContactStatus(message, isError = false) {
    if (!contactStatus) return;
    contactStatus.innerHTML = message;
    contactStatus.className = 'form-status ' + (isError ? 'error-message' : 'success-message');
    contactStatus.style.display = 'block';
    
    if (!isError) {
      setTimeout(() => {
        if (contactStatus.innerHTML === message) {
          contactStatus.style.display = 'none';
        }
      }, 5000);
    }
  }


  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const content = this.nextElementSibling;
      const icon = this.querySelector('.accordion-icon');
      const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

      document.querySelectorAll('.accordion-content').forEach(c => {
        c.style.maxHeight = '0px';
        c.style.padding = '0 20px';
      });
      document.querySelectorAll('.accordion-header').forEach(h => {
        h.classList.remove('active');
        h.setAttribute('aria-expanded', 'false');
        const hIcon = h.querySelector('.accordion-icon');
        if (hIcon) hIcon.textContent = '+';
      });

      if (!isOpen) {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.padding = '20px';
        this.classList.add('active');
        this.setAttribute('aria-expanded', 'true');
        if (icon) icon.textContent = '−';
      }
    });
  });


  function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.warn('⚠️ Map container not found');
      return;
    }

    if (typeof L === 'undefined') {
      console.warn('⚠️ Leaflet library not loaded');
      return;
    }

    try {
      const map = L.map('map').setView([14.0583, 121.0169], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      L.marker([14.0583, 121.0169])
        .addTo(map)
        .bindPopup(`
          <b>Mood & Bites</b><br>
          83 National Road, Putatan<br>
          <i>Open Mon-Fri 9am-6pm</i>
        `)
        .openPopup();

      setTimeout(function() {
        map.invalidateSize();
      }, 500);

      console.log('🗺️ Map initialized successfully');
    } catch (error) {
      console.error('❌ Map initialization error:', error);
    }
  }


  function initLightbox() {
    const images = document.querySelectorAll('.gallery-item img, .menu-item img, .promo-item img, .lightbox-trigger');
    
    if (!images.length) {
      console.log('ℹ️ No lightbox images found');
      return;
    }

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image viewer');
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close image viewer">&times;</button>
      <img class="lightbox-image" src="" alt="Enlarged view">
      <button class="lightbox-prev" aria-label="Previous image">‹</button>
      <button class="lightbox-next" aria-label="Next image">›</button>
    `;
    document.body.appendChild(lightbox);

    let currentImageIndex = 0;
    let imageArray = [];

    images.forEach(function(img) {
      imageArray.push({
        src: img.src || img.getAttribute('data-src') || '',
        alt: img.alt || 'Image'
      });
    });

    imageArray = imageArray.filter(function(img) {
      return img.src && img.src !== '';
    });

    if (!imageArray.length) {
      console.log('ℹ️ No valid lightbox images found');
      lightbox.remove();
      return;
    }

    images.forEach(function(img, index) {
      if (!img.src && !img.getAttribute('data-src')) return;
      
      img.addEventListener('click', function(e) {
        e.preventDefault();
        currentImageIndex = index;
        openLightbox(currentImageIndex);
      });
      
      img.style.cursor = 'pointer';
    });

    function openLightbox(index) {
      if (index < 0) index = imageArray.length - 1;
      if (index >= imageArray.length) index = 0;
      currentImageIndex = index;
      
      const img = lightbox.querySelector('.lightbox-image');
      if (img) {
        img.src = imageArray[index].src;
        img.alt = imageArray[index].alt || 'Enlarged view';
      }
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    const closeBtn = lightbox.querySelector('.lightbox-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightbox();
      });
    }

    lightbox.addEventListener('click', function(e) {
      if (e.target === this) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (lightbox.style.display !== 'flex') return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        openLightbox(currentImageIndex - 1);
      } else if (e.key === 'ArrowRight') {
        openLightbox(currentImageIndex + 1);
      }
    });

    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openLightbox(currentImageIndex - 1);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openLightbox(currentImageIndex + 1);
      });
    }

    function closeLightbox() {
      lightbox.style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    console.log('🖼️ Lightbox initialized with ' + imageArray.length + ' images');
  }


  function initAnimations() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
          }
        });
      }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      const elements = document.querySelectorAll('.info-panel, .form-panel, .map-section, .faq-section, .contact-wrapper');
      elements.forEach(function(el) {
        observer.observe(el);
      });
      
      console.log('🎬 Animations initialized with ' + elements.length + ' elements');
    }
  }


  function autoResizeTextarea() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(function(textarea) {
      textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      });
    });
  }


  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      const mapContainer = document.getElementById('map');
      if (mapContainer && mapContainer._leaflet_id) {
        try {
          mapContainer.invalidateSize();
        } catch(e) {}
      }
    }, 250);
  });


  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Mood & Bites - Initializing all features...');
    
    
    loadCartFromStorage();
    
    
    if (document.querySelector('#menuPage .menu-item')) {
      initMenuQuantityControls();
      performSearch();
    }
    
   
    if (document.querySelector('.promo-item')) {
      initPromoQuantityControls();
    }
    
  
    initMap();
    initLightbox();
    initAnimations();
    autoResizeTextarea();
    
   
    showPage('menu');
    
    console.log('✅ All features initialized successfully!');
    console.log('📦 Cart items:', cartItems);
  });

})();