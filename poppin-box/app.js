"use strict";

(function () {
  const WHATSAPP_NUMBER = "6281234567890";
  const STORAGE_KEY = "poppin_box_cart_v1";

  const PRODUCTS = [
    {
      id: "mochi-bunny-v1",
      name: "Mochi Bunny Cozy Series",
      category: "Plush & Bunny",
      priceSingle: 159000,
      priceSet: 920000,
      secretChance: "1 : 72",
      stock: 18,
      badge: "Terlaris",
      image: "assets/mochi-bunny.jpg",
      description:
        "Koleksi figurin vinil lembut bertema kelinci pastel dengan hoodie rajut mini. Setiap kotak tersegel acak dari 6 karakter reguler + 1 edisi rahasia.",
      characters: ["Strawberry Mochi", "Cream Latte", "Peach Puff", "Cocoa Nap", "Matcha Roll", "Caramel Cloud", "Secret: Golden Bunny"]
    },
    {
      id: "cosmic-dream-cat",
      name: "Cosmic Dream Kitten",
      category: "Cosmic",
      priceSingle: 175000,
      priceSet: 1020000,
      secretChance: "1 : 96",
      stock: 12,
      badge: "Baru",
      image: "assets/cosmic-dream.jpg",
      description:
        "Petualangan anak kucing astronot berbalut aksen rose-gold dan bintang menyala lembut. Finishing matte premium dengan detail helm transparan.",
      characters: ["Starlight Mew", "Nebula Purr", "Orbit Cream", "Milky Way", "Comet Tail", "Lunar Nap", "Secret: Aurora Galaxy"]
    },
    {
      id: "sweet-bakery-bear",
      name: "Sweet Bakery Bear",
      category: "Bakery",
      priceSingle: 149000,
      priceSet: 860000,
      secretChance: "1 : 72",
      stock: 24,
      badge: "Favorit",
      image: "assets/sweet-bakery.jpg",
      description:
        "Beruang mungil pembuat roti dengan apron garis pink pastel dan aksesori pastry mini yang menggemaskan. Cocok untuk pajangan meja kerja.",
      characters: ["Croissant Bear", "Brioche Hug", "Macaron Chef", "Cinnamon Roll", "Tiramisu Cub", "Berry Tart", "Secret: Master Patissier"]
    },
    {
      id: "flora-spirit-garden",
      name: "Flora Spirit Garden",
      category: "Flora",
      priceSingle: 165000,
      priceSet: 960000,
      secretChance: "1 : 72",
      stock: 15,
      badge: "Terbatas",
      image: "assets/flora-spirit.jpg",
      description:
        "Roh penjaga taman bunga bernuansa earthy nude dan mahkota kelopak sakura. Dilengkapi alas rumput mini bertekstur halus.",
      characters: ["Sakura Sprout", "Daisy Dew", "Tulip Whisper", "Mossy Pebble", "Clover Wish", "Honey Blossom", "Secret: Crystal Lotus"]
    },
    {
      id: "mochi-pastel-party",
      name: "Pastel Pals Tea Party",
      category: "Limited",
      priceSingle: 199000,
      priceSet: 1150000,
      secretChance: "1 : 108",
      stock: 6,
      badge: "Edisi Terbatas",
      image: "assets/hero-banner.jpg",
      description:
        "Seri kolaborasi spesial pesta teh pastel berisi karakter ikonik Poppin Box dengan aksesori cangkir mini dan kartu kolektor bernomor.",
      characters: ["Velvet Bunny", "Honey Bear", "Mint Kitty", "Lavender Fawn", "Butter Chick", "Rose Macaron", "Secret: Royal Teacup"]
    },
    {
      id: "bakery-choco-edition",
      name: "Nude Cocoa Dessert Box",
      category: "Bakery",
      priceSingle: 155000,
      priceSet: 895000,
      secretChance: "1 : 72",
      stock: 20,
      badge: "Restock",
      image: "assets/sweet-bakery.jpg",
      description:
        "Varian dessert hangat dengan palet coklat nude dan krim stroberi. Setiap figurin hadir bersama kartu karakter dan stiker eksklusif.",
      characters: ["Choco Waffle", "Almond Cookie", "Mocha Swirl", "Praline Pup", "Vanilla Bean", "Caramel Flan", "Secret: Gold Fondue"]
    }
  ];

  const state = {
    search: "",
    category: "Semua",
    sort: "default",
    cart: [],
    selectedProduct: null,
    selectedVariant: "single",
    paymentMethod: "QRIS"
  };

  function formatRupiah(amount) {
    return "Rp " + Number(amount).toLocaleString("id-ID");
  }

  function sanitizeText(value, maxLength) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, maxLength);
  }

  function loadCart() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (item) {
        return (
          item &&
          typeof item.id === "string" &&
          (item.variant === "single" || item.variant === "set") &&
          Number.isInteger(item.qty) &&
          item.qty > 0 &&
          PRODUCTS.some(function (p) {
            return p.id === item.id;
          })
        );
      });
    } catch (err) {
      return [];
    }
  }

  function saveCart() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
    } catch (err) {
      // Abaikan jika penyimpanan lokal dibatasi
    }
  }

  function showToast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className =
      "toast-item pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg border " +
      (type === "error"
        ? "bg-red-50 text-red-900 border-red-200"
        : "bg-[#3E2C26] text-white border-[#573F37]");
    toast.setAttribute("role", "status");

    const dot = document.createElement("span");
    dot.className =
      "inline-block h-2.5 w-2.5 rounded-full shrink-0 " +
      (type === "error" ? "bg-red-500" : "bg-[#E7A1B0]");

    const text = document.createElement("span");
    text.textContent = message;

    toast.appendChild(dot);
    toast.appendChild(text);
    container.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
    }, 3200);
  }

  function getFilteredProducts() {
    const keyword = state.search.toLowerCase();
    const list = PRODUCTS.filter(function (product) {
      const matchCategory =
        state.category === "Semua" || product.category === state.category;
      const matchSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword);
      return matchCategory && matchSearch;
    });

    if (state.sort === "price-asc") {
      list.sort(function (a, b) {
        return a.priceSingle - b.priceSingle;
      });
    } else if (state.sort === "price-desc") {
      list.sort(function (a, b) {
        return b.priceSingle - a.priceSingle;
      });
    }
    return list;
  }

  function addToCart(productId, variant) {
    const product = PRODUCTS.find(function (p) {
      return p.id === productId;
    });
    if (!product) return;

    const existing = state.cart.find(function (item) {
      return item.id === productId && item.variant === variant;
    });

    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({ id: productId, variant: variant, qty: 1 });
    }

    saveCart();
    renderCart();
    const label = variant === "set" ? "Full Set (6x)" : "Single Box";
    showToast(product.name + " (" + label + ") ditambahkan ke keranjang.", "success");
  }

  function updateCartQty(productId, variant, delta) {
    const idx = state.cart.findIndex(function (item) {
      return item.id === productId && item.variant === variant;
    });
    if (idx === -1) return;

    state.cart[idx].qty += delta;
    if (state.cart[idx].qty <= 0) {
      state.cart.splice(idx, 1);
    }
    saveCart();
    renderCart();
  }

  function renderProducts() {
    const grid = document.getElementById("product-grid");
    const emptyState = document.getElementById("empty-catalog");
    const countEl = document.getElementById("catalog-count");
    if (!grid || !emptyState || !countEl) return;

    grid.replaceChildren();
    const filtered = getFilteredProducts();
    countEl.textContent = "Menampilkan " + filtered.length + " dari " + PRODUCTS.length + " seri";

    if (filtered.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    emptyState.classList.add("hidden");

    filtered.forEach(function (product) {
      const card = document.createElement("article");
      card.className =
        "product-card bg-[#FFFAF7] border border-[#EADCD3] rounded-3xl overflow-hidden flex flex-col";

      const imgWrap = document.createElement("div");
      imgWrap.className = "relative aspect-[4/3] bg-[#F7F1ED] overflow-hidden";

      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.name;
      img.loading = "lazy";
      img.className = "w-full h-full object-cover";

      const badge = document.createElement("span");
      badge.className =
        "absolute top-3 left-3 rounded-full bg-[#3E2C26]/90 text-white text-xs font-semibold px-3 py-1";
      badge.textContent = product.badge;

      const secretBadge = document.createElement("span");
      secretBadge.className =
        "absolute bottom-3 right-3 rounded-full bg-[#FDF4F6]/95 text-[#8C6A5D] border border-[#E7A1B0] text-[11px] font-semibold px-2.5 py-1";
      secretBadge.textContent = "Secret " + product.secretChance;

      imgWrap.appendChild(img);
      imgWrap.appendChild(badge);
      imgWrap.appendChild(secretBadge);

      const body = document.createElement("div");
      body.className = "p-5 flex-1 flex flex-col";

      const cat = document.createElement("p");
      cat.className = "text-xs font-semibold uppercase tracking-wider text-[#8C6A5D]";
      cat.textContent = product.category;

      const title = document.createElement("h3");
      title.className = "mt-1 text-lg font-bold text-[#3E2C26]";
      title.textContent = product.name;

      const desc = document.createElement("p");
      desc.className = "mt-2 text-sm text-[#6E554B] line-clamp-2 flex-1";
      desc.textContent = product.description;

      const priceRow = document.createElement("div");
      priceRow.className = "mt-4 pt-3 border-t border-[#EADCD3] flex items-end justify-between gap-2";

      const priceCol = document.createElement("div");
      const priceLabel = document.createElement("span");
      priceLabel.className = "block text-[11px] text-[#8C6A5D]";
      priceLabel.textContent = "Mulai dari";

      const priceVal = document.createElement("span");
      priceVal.className = "text-lg font-extrabold text-[#3E2C26]";
      priceVal.textContent = formatRupiah(product.priceSingle);

      priceCol.appendChild(priceLabel);
      priceCol.appendChild(priceVal);

      const stockTag = document.createElement("span");
      stockTag.className = "text-xs font-medium text-[#8C6A5D]";
      stockTag.textContent = "Stok: " + product.stock + " box";

      priceRow.appendChild(priceCol);
      priceRow.appendChild(stockTag);

      const actions = document.createElement("div");
      actions.className = "mt-4 grid grid-cols-2 gap-2.5";

      const detailBtn = document.createElement("button");
      detailBtn.type = "button";
      detailBtn.className =
        "min-h-[44px] rounded-2xl border border-[#C8A99A] bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-[#3E2C26] hover:bg-[#F7F1ED] transition";
      detailBtn.textContent = "Lihat Detail";
      detailBtn.addEventListener("click", function () {
        openProductModal(product);
      });

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className =
        "min-h-[44px] rounded-2xl bg-[#E7A1B0] hover:bg-[#D8899A] px-3 py-2 text-xs sm:text-sm font-bold text-[#3E2C26] transition";
      addBtn.textContent = "+ Keranjang";
      addBtn.addEventListener("click", function () {
        addToCart(product.id, "single");
      });

      actions.appendChild(detailBtn);
      actions.appendChild(addBtn);

      body.appendChild(cat);
      body.appendChild(title);
      body.appendChild(desc);
      body.appendChild(priceRow);
      body.appendChild(actions);

      card.appendChild(imgWrap);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  function renderCart() {
    const itemsEl = document.getElementById("cart-items");
    const emptyEl = document.getElementById("cart-empty");
    const badgeEl = document.getElementById("cart-badge");
    const totalEl = document.getElementById("cart-total");
    const checkoutSection = document.getElementById("checkout-section");
    if (!itemsEl || !emptyEl || !badgeEl || !totalEl || !checkoutSection) return;

    itemsEl.replaceChildren();
    let totalQty = 0;
    let totalPrice = 0;

    state.cart.forEach(function (item) {
      const product = PRODUCTS.find(function (p) {
        return p.id === item.id;
      });
      if (!product) return;

      const unitPrice =
        item.variant === "set" ? product.priceSet : product.priceSingle;
      totalQty += item.qty;
      totalPrice += unitPrice * item.qty;

      const row = document.createElement("div");
      row.className =
        "flex items-center gap-3 rounded-2xl border border-[#EADCD3] bg-white p-3";

      const thumb = document.createElement("img");
      thumb.src = product.image;
      thumb.alt = product.name;
      thumb.className = "h-16 w-16 rounded-xl object-cover shrink-0";

      const info = document.createElement("div");
      info.className = "flex-1 min-w-0";

      const name = document.createElement("p");
      name.className = "text-sm font-bold text-[#3E2C26] truncate";
      name.textContent = product.name;

      const variantText = document.createElement("p");
      variantText.className = "text-xs text-[#8C6A5D]";
      variantText.textContent =
        (item.variant === "set" ? "Full Set (6x)" : "Single Box") +
        " • " +
        formatRupiah(unitPrice);

      const controls = document.createElement("div");
      controls.className = "mt-2 flex items-center gap-2";

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className =
        "h-8 w-8 rounded-lg border border-[#EADCD3] text-sm font-bold text-[#3E2C26] hover:bg-[#F7F1ED]";
      minusBtn.setAttribute("aria-label", "Kurangi jumlah");
      minusBtn.textContent = "-";
      minusBtn.addEventListener("click", function () {
        updateCartQty(item.id, item.variant, -1);
      });

      const qtySpan = document.createElement("span");
      qtySpan.className = "min-w-[20px] text-center text-sm font-semibold";
      qtySpan.textContent = String(item.qty);

      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.className =
        "h-8 w-8 rounded-lg border border-[#EADCD3] text-sm font-bold text-[#3E2C26] hover:bg-[#F7F1ED]";
      plusBtn.setAttribute("aria-label", "Tambah jumlah");
      plusBtn.textContent = "+";
      plusBtn.addEventListener("click", function () {
        updateCartQty(item.id, item.variant, 1);
      });

      controls.appendChild(minusBtn);
      controls.appendChild(qtySpan);
      controls.appendChild(plusBtn);

      info.appendChild(name);
      info.appendChild(variantText);
      info.appendChild(controls);

      row.appendChild(thumb);
      row.appendChild(info);
      itemsEl.appendChild(row);
    });

    badgeEl.textContent = String(totalQty);
    badgeEl.classList.toggle("hidden", totalQty === 0);
    totalEl.textContent = formatRupiah(totalPrice);

    const hasItems = state.cart.length > 0;
    emptyEl.classList.toggle("hidden", hasItems);
    checkoutSection.classList.toggle("hidden", !hasItems);
  }

  function openProductModal(product) {
    state.selectedProduct = product;
    state.selectedVariant = "single";

    const modal = document.getElementById("product-modal");
    const img = document.getElementById("modal-img");
    const cat = document.getElementById("modal-category");
    const title = document.getElementById("modal-title");
    const desc = document.getElementById("modal-desc");
    const secret = document.getElementById("modal-secret");
    const charList = document.getElementById("modal-characters");
    const priceSingle = document.getElementById("modal-price-single");
    const priceSet = document.getElementById("modal-price-set");

    if (!modal || !img || !cat || !title || !desc || !secret || !charList) return;

    img.src = product.image;
    img.alt = product.name;
    cat.textContent = product.category;
    title.textContent = product.name;
    desc.textContent = product.description;
    secret.textContent = "Peluang Secret: " + product.secretChance;
    priceSingle.textContent = formatRupiah(product.priceSingle);
    priceSet.textContent = formatRupiah(product.priceSet);

    charList.replaceChildren();
    product.characters.forEach(function (charName) {
      const chip = document.createElement("span");
      chip.className =
        "rounded-full px-3 py-1 text-xs font-medium " +
        (charName.startsWith("Secret:")
          ? "bg-[#E7A1B0]/30 text-[#3E2C26] border border-[#E7A1B0]"
          : "bg-[#F7F1ED] text-[#6E554B] border border-[#EADCD3]");
      chip.textContent = charName;
      charList.appendChild(chip);
    });

    updateVariantButtons();
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function closeProductModal() {
    const modal = document.getElementById("product-modal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    state.selectedProduct = null;
  }

  function updateVariantButtons() {
    const btnSingle = document.getElementById("variant-single-btn");
    const btnSet = document.getElementById("variant-set-btn");
    if (!btnSingle || !btnSet) return;

    const activeClasses = ["border-[#3E2C26]", "bg-[#FDF4F6]"];
    const idleClasses = ["border-[#EADCD3]", "bg-white"];

    if (state.selectedVariant === "single") {
      btnSingle.classList.add(...activeClasses);
      btnSingle.classList.remove(...idleClasses);
      btnSet.classList.add(...idleClasses);
      btnSet.classList.remove(...activeClasses);
    } else {
      btnSet.classList.add(...activeClasses);
      btnSet.classList.remove(...idleClasses);
      btnSingle.classList.add(...idleClasses);
      btnSingle.classList.remove(...activeClasses);
    }
  }

  function toggleCartDrawer(open) {
    const overlay = document.getElementById("cart-overlay");
    const panel = document.getElementById("cart-drawer");
    if (!overlay || !panel) return;

    if (open) {
      overlay.classList.remove("hidden");
      panel.classList.remove("is-closed");
    } else {
      overlay.classList.add("hidden");
      panel.classList.add("is-closed");
    }
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    if (state.cart.length === 0) {
      showToast("Keranjang masih kosong. Pilih blind box terlebih dahulu.", "error");
      return;
    }

    const nameInput = document.getElementById("checkout-name");
    const phoneInput = document.getElementById("checkout-phone");
    const addressInput = document.getElementById("checkout-address");
    const errorEl = document.getElementById("checkout-error");

    const customerName = sanitizeText(nameInput.value, 80);
    const customerPhone = sanitizeText(phoneInput.value, 20);
    const customerAddress = sanitizeText(addressInput.value, 200);

    if (customerName.length < 2) {
      errorEl.textContent = "Masukkan nama lengkap minimal 2 karakter.";
      errorEl.classList.remove("hidden");
      return;
    }
    if (!/^[0-9+\-\s]{9,18}$/.test(customerPhone)) {
      errorEl.textContent = "Masukkan nomor WhatsApp aktif yang valid.";
      errorEl.classList.remove("hidden");
      return;
    }
    if (customerAddress.length < 10) {
      errorEl.textContent = "Masukkan alamat pengiriman lengkap (minimal 10 karakter).";
      errorEl.classList.remove("hidden");
      return;
    }
    errorEl.classList.add("hidden");

    let total = 0;
    const lines = [
      "Halo Poppin Box! Saya ingin memesan blind box:",
      ""
    ];

    state.cart.forEach(function (item, idx) {
      const product = PRODUCTS.find(function (p) {
        return p.id === item.id;
      });
      if (!product) return;
      const unitPrice =
        item.variant === "set" ? product.priceSet : product.priceSingle;
      const subtotal = unitPrice * item.qty;
      total += subtotal;
      const label = item.variant === "set" ? "Full Set (6x)" : "Single Box";
      lines.push(
        idx + 1 + ". " + product.name + " [" + label + "] x" + item.qty + " = " + formatRupiah(subtotal)
      );
    });

    lines.push("");
    lines.push("Total Estimasi: " + formatRupiah(total));
    lines.push("Metode Pembayaran: " + state.paymentMethod);
    lines.push("Nama: " + customerName);
    lines.push("No. WA: " + customerPhone);
    lines.push("Alamat: " + customerAddress);

    const waUrl =
      "https://wa.me/" +
      WHATSAPP_NUMBER +
      "?text=" +
      encodeURIComponent(lines.join("\n"));

    window.open(waUrl, "_blank", "noopener,noreferrer");
    showToast("Mengarahkan pesanan ke WhatsApp Poppin Box...", "success");
  }

  function initEvents() {
    const searchInput = document.getElementById("catalog-search");
    const sortSelect = document.getElementById("catalog-sort");
    const filterButtons = document.querySelectorAll("[data-category]");
    const resetFilterBtn = document.getElementById("reset-filter-btn");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        state.search = e.target.value;
        renderProducts();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", function (e) {
        state.sort = e.target.value;
        renderProducts();
      });
    }

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.category = btn.getAttribute("data-category") || "Semua";
        filterButtons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        renderProducts();
      });
    });

    if (resetFilterBtn) {
      resetFilterBtn.addEventListener("click", function () {
        state.search = "";
        state.category = "Semua";
        state.sort = "default";
        if (searchInput) searchInput.value = "";
        if (sortSelect) sortSelect.value = "default";
        filterButtons.forEach(function (b) {
          b.classList.toggle("is-active", b.getAttribute("data-category") === "Semua");
        });
        renderProducts();
      });
    }

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener("click", function () {
        mobileMenu.classList.toggle("hidden");
      });
      mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileMenu.classList.add("hidden");
        });
      });
    }

    const openCartBtn = document.getElementById("open-cart-btn");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const cartOverlay = document.getElementById("cart-overlay");
    if (openCartBtn) {
      openCartBtn.addEventListener("click", function () {
        toggleCartDrawer(true);
      });
    }
    if (closeCartBtn) {
      closeCartBtn.addEventListener("click", function () {
        toggleCartDrawer(false);
      });
    }
    if (cartOverlay) {
      cartOverlay.addEventListener("click", function () {
        toggleCartDrawer(false);
      });
    }

    const closeModalBtn = document.getElementById("close-modal-btn");
    const productModal = document.getElementById("product-modal");
    const variantSingleBtn = document.getElementById("variant-single-btn");
    const variantSetBtn = document.getElementById("variant-set-btn");
    const modalAddBtn = document.getElementById("modal-add-btn");

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", closeProductModal);
    }
    if (productModal) {
      productModal.addEventListener("click", function (e) {
        if (e.target === productModal) closeProductModal();
      });
    }
    if (variantSingleBtn) {
      variantSingleBtn.addEventListener("click", function () {
        state.selectedVariant = "single";
        updateVariantButtons();
      });
    }
    if (variantSetBtn) {
      variantSetBtn.addEventListener("click", function () {
        state.selectedVariant = "set";
        updateVariantButtons();
      });
    }
    if (modalAddBtn) {
      modalAddBtn.addEventListener("click", function () {
        if (!state.selectedProduct) return;
        addToCart(state.selectedProduct.id, state.selectedVariant);
        closeProductModal();
      });
    }

    document.querySelectorAll("input[name='payment-method']").forEach(function (radio) {
      radio.addEventListener("change", function (e) {
        state.paymentMethod = e.target.value;
      });
    });

    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", handleCheckoutSubmit);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    state.cart = loadCart();
    initEvents();
    renderProducts();
    renderCart();
  });
})();
