// Clase que representa una moneda con un código y un nombre
class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

// Clase que maneja la conversión de monedas usando API externa
class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = [];
    }

    //Método asíncrono para obtener la lista de códigos de monedas disponibles`
    async getCurrencies() {
        try {
            // Realiza una petición GET a la API para obtener la lista de monedas
            const response = await fetch(`${this.apiUrl}/currencies`);

            if (!response.ok) {
                throw new Error(`Error al cargar las monedas: ${response.statusText}`);
            }

            //Convierte la respuesta a JSON
            const data = await response.json();

            // Recorre el objeto data y crea instancias de Currency para cada moneda
            for (const code in data) {
                const currency = new Currency(code, data[code]);
                this.currencies.push(currency);// Agrega la moneda a la lista de monedas disponibles
            }
            
        } catch (error) {
            console.error('Error al obtener las monedas:', error);
        }
    }


    /*getCurrencies(apiUrl) {}*/

    //Método asíncrono para realizar la conversión de una moneda a otra
    async convertCurrency(amount, fromCurrency, toCurrency) {   // monto / origen / destino

        if (fromCurrency.code === toCurrency.code) {
            return amount; // Si son la misma moneda, retorna el monto original
        }

        try {

            // Realiza una petición GET al endpoint /latest con los parámetros de conversión
            const response = await fetch(`${this.apiUrl}/latest?amount=${amount}&from=${fromCurrency.code}&to=${toCurrency.code}`);

            if (!response.ok) {
                throw new Error(`Error al realizar la conversión: ${response.statusText}`);
            }

            //Convierte la respuesta a JSON
            const data = await response.json(); 
            return data.rates[toCurrency.code]; // retorno el monto convertido

        } catch (error) {
            console.error('Error al convertir moneda:', error); 
            return null;
        }
    }

    
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies();
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
