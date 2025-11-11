const products = [
  { name: "Lipstick", image: "lipstick.cms", link: "https://www.amazon.in/lipsticks-combo/s?k=lipsticks+combo+set" },
  { name: "Foundation", image: "foundation.webp", link: "https://www.amazon.in/foundation/s?k=foundation" },
  { name: "Mascara", image: "maskara.avif", link: "https://www.nykaa.com/makeup/face/blush/c/12?root=nav_2" },
  { name: "Blush", image: "blush.webp", link: "https://www.amazon.in/gp/bestsellers/beauty/1374372031" },
  { name: "Eyeliner", image: "eyeliner.avif", link: "https://www.amazon.in/makeup-eyeliner/s?k=makeup+eyeliner" },
];


const productList = document.getElementById("productList");
const searchBar = document.getElementById("searchBar");

function displayProducts(filteredProducts) {
  productList.innerHTML = "";
  if (filteredProducts.length === 0) {
    productList.innerHTML = "<p>No products found.</p>";
    return;
  }
  filteredProducts.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <a href="${product.link}" target="_blank">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='placeholder.jpg'" />
        <h3>${product.name}</h3>
      </a>
    `;
    productList.appendChild(div);
  });
}

searchBar.addEventListener("input", () => {
  const query = searchBar.value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(query));
  displayProducts(filtered);
});

displayProducts(products);
