const API_URL = "https://site--enigma-control-mobile--hztpkx4hbkv8.code.run/api/public/products";
const WHATSAPP = "18292174555";

const grid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");

let products = [];
let currentCategory = "Todos";
let currentSearch = "";
let currentModalIndex = 0;

function money(value){
  return "RD$ " + Number(value || 0).toLocaleString("es-DO");
}

function normalize(value){
  return String(value || "").toLowerCase().trim();
}

function animateProductCards(){
  const cards = document.querySelectorAll(".card:not(.reveal)");

  const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach(entry => {
          if(entry.isIntersecting){
              const card = entry.target;
              const delay = Number(card.dataset.delay || 0);

              setTimeout(() => {
                  card.classList.add("reveal");
              }, delay);

              observerInstance.unobserve(card);
          }
      });
  }, {
      threshold:0.12,
      rootMargin:"0px 0px -40px 0px"
  });

  cards.forEach((card, index) => {
      card.dataset.delay = (index % 4) * 110;
      observer.observe(card);
  });
}

function getFilteredProducts(){
  return products.filter(p => {
    const categoryMatch =
      currentCategory === "Todos" ||
      normalize(p.tipo_inventario) === normalize(currentCategory) ||
      normalize(p.categoria) === normalize(currentCategory);

    const searchText = [
      p.nombre,
      p.marca,
      p.codigo,
      p.categoria,
      p.descripcion
    ].map(normalize).join(" ");

    const searchMatch =
      !currentSearch || searchText.includes(normalize(currentSearch));

    return categoryMatch && searchMatch;
  });
}

function renderProducts(){
  const filtered = getFilteredProducts();

  if(!filtered.length){
    grid.innerHTML = `<p class="empty">No hay productos disponibles en esta búsqueda.</p>`;
    return;
  }

  window.visibleProducts = filtered;

grid.innerHTML = filtered.map((p, index) => `
  <div class="card">
  <div class="card-image">
  <img
  src="${p.foto_url || "logo-enigma.png"}"
  alt="${p.nombre || "Producto"}"
  class="product-image-clickable"
  onclick="openProductModalByIndex(${index})"
>

    <span class="badge">NUEVO</span>

    <div class="card-actions">

    <button
        class="quick-view"
        type="button"
        onclick="event.stopPropagation(); openProductModalByIndex(${index})"
    >
        Vista rápida
    </button>

    <a
        class="image-buy"
        target="_blank"
        rel="noopener"
        onclick="event.stopPropagation()"
        href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
            "Hola, me interesa este producto: " +
            (p.nombre || "") +
            " " +
            money(p.precio_venta)
        )}"
    >
        Comprar por WhatsApp
    </a>

  </div>

</div>

<div class="card-body">
    <div class="brand">${p.marca || "ENIGMA"}</div>
    <div class="name">${p.nombre || ""}</div>
    
    <p class="desc">${p.descripcion || "Producto seleccionado por Enigma Collection RD."}</p>
    <div class="price">${money(p.precio_venta)}</div>
  </div>
</div>
`).join("");
  
  animateProductCards();
}

function openProductModalByIndex(index){
  const product = window.visibleProducts?.[index];

  if(!product){
      console.error("No se encontró el producto seleccionado.");
      return;
  }

  currentModalIndex = index;
  openProductModal(product);
}

function showPreviousProduct(){
  const products = window.visibleProducts || [];

  if(!products.length){
      return;
  }

  currentModalIndex =
      (currentModalIndex - 1 + products.length) % products.length;

  openProductModal(products[currentModalIndex]);
}

function showNextProduct(){
  const products = window.visibleProducts || [];

  if(!products.length){
      return;
  }

  currentModalIndex =
      (currentModalIndex + 1) % products.length;

  openProductModal(products[currentModalIndex]);
}

function openProductModal(product){
  const modal = document.getElementById("productModal");

  document.getElementById("modalImage").src =
      product.foto_url || "logo-enigma.png";

  document.getElementById("modalImage").alt =
      product.nombre || "Producto de Enigma Collection";

  document.getElementById("modalBrand").textContent =
      product.marca || "ENIGMA";

  document.getElementById("modalName").textContent =
      product.nombre || "";

  document.getElementById("modalDescription").textContent =
      product.descripcion ||
      "Producto seleccionado por Enigma Collection RD.";

  document.getElementById("modalPrice").textContent =
      money(product.precio_venta);

  document.getElementById("modalWhatsApp").href =
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
          "Hola, me interesa este producto: " +
          (product.nombre || "") +
          " " +
          money(product.precio_venta)
      )}`;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProductModal(){
  const modal = document.getElementById("productModal");

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.addEventListener("keydown", event => {
  const modal = document.getElementById("productModal");

  if(!modal?.classList.contains("open")){
      return;
  }

  if(event.key === "Escape"){
      closeProductModal();
  }

  if(event.key === "ArrowLeft"){
      showPreviousProduct();
  }

  if(event.key === "ArrowRight"){
      showNextProduct();
  }
});

function updateActiveButton(){
  document.querySelectorAll(".filters button").forEach(btn => {
    btn.classList.remove("active");

    if(btn.textContent.trim().toLowerCase() === currentCategory.toLowerCase()){
      btn.classList.add("active");
    }

    if(currentCategory === "Ropas" && btn.textContent.trim().toLowerCase() === "ropa"){
      btn.classList.add("active");
    }
  });
}

function filterProducts(category){
  currentCategory = category;
  updateActiveButton();
  renderProducts();
}

function searchProducts(){
  currentSearch = searchInput.value;
  renderProducts();
}

async function loadProducts(){
  try{
    grid.innerHTML = `<p class="loading">Cargando productos...</p>`;

    const res = await fetch(API_URL);
    products = await res.json();

    renderProducts();
    updateActiveButton();

  }catch(e){
    grid.innerHTML = `<p class="empty">No se pudieron cargar los productos.</p>`;
  }
}

loadProducts();