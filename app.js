const API_URL = "https://site--enigma-control-mobile--hztpkx4hbkv8.code.run/api/public/products";
const WHATSAPP = "18292174555";

const grid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");

let products = [];
let currentCategory = "Todos";
let currentSearch = "";
let currentModalIndex = 0;
let currentModalProduct = null;
let modalQuantity = 1;

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

function updateModalQuantity(){
  const quantityElement = document.getElementById("modalQuantity");

  if(quantityElement){
      quantityElement.textContent = modalQuantity;
  }

  updateModalWhatsAppLink();
}

function increaseModalQuantity(){
  modalQuantity += 1;
  updateModalQuantity();
}

function decreaseModalQuantity(){
  if(modalQuantity > 1){
      modalQuantity -= 1;
      updateModalQuantity();
  }
}

function updateModalWhatsAppLink(){
  if(!currentModalProduct){
      return;
  }

  const whatsappButton = document.getElementById("modalWhatsApp");

  if(!whatsappButton){
      return;
  }

  const productName =
      currentModalProduct.nombre || "Producto";

  const unitPrice =
      Number(currentModalProduct.precio_venta) || 0;

  const totalPrice =
      unitPrice * modalQuantity;

  const message = [
      "Hola, me interesa este producto:",
      productName,
      `Cantidad: ${modalQuantity}`,
      `Precio unitario: ${money(unitPrice)}`,
      `Total: ${money(totalPrice)}`
  ].join("\n");

  whatsappButton.href =
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
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

function showProductSkeletons(quantity = 8){
  grid.innerHTML = Array.from({ length: quantity }, () => `
      <article class="card skeleton-card" aria-hidden="true">
          <div class="skeleton skeleton-image"></div>

          <div class="card-body skeleton-body">
              <div class="skeleton skeleton-brand"></div>
              <div class="skeleton skeleton-name"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text short"></div>
              <div class="skeleton skeleton-price"></div>
          </div>
      </article>
  `).join("");
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



function changeModalImage(imageUrl, button){
  const modalImage = document.getElementById("modalImage");

  modalImage.classList.add("changing");

  setTimeout(() => {
      modalImage.src = imageUrl;
      modalImage.classList.remove("changing");
  }, 180);

  document
      .querySelectorAll(".modal-thumbnail")
      .forEach(thumbnail => thumbnail.classList.remove("active"));

  if(button){
      button.classList.add("active");
  }
}

function renderModalGallery(product){
  const images = getProductImages(product);
  const modalImage = document.getElementById("modalImage");
  const thumbnails = document.getElementById("modalThumbnails");

  const fallbackImage = "logo-enigma.png";
  const mainImage = images[0] || fallbackImage;

  modalImage.src = mainImage;
  modalImage.alt = product.nombre || "Producto de Enigma Collection";

  if(images.length <= 1){
      thumbnails.innerHTML = "";
      thumbnails.classList.add("hidden");
      return;
  }

  thumbnails.classList.remove("hidden");

  thumbnails.innerHTML = images.map((image, index) => `
      <button
          type="button"
          class="modal-thumbnail ${index === 0 ? "active" : ""}"
          onclick="changeModalImage('${image}', this)"
          aria-label="Ver imagen ${index + 1}"
      >
          <img
              src="${image}"
              alt="${product.nombre || "Producto"} — imagen ${index + 1}"
          >
      </button>
  `).join("");
}

function openProductModal(product){
  const modal = document.getElementById("productModal");

  currentModalProduct = product;
  modalQuantity = 1;

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

  updateModalQuantity();

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function openImageZoom(){
  const modalImage = document.getElementById("modalImage");
  const zoomModal = document.getElementById("imageZoomModal");
  const zoomedImage = document.getElementById("zoomedProductImage");

  if(!modalImage || !modalImage.src){
      return;
  }

  zoomedImage.src = modalImage.src;
  zoomedImage.alt =
      modalImage.alt || "Imagen ampliada del producto";

  zoomModal.classList.add("open");
  zoomModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("image-zoom-open");
}

function closeImageZoom(){
  const zoomModal = document.getElementById("imageZoomModal");

  if(!zoomModal){
      return;
  }

  zoomModal.classList.remove("open");
  zoomModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("image-zoom-open");
}

function closeImageZoomFromBackground(event){
  if(event.target.id === "imageZoomModal"){
      closeImageZoom();
  }
}

function closeProductModal(){
  const modal = document.getElementById("productModal");

  closeImageZoom();

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.addEventListener("keydown", event => {
  const zoomModal = document.getElementById("imageZoomModal");
  const productModal = document.getElementById("productModal");

  if(
      event.key === "Escape" &&
      zoomModal?.classList.contains("open")
  ){
      closeImageZoom();
      return;
  }

  if(!productModal?.classList.contains("open")){
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
    showProductSkeletons();
  
    try{
        

       const res = await fetch(API_URL);
       
       if(!res.ok){
        throw new Error(`Error HTTP: ${res.status}`);
       } 
       
       
       products = await res.json();
       
       console.log(products);

       products.sort((a, b) => {
        const codigoA = String(a.codigo || "");
        const codigoB = String(b.codigo || "");
    
        return codigoB.localeCompare(
            codigoA,
            undefined,
            { numeric:true, sensitivity:"base" }
        );
    });

      console.log("Productos ordenados:", products);


     renderProducts();
     updateActiveButton();

   }catch(e){
    grid.innerHTML = `<p class="empty">No se pudieron cargar los productos.</p>`;
  }
}

loadProducts();

const currentYearElement =
    document.getElementById("currentYear");

if(currentYearElement){
    currentYearElement.textContent =
        new Date().getFullYear();
}