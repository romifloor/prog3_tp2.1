// Definición de la clase Sensor
class Sensor {
    constructor(id, name, type, value, unit, updated_at) {

        //Verificar que el tipo de sensor sea válido
        if(!Sensor.ValidType(type)){
            throw new Error("Tipo de sensor no válido: ${type}")
        }

        this.id = id;
        this.name = name;
        this.type = type;
        this.value = value;
        this.unit = unit;
        this.updated_at = updated_at;
    }

    //Método estático para validar el tipo de sensor
    static ValidType(type){
        const validType = ["temperature", "humidity", "pressure"];
        return validType.includes(type);
    }

    // Setter para actualizar el valor del sensor y la fecha de actualización
    set updateValue(newValue){
        this.value = newValue;
        this.updated_at = new Date().toISOString(); // Actualiza la fecha al momento actual
    }
}

// Definición de la clase SensorManager
class SensorManager {
    constructor() {
        this.sensors = []; // Inicializa la lista de sensores
    }

    // Método para agregar un sensor a la lista
    addSensor(sensor) {
        this.sensors.push(sensor); 
    }

    // Método para actualizar el valor de un sensor específico por su ID
    updateSensor(id) {
        // Busca el sensor por su ID en la lista de sensores
        const sensor = this.sensors.find((sensor) => sensor.id === id);

        if (sensor) {
            let newValue;
            // Genera un nuevo valor basado en el tipo de sensor
            switch (sensor.type) {
                case "temperature": // Rango de -30 a 50 grados Celsius
                    newValue = (Math.random() * 80 - 30).toFixed(2);
                    break;
                case "humidity": // Rango de 0 a 100%
                    newValue = (Math.random() * 100).toFixed(2);
                    break;
                case "pressure": // Rango de 960 a 1040 hPa (hectopascales o milibares)
                    newValue = (Math.random() * 80 + 960).toFixed(2);
                    break;
                default: // Valor por defecto si el tipo es desconocido
                    newValue = (Math.random() * 100).toFixed(2);
            }
            
            sensor.updateValue = newValue; // Actualiza el valor del sensor

            this.render(); // Renderiza la interfaz para reflejar los cambios

        } else { // Si no se encuentra el sensor, se muestra un error en la consola
            console.error(`Sensor ID ${id} no encontrado`);
        }
    }


    // Método para cargar sensores desde una URL 
    async loadSensors(url) {
        try{
            // Realizar la petición HTTP GET para cargar los sensores desde sensors.json
            const response = await fetch(url);

            if (!response.ok){
                throw new Error("Error al cargar los sensores: ${response.status} - ${response.statusText}");
            }

            //Convertir la respuesta a JSON
            const sensorsData = await response.json();


            // Iterar sobre los datos de los sensores y crear instancias de Sensor
            sensorsData.forEach(sensorData => {
                const sensor = new Sensor(sensorData.id, sensorData.name, sensorData.type, sensorData.value, sensorData.unit, sensorData.updated_at);
                this.addSensor(sensor); // Agregar el sensor al arreglo de sensores
            });

            //Renderizar los sensores en la página
            this.render();


        } catch (error) {
            console.error(`Error al cargar los sensores: ${error.message}`);
        } finally {
            console.log('Carga de sensores finalizada.'); 
        }
    }
    

    // Método para renderizar la interfaz de usuario
    render() {

        // Obtiene el contenedor de los sensores en el DOM
        const container = document.getElementById("sensor-container");
        container.innerHTML = ""; // Limpia el contenido existente

        // Crea y añade la representación HTML de cada sensor
        this.sensors.forEach((sensor) => {
            const sensorCard = document.createElement("div");
            sensorCard.className = "column is-one-third";

            // Asigna la estructura HTML de una tarjeta de sensor a la propiedad innerHTML de sensorCard
            sensorCard.innerHTML = `
                <div class="card">                     <!-- Tarjeta del sensor con la clase "card" -->

                    <header class="card-header">       <!-- Cabecera de la tarjeta con el ID del sensor -->
                        <p class="card-header-title">
                            Sensor ID: ${sensor.id}
                        </p>
                    </header>

                    <div class="card-content">         <!-- Contenido principal de la tarjeta -->
                        <div class="content">
                            <p>
                                <strong>Tipo:</strong> ${sensor.type}
                            </p>
                            <p>
                               <strong>Valor:</strong> 
                               ${sensor.value} ${sensor.unit}
                            </p>
                        </div>

                        <time datetime="${sensor.updated_at}">    <!-- Muestra la última actualización del sensor -->
                            Última actualización: ${new Date(sensor.updated_at).toLocaleString()}
                        </time>

                    </div>

                    <footer class="card-footer">     <!-- Pie de la tarjeta con un enlace para actualizar el sensor -->
                        <a href="#" class="card-footer-item update-button" data-id="${sensor.id}">
                            Actualizar               <!-- Botón para actualizar el valor del sensor -->  
                        </a>
                    </footer>
                </div>
            `;
            container.appendChild(sensorCard); // Añade la tarjeta del sensor al contenedor
        });

        // Añade event listeners a los botones de actualizar
        const updateButtons = document.querySelectorAll(".update-button");
        updateButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault(); // Previene el comportamiento por defecto del enlace
                const sensorId = parseInt(button.getAttribute("data-id")); // Obtiene el ID del sensor del atributo data-id
                this.updateSensor(sensorId); // Llama al método para actualizar el sensor
            });
        });
    }
}

// Crea una instancia del SensorManager
const monitor = new SensorManager();

// Carga los sensores desde el archivo "sensors.json" 
monitor.loadSensors("sensors.json");
