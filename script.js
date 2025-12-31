let catalogo = [];
let conteo = JSON.parse(localStorage.getItem("conteo")) || {};

fetch("catalogo.json")
    .then(res => res.json())
    .then(data => {
        catalogo = data;
        renderCatalogo();
        renderConteo();
    });

document.getElementById("busqueda").addEventListener("input", renderCatalogo);

function renderCatalogo() {
    const q = document.getElementById("busqueda").value.toLowerCase();
    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = "";

    catalogo
        .filter(p =>
            p.codigo.toLowerCase().includes(q) ||
            p.nombre.toLowerCase().includes(q)
        )
        .slice(0, 50)
        .forEach(p => {
            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
                <span>${p.codigo} - ${p.nombre}</span>
                <button onclick="sumar('${p.codigo}')">+</button>
            `;
            contenedor.appendChild(div);
        });
}

function renderConteo() {
    const contenedor = document.getElementById("conteo");
    contenedor.innerHTML = "";

    Object.values(conteo).forEach(item => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <span>${item.codigo} - ${item.nombre} (${item.cantidad})</span>
            <div class="controles">
                <button onclick="restar('${item.codigo}')">-</button>
                <button onclick="sumar('${item.codigo}')">+</button>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

function sumar(codigo) {
    const p = catalogo.find(x => x.codigo === codigo);
    if (!conteo[codigo]) {
        conteo[codigo] = { ...p, cantidad: 0 };
    }
    conteo[codigo].cantidad++;
    guardar();
}

function restar(codigo) {
    if (!conteo[codigo]) return;
    conteo[codigo].cantidad--;
    if (conteo[codigo].cantidad <= 0) delete conteo[codigo];
    guardar();
}

function guardar() {
    localStorage.setItem("conteo", JSON.stringify(conteo));
    renderConteo();
}

function limpiarConteo() {
    if (!confirm("¿Borrar todo el conteo?")) return;
    conteo = {};
    guardar();
}

function exportarExcel() {
    const data = [
        ["Código", "Producto", "Cantidad"],
        ...Object.values(conteo).map(i => [
            i.codigo,
            i.nombre,
            i.cantidad
        ])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Conteo");

    XLSX.writeFile(wb, "conteo.xlsx");
}
