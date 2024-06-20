// Definición de la clase Customer
class Customer {
    constructor(id, name, email){
        this.id = id;
        this.name = name;
        this.email = email;
    }

    //Propiedad computada que devuelve la información del cliente
    get info(){
        return `Nombre: ${this.name}, Email: ${this.email}`;
    }
}

// Definición de la clase Reservation
class Reservation {
    constructor(id, customer, date, guests){
        this.id = id; //Identificador de la reserva.
        this.customer = customer; //Instancia de la clase `Customer` que realiza la reserva.
        this.date = date; //Fecha y hora de la reserva.
        this.guests = guests; //Número de comensales de la reserva.
    }

    //Propiedad computada que devuelve la información de la reserva
    get info() {
        return `Fecha: ${this.date.toLocaleString()}, Cliente: ${this.customer.info}, Comensales: ${this.guests}`;
    }

    // Método estático para validar la reserva
    static validateReservation(date, guests) {
        const reservationDate = new Date(date); 
        const now = new Date(); // Fecha y hora actual
        
        // La reserva no es válida si la fecha es anterior a la actual o si la cantidad de comensales es menor o igual a 0
        if (reservationDate < now || guests <= 0) {
            return false;
        }
        return true;
    }

}

// Definición de la clase Restaurant
class Restaurant {
    constructor(name) {
        this.name = name;
        this.reservations = []; // Lista de reservas
    }

    // Método para agregar una reserva a la lista
    addReservation(reservation) {
        this.reservations.push(reservation);
    }

    // Método para renderizar la lista de reservas en el DOM
    render() {
        const container = document.getElementById("reservations-list");
        container.innerHTML = ""; // Limpia el contenido actual
        this.reservations.forEach((reservation) => {
            // Crear un contenedor para cada reserva
            const reservationCard = document.createElement("div");
            reservationCard.className = "box";
            reservationCard.innerHTML = `
                    <p class="subtitle has-text-primary">
                        Reserva ${
                            reservation.id
                        } - ${reservation.date.toLocaleString()}
                    </p>
                    <div class="card-content">
                        <div class="content">
                            <p>
                                ${reservation.info}
                            </p>
                        </div>
                    </div>
              `;
            container.appendChild(reservationCard); // Añade la reserva al contenedor
        });
    }
}

document
    .getElementById("reservation-form")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        // Obtener los valores del formulario
        const customerName = document.getElementById("customer-name").value;
        const customerEmail = document.getElementById("customer-email").value;
        const reservationDate =
            document.getElementById("reservation-date").value;
        const guests = parseInt(document.getElementById("guests").value);

        // Validar la reserva antes de crearla
        if (Reservation.validateReservation(reservationDate, guests)) {
            const customerId = restaurant.reservations.length + 1;
            const reservationId = restaurant.reservations.length + 1;

            // Crear nuevas instancias de Customer y Reservation
            const customer = new Customer(
                customerId,
                customerName,
                customerEmail
            );
            const reservation = new Reservation(
                reservationId,
                customer,
                reservationDate,
                guests
            );

            // Agregar la nueva reserva al restaurante y renderizar la lista
            restaurant.addReservation(reservation);
            restaurant.render();
        } else {
            alert("Datos de reserva inválidos");
            return;
        }
    });

//Crear una instancia de Restaurant
const restaurant = new Restaurant("El Lojal Kolinar");

//Reserva
const customer1 = new Customer(1, "Shallan Davar", "shallan@gmail.com");
const reservation1 = new Reservation(1, customer1, "2024-12-31T20:00:00", 4);

// Validar y agregar la reserva si es válida
if (Reservation.validateReservation(reservation1.date, reservation1.guests)) {
    restaurant.addReservation(reservation1);
    restaurant.render();
} else {
    alert("Datos de reserva inválidos");
}
