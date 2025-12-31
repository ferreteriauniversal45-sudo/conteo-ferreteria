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
                <span>
                    <strong>${codigo}</strong> - ${p.producto}
                    <br><small>${p.departamento}</small>
                </span>
                <button onclick="sumar('${codigo}')">+</button>
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
            <span>
                <strong>${codigo}</strong> - ${item.producto}
                <br>Cantidad: ${item.cantidad}
            </span>
            <div class="controles">
                <button onclick="restar('${codigo}')">-</button>
                <button onclick="sumar('${codigo}')">+</button>
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

    XLSX.writeFile(wb, "conteo.xlsx");
}
