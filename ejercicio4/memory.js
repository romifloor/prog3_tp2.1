// Clase que representa una carta en el juego de memoria.
class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    //Método privado que voltea el elemento HTML de la carta mediante una animación CSS.
    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    //Método privado que desvoltea el elemento HTML de la carta mediante una animación CSS.
    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }

    //Método que cambia el estado de volteo de la carta en función de su estado actual.
    toggleFlip() {
        if (this.isFlipped) {
            this.isFlipped = false
            this.#unflip();
        } else {
            this.isFlipped = true
            this.#flip();
        }
    }

    //Método que verifica si la carta actual coincide con otra carta.
    matches(otherCard) {
        if (this.name === otherCard.name) {
            return true
        } else {
            return false
        }
    }
}

// Clase que representa el tablero del juego.
class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }

    //Método que mezcla las cartas del tablero.
    shuffleCards() {
        this.cards = this.cards.sort(() => Math.random() - 0.5);
    }

    //Método que posiciona todas las cartas en su estado inicial.
    flipDownAllCards() {
        let cards = this.cards
        cards.forEach(card => {
            card.isFlipped = true
            card.toggleFlip()           
        });
    }

    //Método que reinicia el tablero.
    reset() {
        this.flipDownAllCards();
        this.shuffleCards()       
        this.render()
    }
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();
        this.count = 0; // Número de intentos realizados.
        this.points = 0; // Puntaje del jugador.
        this.maxPoints = 10000; //Puntaje máximo inicial.
        this.punctuation = document.getElementById('points'); //Elemento HTML para mostrar el puntaje.
        this.timer = document.getElementById('time'); // Elemento HTML para mostrar el tiempo.
        this.time = 0; // Tiempo transcurrido.
        this.interval = null; // Intervalo para el temporizador.
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }

    // Método que verifica si las cartas volteadas coinciden.
    checkForMatch() {
        let cards = this.flippedCards;
        if (cards[0].matches(cards[1])) {
            this.pointsGame();
            this.matchedCards.push(cards[0]);
            this.matchedCards.push(cards[1]);            
            if (this.matchedCards.length === 12) {
                this.stopGame()
                this.punctuation.innerHTML = `Juego terminado!<br><br>Puntaje: ${this.points}<br><br>Intentos: ${this.count}`;
                this.maxPoints = 10000;
            }           
        } else {
            cards[0].toggleFlip()
            cards[1].toggleFlip()
        }
        this.flippedCards = [];
        this.count += 1;
        if (this.matchedCards.length < 12) {
            this.punctuation.innerHTML = `Intentos: ${this.count} Puntaje: ${this.points}`;            
        }
    }

    // Método que calcula los puntos del juego.
    pointsGame() {
        this.maxPoints = this.maxPoints - (this.time * this.count * 10);
        if (this.maxPoints > 0) {
            this.points += this.maxPoints;
            console.log(this.points)
        }
    }

    // Método que inicia el temporizador del juego.
    startGame() {
        return new Promise((resolve) => {
            this.interval = setInterval(() => {
                this.time++;
                this.timer.textContent = `Tiempo: ${this.time} segundos`;
            }, 1000);
            resolve();
        });
    }

    // Método que detiene el temporizador del juego.
    stopGame() {
        return new Promise((resolve) => {
            clearInterval(this.interval);
            resolve();
        });
    }

    // Método que resetea el juego.
    resetGame() {
        this.board.reset();
        this.matchedCards = [];
        this.count = 0;
        this.time = 0;
        this.points = 0;
        this.punctuation.innerHTML = `Intentos: 0<br><br>Puntaje: 0`;
        this.startGame()
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);
    memoryGame.resetGame();

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});
