let changesLeft = 5;

// Función para obtener los jugadores del localStorage
const obtenerJugadoresLocalStorage = () => {
    const jugadoresString = localStorage.getItem('jugadores');
    return jugadoresString ? JSON.parse(jugadoresString) : [];
};

// Función para guardar los jugadores en el localStorage
const guardarJugadoresLocalStorage = (jugadores) => {
    localStorage.setItem('jugadores', JSON.stringify(jugadores));
};

// Función asíncrona para agregar un nuevo jugador al equipo usando un prompt de HTML
const agregarJugador = async () => {
    try {
        // Solicitar al usuario que ingrese los datos del jugador
        const nombre = prompt("Ingrese el nombre del jugador:");
        if (nombre === null || nombre.length === 0) {
            return;
        }
        let isAgeCorrect = false;
        let edad;
        while (!isAgeCorrect) {
            edad = parseInt(prompt("Ingrese la edad del jugador:"));
            if (!isNaN(edad)) {
                isAgeCorrect = true;
            }
        }
        const posicion = prompt("Ingrese la posición del jugador:");
        if (posicion === null || posicion.length === 0) {
            return;
        }
        let isConditionCorrect = false;
        let condition = "";
        while (!isConditionCorrect) {
            condition = prompt("Ingrese si es titular o suplente")
            if (condition.toLowerCase() === "titular" || condition.toLowerCase() === "suplente") {
                isConditionCorrect = true;
            }
        }

        // Obtener los jugadores del localStorage
        let jugadores = obtenerJugadoresLocalStorage();

        // Verificar si el jugador ya existe en el equipo
        const jugadorExistente = jugadores.find(jugador => jugador.nombre === nombre);
        if (jugadorExistente) {
            throw new Error('El jugador ya está en el equipo.');
        }

        // Agregar el nuevo jugador al array de jugadores
        jugadores.push(new Player(nombre, edad, posicion, condition));

        // Guardar los jugadores actualizados en el localStorage
        guardarJugadoresLocalStorage(jugadores);

        // Simular una demora de 1 segundo para la operación asíncrona
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mostrar un mensaje de éxito
        alert('Jugador agregado correctamente.');
        listarJugadores();
    } catch (error) {
        console.error('Error:', error.message);
    }
};

// Función asíncrona para listar todos los jugadores del equipo
const listarJugadores = async () => {
    let players = await obtenerJugadoresLocalStorage();
    let container = document.getElementById("players-container");

    while (container.hasChildNodes()) {
        container.removeChild(container.firstChild);
    }

    if (players.length === 0) {
        let noPlayersElement = document.createElement("h2");
        let noPlayersText = document.createTextNode("No has cargado jugadores aún");
        noPlayersElement.appendChild(noPlayersText);
        container.appendChild(noPlayersElement);
    } else {
        let changesLeftElement = document.createElement("h2");
        let changesLeftText = document.createTextNode("Tienes " + changesLeft + " cambios restantes");
        changesLeftElement.appendChild(changesLeftText);
        container.appendChild(changesLeftElement);
    }

    for (let player of players) {
        let playerDiv = document.createElement("div");
        playerDiv.classList.add("player");

        let playerFirstInnerDiv = document.createElement("div");
        let playerSecondInnerDiv = document.createElement("div");
        playerSecondInnerDiv.classList.add("centered")

        let playerNameElement = document.createElement("h2");
        let playerNameText = document.createTextNode(player.name);
        playerNameElement.appendChild(playerNameText);

        let playerAgeElement = document.createElement("h3");
        let playerAgeText = document.createTextNode(player.age + " años");
        playerAgeElement.appendChild(playerAgeText);

        let playerPositionElement = document.createElement("p");
        let playerPositionText = document.createTextNode(player.position);
        playerPositionElement.appendChild(playerPositionText);

        let changePositionButton = document.createElement("button");
        let changePositionText = document.createTextNode("Cambiar posición");
        changePositionButton.appendChild(changePositionText);
        changePositionButton.addEventListener("click", () => asignarPosicion(player.name))

        let conditionElement = document.createElement("h3");
        let conditionText = document.createTextNode("Suplente");
        let selectElement;
        let substitutePlayers;
        let makeChangeButton = document.createElement("button");
        let buttonText = document.createTextNode("Confirmar cambio");
        makeChangeButton.appendChild(buttonText);
        makeChangeButton.classList.add("confirmChangeButton");

        if (player.condition && player.condition.toLowerCase() === "titular") {
            conditionText = document.createTextNode("Titular");
            selectElement = document.createElement("select");
            let allPlayers = await obtenerJugadoresLocalStorage();
            substitutePlayers = allPlayers.filter((player) => player.condition && player.condition.toLowerCase() === "suplente")
            for (let substitutePlayer of substitutePlayers) {
                let option = document.createElement("option");
                let optionText = document.createTextNode(substitutePlayer.name);
                option.appendChild(optionText);
                selectElement.appendChild(option);
            }
            makeChangeButton.addEventListener("click", () => realizarCambio(selectElement.value, player.name))
        } else if (player.condition && player.condition.toLowerCase() === "cambiado") {
            conditionText = document.createTextNode("Cambiado");
        }
        conditionElement.appendChild(conditionText);
        playerSecondInnerDiv.appendChild(conditionElement);
        if (selectElement && substitutePlayers.length > 0) {
            playerSecondInnerDiv.appendChild(selectElement);
            playerSecondInnerDiv.appendChild(makeChangeButton);
        }

        playerFirstInnerDiv.appendChild(playerNameElement);
        playerFirstInnerDiv.appendChild(playerAgeElement);
        playerFirstInnerDiv.appendChild(playerPositionElement);
        playerFirstInnerDiv.appendChild(changePositionButton);
        playerDiv.appendChild(playerFirstInnerDiv);
        playerDiv.appendChild(playerSecondInnerDiv);

        container.appendChild(playerDiv);
    }
}

// Función asíncrona para asignar una nueva posición a un jugador
const asignarPosicion = async (nombreJugador) => {
    let newPosition = prompt("Ingrese la nueva posición para el jugador " + nombreJugador);
    if (newPosition === null || newPosition.length === 0) {
        return;
    }
    let players = await obtenerJugadoresLocalStorage();
    let playerIndex = players.indexOf(players.find((p) => p.name === nombreJugador));
    players[playerIndex].position = newPosition;
    guardarJugadoresLocalStorage(players);
    listarJugadores();
};

// Función asíncrona para realizar un cambio durante un partido
const realizarCambio = async (jugadorEntrante, jugadorSaliente) => {
    if (changesLeft <= 0) {
        alert("You don't have changes left");
        return;
    }
    let players = await obtenerJugadoresLocalStorage();
    let incomingPlayer = players.find((player) => player.name === jugadorEntrante);
    let outgoingPlayer = players.find((player) => player.name === jugadorSaliente);
    incomingPlayer.condition = "Titular";
    outgoingPlayer.condition = "Cambiado";
    changesLeft -= 1;
    guardarJugadoresLocalStorage(players);
    listarJugadores();
};

// Función principal asíncrona que interactúa con el usuario
const main = async (param) => {
    try {
        listarJugadores();
        if (param === "agregarJugador") {
            agregarJugador();
        } 
    } catch (error) {
        console.error('Error:', error);
    }
};

class Player {
    constructor(name, age, position, condition) {
        this.name = name;
        this.age = age;
        this.position = position;
        this.condition = condition;
    }
}

// Llamar a la función principal para iniciar la aplicación
main();
