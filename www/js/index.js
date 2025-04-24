var pizzariaID = "pizzaria_do_tinoco";
var listaPizzasCadastradas = [];
var pizzaAtualID = null;

if (window.cordova) {
    document.addEventListener("deviceready", onDeviceReady, false);
} else {
    console.warn("Simulando deviceready");
    onDeviceReady();
}

function onDeviceReady() {
    if (cordova?.plugin?.http?.setDataSerializer) {
        cordova.plugin.http.setDataSerializer('json');
    }

    document.getElementById("btnNovo").addEventListener("click", () => {
        pizzaAtualID = null;
        document.getElementById("pizza").value = "";
        document.getElementById("preco").value = "";
        document.getElementById("imagem").style.backgroundImage = "";
        document.getElementById("applista").style.display = "none";
        document.getElementById("appcadastro").style.display = "flex";
    });

    document.getElementById("btnCancelar").addEventListener("click", () => {
        document.getElementById("applista").style.display = "flex";
        document.getElementById("appcadastro").style.display = "none";
    });

    document.getElementById("btnFoto").addEventListener("click", () => {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL
        });
        function onSuccess(imageData) {
            document.getElementById("imagem").style.backgroundImage = "url('data:image/jpeg;base64," + imageData + "')";
        }
        function onFail(message) {
            alert("Erro: " + message);
        }
    });

    document.getElementById("btnSalvar").addEventListener("click", () => {
        const pizza = document.getElementById("pizza").value;
        const preco = document.getElementById("preco").value;
        const imagem = document.getElementById("imagem").style.backgroundImage;

        const dados = {
            pizzaria: pizzariaID,
            pizza,
            preco,
            imagem
        };

        if (pizzaAtualID != null) {
            dados.pizzaid = listaPizzasCadastradas[pizzaAtualID]._id;
            cordova.plugin.http.put('https://pedidos-pizzaria.glitch.me/admin/pizza/', dados, {}, response => {
                alert("Pizza atualizada!");
                carregarPizzas();
                voltarParaLista();
            }, err => alert(err.error));
        } else {
            cordova.plugin.http.post('https://pedidos-pizzaria.glitch.me/admin/pizza/', dados, {}, response => {
                alert("Pizza cadastrada!");
                carregarPizzas();
                voltarParaLista();
            }, err => alert(err.error));
        }
    });

    document.getElementById("btnExcluir").addEventListener("click", () => {
        const nomePizza = document.getElementById("pizza").value;
        const url = `https://pedidos-pizzaria.glitch.me/admin/pizza/${pizzariaID}/${nomePizza}`;
        cordova.plugin.http.delete(url, {}, {}, response => {
            alert("Pizza excluída!");
            carregarPizzas();
            voltarParaLista();
        }, err => alert(err.error));
    });

    carregarPizzas();
}

function voltarParaLista() {
    document.getElementById("applista").style.display = "flex";
    document.getElementById("appcadastro").style.display = "none";
}

function carregarPizzas() {
    const url = `https://pedidos-pizzaria.glitch.me/admin/pizzas/${pizzariaID}`;
    const lista = document.getElementById("listaPizzas");
    lista.innerHTML = "";

    cordova.plugin.http.get(url, {}, {}, response => {
        if (response.data !== "") {
            listaPizzasCadastradas = JSON.parse(response.data);
            listaPizzasCadastradas.forEach((item, idx) => {
                const novo = document.createElement("div");
                novo.classList.add("linha");
                novo.innerHTML = item.pizza;
                novo.id = idx;
                novo.onclick = () => carregarDadosPizza(idx);
                lista.appendChild(novo);
            });
        }
    }, err => alert(err.error));
}

function carregarDadosPizza(id) {
    pizzaAtualID = id;
    const pizza = listaPizzasCadastradas[id];
    document.getElementById("pizza").value = pizza.pizza;
    document.getElementById("preco").value = pizza.preco;
    document.getElementById("imagem").style.backgroundImage = pizza.imagem;

    document.getElementById("applista").style.display = "none";
    document.getElementById("appcadastro").style.display = "flex";
}
