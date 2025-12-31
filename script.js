let catalogo = {};
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

    Object.entries(catalogo)
        .filter(([codigo, p]) =>
            codigo.toLowerCase().includes(q) ||
            p.producto.toLowerCase().includes(q) ||
            p.departamento.toLowerCase().includes(q)
        )
        .slice(0, 50)
        .forEach(([codigo, p]) => {
            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
                <div>
                    <div class="codigo">${codigo} - ${p.producto}</div>
                    <div class="departamento">${p.departamento}</div>
                </div>
                <button class="small" onclick="sumar('${codigo}')">+</button>
            `;
            contenedor.appendChild(div);
        });
}

function renderConteo() {
    const contenedor = document.getElementById("conteo");
    contenedor.innerHTML = "";

    Object.entries(conteo).forEach(([codigo, item]) => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
            <div>
                <div class="codigo">${codigo} - ${item.producto}</div>
                <div class="departamento">${item.departamento}</div>
            </div>
            <div class="controles">
                <button class="small secondary" onclick="restar('${codigo}')">-</button>
                <input
                    class="cantidad"
                    type="number"
                    min="0"
                    value="${item.cantidad}"
                    onchange="setCantidad('${codigo}', this.value)"
                >
                <button class="small" onclick="sumar('${codigo}')">+</button>
            </div>
        `;
        contenedor.appendChild(div);
    });
}

function sumar(codigo) {
    if (!conteo[codigo]) {
        const p = catalogo[codigo];
        conteo[codigo] = {
            producto: p.producto,
            departamento: p.departamento,
            cantidad: 0
        };
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

function setCantidad(codigo, valor) {
    const cantidad = parseInt(valor);
    if (isNaN(cantidad) || cantidad <= 0) {
        delete conteo[codigo];
    } else {
        conteo[codigo].cantidad = cantidad;
    }
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
        ["Código", "Producto", "Departamento", "Cantidad"]
    ];

    Object.entries(conteo).forEach(([codigo, i]) => {
        data.push([
            codigo,
            i.producto,
            i.departamento,
            i.cantidad
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Conteo");

    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `conteo_${fecha}.xlsx`);
}
