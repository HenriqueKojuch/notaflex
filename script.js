// 🔥 Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 🎨 Aplicar tema visual
const themeSelector = document.getElementById("theme-selector");
themeSelector.addEventListener("change", e => {
  document.body.className = e.target.value;
});

// 👤 Login do usuário
document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(() => {
      document.querySelector(".login-section").classList.add("hidden");
      document.getElementById("nota-section").classList.remove("hidden");

      carregarNotas();

      // 💬 Mensagem de boas-vindas
      const usuario = auth.currentUser;
      const nome = usuario.email.split("@")[0];
      const welcomeDiv = document.getElementById("welcome-message");
      welcomeDiv.textContent = `Bem-vindo(a), ${nome}!`;
      welcomeDiv.classList.remove("hidden");
    })
    .catch(err => alert("Erro no login: " + err.message));
});

// 📝 Cadastro de nota
document.getElementById("nota-form").addEventListener("submit", e => {
  e.preventDefault();
  const data = document.getElementById("data").value;
  const fornecedor = document.getElementById("fornecedor").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const usuario = auth.currentUser.email;

  db.collection("notas").add({ data, fornecedor, valor, criadoPor: usuario })
    .then(() => carregarNotas());
});

// 📋 Carregar todas as notas
function carregarNotas() {
  const lista = document.getElementById("notas-list");
  lista.innerHTML = "";

  db.collection("notas").get().then(snapshot => {
    const hoje = new Date().toISOString().slice(0, 10);
    const mesAtual = new Date().getMonth() + 1;
    let totalDia = 0, totalMes = 0;

    snapshot.forEach(doc => {
      const nota = doc.data();
      const id = doc.id;

      if (nota.data === hoje) totalDia += nota.valor;
      if (new Date(nota.data).getMonth() + 1 === mesAtual) totalMes += nota.valor;

      const div = document.createElement("div");
      div.innerHTML = `
        ${nota.data} - ${nota.fornecedor} - R$ ${nota.valor.toFixed(2)}
        <button onclick="editarNota('${id}', ${nota.valor})">Editar</button>
        <button onclick="excluirNota('${id}')">Excluir</button>
      `;
      lista.appendChild(div);
    });

    document.getElementById("total-dia").textContent = totalDia.toFixed(2);
    document.getElementById("total-mes").textContent = totalMes.toFixed(2);
  });
}

// ✏️ Editar nota
function editarNota(id, valorAtual) {
  const senha = prompt("Senha de supervisor:");
  if (senha !== "super123") return alert("Senha incorreta!");

  const novoValor = parseFloat(prompt("Novo valor:", valorAtual));
  db.collection("notas").doc(id).update({ valor: novoValor })
    .then(() => carregarNotas());
}

// 🗑️ Excluir nota
function excluirNota(id) {
  const senha = prompt("Senha de supervisor:");
  if (senha !== "super123") return alert("Senha incorreta!");

  db.collection("notas").doc(id).delete()
    .then(() => carregarNotas());
}

// 📅 Relatório por período
document.getElementById("gerar-relatorio").addEventListener("click", () => {
  const inicio = prompt("Data inicial (AAAA-MM-DD)");
  const fim = prompt("Data final (AAAA-MM-DD)");

  db.collection("notas").get().then(snapshot => {
    const relatorio = [];
    let total = 0;

    snapshot.forEach(doc => {
      const nota = doc.data();
      if (nota.data >= inicio && nota.data <= fim) {
        relatorio.push(nota);
        total += nota.valor;
      }
    });

    alert(`Relatório de ${inicio} a ${fim}\nNotas: ${relatorio.length}\nTotal: R$ ${total.toFixed(2)}`);
  });
});

// 🖼️ Ocultar tela de splash após carregamento
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");
    if (splash) splash.style.display = "none";
  }, 3000);
});
