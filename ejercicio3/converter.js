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

    //Método asíncrono para realizar la conversión de una moneda a otra
    async convertCurrency(amount, fromCurrency, toCurrency) {   // monto / origen / destino

        if (fromCurrency.code === toCurrency.code) {
            return parseFloat(amount); // Si son la misma moneda, retorna el monto original
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

    async getExchangeRates(date) {
        try {
            const response = await fetch(`${this.apiUrl}/${date}`);
            const data = await response.json();
            return data.rates;
        } catch (error) {
            console.error(`Error ${date}:`, error);
            return null;
        }
    }

    async differenceExchangeRates(toCurrencyCode) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const formattedYesterday = yesterday.toISOString().split('T')[0];
        const urlToday = `${this.apiUrl}/latest`;
        const urlYesterday = `${this.apiUrl}/${formattedYesterday}`;

        try {
            const responseToday = await fetch(urlToday);
            const dataToday = await responseToday.json();

            const responseYesterday = await fetch(urlYesterday);
            const dataYesterday = await responseYesterday.json();

            const rateToday = dataToday.rates[toCurrencyCode];
            const rateYesterday = dataYesterday.rates[toCurrencyCode];
            const difference = rateToday - rateYesterday;

            return { rateToday, rateYesterday, difference };
        } catch (error) {
            console.error('Error al comparar las tasas de cambio:', error);
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

            const { rateToday, rateYesterday, difference } = await converter.differenceExchangeRates(toCurrency.code);

            resultDiv.innerHTML = `
                ${amount} ${fromCurrency.code} son ${convertedAmount.toFixed(2)} ${toCurrency.code}<br>
                Tasa de cambio de hoy: ${rateToday}<br>
                Tasa de cambio de ayer: ${rateYesterday}<br>
                Diferencia: ${difference.toFixed(4)}`;

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
