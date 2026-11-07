// Set up state and initial variables:

// console.log("JavaScript is working!");

// const canvas = document.getElementById("stockCanvas");

// console.log("Canvas:", canvas);
// console.log("Chart:", typeof Chart);

// const ctx = canvas.getContext("2d");

// new Chart(ctx, {
//     type: "line",

//     data: {
//         labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

//         datasets: [{
//             label: "AAPL",

//             data: [150, 160, 155, 170, 180, 175],

//             borderWidth: 2,

//             tension: 0.3
//         }]
//     },

//     options: {
//         responsive: true,

//         maintainAspectRatio: false
//     }
// });
// ==========================================
// // STOCK MARKET ANALYSIS
// ==========================================


// ==========================================
// // STOCK LIST
// ==========================================

const Stocks = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "PYPL",
    "TSLA",
    "JPM",
    "NVDA",
    "NFLX",
    "DIS"
];


// ==========================================
// VARIABLES
// ==========================================

let selectedStock = "AAPL";

let selectedRange = "1month";

let stockChartData;

let stockStatsData;

let stockProfileData;

let chart;


// ==========================================
// API URLS
// ==========================================

const CHART_API =
    "https://stock-market-api-k9vl.onrender.com/api/stocksdata";

const STATS_API =
    "https://stock-market-api-k9vl.onrender.com/api/stocksstatsdata";

const PROFILE_API =
    "https://stock-market-api-k9vl.onrender.com/api/profiledata";


// ==========================================
// FETCH DATA
// ==========================================

async function fetchData() {

    try {

        console.log("Fetching stock data...");


        // -----------------------------
        // Chart API
        // -----------------------------

        const chartResponse =
            await fetch(CHART_API);


        if (!chartResponse.ok) {

            throw new Error(
                "Chart API request failed"
            );

        }


        stockChartData =
            await chartResponse.json();


        // -----------------------------
        // Stats API
        // -----------------------------

        const statsResponse =
            await fetch(STATS_API);


        if (!statsResponse.ok) {

            throw new Error(
                "Stats API request failed"
            );

        }


        stockStatsData =
            await statsResponse.json();


        // -----------------------------
        // Profile API
        // -----------------------------

        const profileResponse =
            await fetch(PROFILE_API);


        if (!profileResponse.ok) {

            throw new Error(
                "Profile API request failed"
            );

        }


        stockProfileData =
            await profileResponse.json();


        // Display API data in console
        console.log(
            "Chart Data:",
            stockChartData
        );

        console.log(
            "Stats Data:",
            stockStatsData
        );

        console.log(
            "Profile Data:",
            stockProfileData
        );


        // Render application
        renderStockList();

        renderChart();

        renderSummary();


    } catch (error) {

        console.error(
            "Error:",
            error
        );


        document.getElementById(
            "company-summary"
        ).textContent =
            "Unable to load stock data. Please check your internet connection or API.";

    }

}


// ==========================================
// RENDER STOCK LIST
// ==========================================

function renderStockList() {

    const stockList =
        document.getElementById(
            "stock-List"
        );


    stockList.innerHTML = "";


    Stocks.forEach(stock => {

        const div =
            document.createElement("div");


        div.className = "lists";


        div.textContent = stock;


        // Active stock
        if (stock === selectedStock) {

            div.classList.add("active");

        }


        // Click stock
        div.addEventListener(
            "click",
            () => {

                selectedStock = stock;


                renderStockList();

                renderChart();

                renderSummary();

            }
        );


        stockList.appendChild(div);

    });

}


// ==========================================
// GET CHART DATA
// ==========================================

function getChartData() {

    if (!stockChartData) {

        return [];

    }


    const stockData =
        stockChartData[selectedStock];


    if (!stockData) {

        console.error(
            "Stock data not found:",
            selectedStock
        );

        return [];

    }


    const rangeData =
        stockData[selectedRange];


    if (!rangeData) {

        console.error(
            "Range data not found:",
            selectedRange
        );

        return [];

    }


    return rangeData;

}


// ==========================================
// RENDER CHART
// ==========================================

function renderChart() {

    const data =
        getChartData();


    if (
        !data ||
        data.length === 0
    ) {

        console.log(
            "No chart data available"
        );

        return;

    }


    // -----------------------------
    // Labels
    // -----------------------------

    const labels =
        data.map(item => {

            return new Date(
                item.timestamp * 1000
            ).toLocaleDateString();

        });


    // -----------------------------
    // Prices
    // -----------------------------

    const prices =
        data.map(item => {

            return Number(item.price);

        });


    // -----------------------------
    // Canvas
    // -----------------------------

    const canvas =
        document.getElementById(
            "stockCanvas"
        );


    const ctx =
        canvas.getContext("2d");


    // -----------------------------
    // Destroy old chart
    // -----------------------------

    if (chart) {

        chart.destroy();

    }


    // -----------------------------
    // Gradient
    // -----------------------------

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            400
        );


    gradient.addColorStop(
        0,
        "rgba(37, 99, 235, 0.3)"
    );


    gradient.addColorStop(
        1,
        "rgba(37, 99, 235, 0.02)"
    );


    // -----------------------------
    // Create Chart
    // -----------------------------

    chart = new Chart(
        ctx,
        {

            type: "line",


            data: {

                labels: labels,

                datasets: [

                    {

                        label:
                            selectedStock,

                        data:
                            prices,

                        borderWidth: 2,

                        borderColor:
                            "#2563eb",

                        backgroundColor:
                            gradient,

                        fill: true,

                        tension: 0.3,

                        pointRadius: 0,

                        pointHoverRadius: 5

                    }

                ]

            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                interaction: {

                    mode: "index",

                    intersect: false

                },


                plugins: {

                    legend: {

                        display: true

                    },


                    tooltip: {

                        enabled: true

                    }

                },


                scales: {

                    x: {

                        title: {

                            display: true,

                            text: "Date"

                        }

                    },


                    y: {

                        title: {

                            display: true,

                            text: "Price"

                        },

                        beginAtZero: false

                    }

                }

            }

        }
    );


    // Update peak and low
    updatePeakLow(prices);

}


// ==========================================
// PEAK AND LOW
// ==========================================

function updatePeakLow(prices) {

    if (!prices.length) {

        return;

    }


    const peak =
        Math.max(...prices);


    const low =
        Math.min(...prices);


    document.getElementById(
        "peak-value"
    ).textContent =
        "$" + peak.toFixed(2);


    document.getElementById(
        "low-value"
    ).textContent =
        "$" + low.toFixed(2);

}


// ==========================================
// RENDER SUMMARY
// ==========================================

function renderSummary() {

    if (
        !stockStatsData ||
        !stockProfileData
    ) {

        return;

    }


    const stats =
        stockStatsData[selectedStock];


    const profile =
        stockProfileData[selectedStock];


    if (!stats) {

        console.error(
            "Stats not found"
        );

        return;

    }


    // Company name
    document.getElementById(
        "company-name"
    ).textContent =
        selectedStock;


    // Profit
    const profitElement =
        document.getElementById(
            "profit-value"
        );


    const profit =
        Number(stats.profit);


    profitElement.textContent =
        stats.profit;


    // Profit color
    if (profit > 0) {

        profitElement.style.color =
            "green";

    } else {

        profitElement.style.color =
            "red";

    }


    // Company summary
    if (profile) {

        document.getElementById(
            "company-summary"
        ).textContent =
            profile.summary;

    }

}


// ==========================================
// RANGE BUTTONS
// ==========================================

const rangeButtons =
    document.querySelectorAll(
        "#btn button"
    );


rangeButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            // Update selected range
            selectedRange =
                button.dataset.range;


            // Remove active
            rangeButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            // Add active
            button.classList.add(
                "active"
            );


            // Update chart
            renderChart();

        }
    );

});


// ==========================================
// START APPLICATION
// ==========================================

fetchData();






// const stocks = [
//     'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL',
//     'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'
// ];

// let selectedStock = stocks[0];
// let selectedRange = '1month';

// const ctx = document.getElementById('stockChart');

// const stockChart = new Chart(ctx, {
//     type: 'line',
//     data: {
//         labels: [],
//         datasets: [{
//             label: selectedStock,
//             data: [],
//             borderWidth: 2,
//             tension: 0.3
//         }]
//     },
//     options: {
//         responsive: true,
//         interaction: {
//             mode: 'index',
//             intersect: false
//         },
//         plugins: {
//             tooltip: {
//                 callbacks: {
//                     label: function(context) {
//                         return `${selectedStock}: $${context.parsed.y}`;
//                     }
//                 }
//             }
//         }
//     }
// });

// fetch('https://stock-market-api-k9vl.onrender.com/api/stocksstatsdata')
//     .then(response => response.json())
//     .then(data => {
//         const listSection = document.querySelector('.list-section');

//         listSection.innerHTML = '';

//         data.forEach(stock => {
//             const item = document.createElement('div');

//             item.className = 'stock-item';

//             item.innerHTML = `
//                 <span>${stock.name}</span>
//                 <span>${stock.bookValue}</span>
//                 <span class="profit ${stock.profit > 0 ? 'positive' : 'negative'}">
//                     ${stock.profit}%
//                 </span>
//             `;

//             item.addEventListener('click', () => {
//                 selectStock(stock.symbol);
//             });

//             listSection.appendChild(item);
//         });
//     });

// function selectStock(symbol) {
//     selectedStock = symbol;

//     updateChart(selectedStock, selectedRange);
//     updateDetails(selectedStock);
// }

// function updateChart(stock, range) {
//     fetch(
//         `https://stock-market-api-k9vl.onrender.com/api/stocksdata?stock=${stock}&range=${range}`
//     )
//         .then(res => res.json())
//         .then(chartData => {
//             const labels = chartData.map(point =>
//                 new Date(point.timestamp * 1000).toLocaleDateString()
//             );

//             const prices = chartData.map(point => point.price);

//             stockChart.data.labels = labels;
//             stockChart.data.datasets[0].label = stock;
//             stockChart.data.datasets[0].data = prices;

//             stockChart.update();

//             const peak = Math.max(...prices);
//             const low = Math.min(...prices);

//             document.querySelector('.peak').textContent =
//                 `Peak: $${peak}`;

//             document.querySelector('.low').textContent =
//                 `Low: $${low}`;
//         });
// }

// function updateDetails(stock) {
//     fetch(
//         `https://stock-market-api-k9vl.onrender.com/api/profiledata?stock=${stock}`
//     )
//         .then(res => res.json())
//         .then(data => {
//             document.querySelector('.details-section h3').textContent =
//                 data.name;

//             const profitElem =
//                 document.querySelector('.details-section .profit');

//             profitElem.textContent =
//                 `Profit: ${data.profit}%`;

//             profitElem.className =
//                 `profit ${data.profit > 0 ? 'positive' : 'negative'}`;

//             document.querySelector(
//                 '.details-section .book-value'
//             ).textContent =
//                 `Book Value: ${data.bookValue}`;

//             document.querySelector(
//                 '.details-section p'
//             ).textContent =
//                 data.summary;
//         });
// }

// document.querySelectorAll('.range-btn').forEach(button => {
//     button.addEventListener('click', () => {
//         selectedRange = button.dataset.range;
//         updateChart(selectedStock, selectedRange);
//     });
// });

// selectStock(selectedStock);



// const stocks = ['AAPL','MSFT','GOOGL','AMZN','PYPL','TSLA','JPM','NVDA','NFLX','DIS'];
// let selectedStock = stocks[0];
// let selectedRange = '1month';

// // Fetch stock stats when the page loads:
// fetch('https://stock-market-api-k9vl.onrender.com/api/stocksstatsdata')
// .then(response => response.json())
// .then(data => {
// const listSection = document.querySelector('.list-section');
// listSection.innerHTML = '';
// data.forEach(stock => {
// const item = document.createElement('div');
// item.className = 'stock-item';
// item.innerHTML =  `<span>${stock.name}</span>  <span>${stock.bookValue}</span>  <span class="profit ${stock.profit > 0 ? 'positive' : 'negative'}">${stock.profit}%</span> `  ;
// item.addEventListener('click', () => selectStock(stock.symbol));
// listSection.appendChild(item);
// });
// });

// // Add click listeners to stock items:
// function selectStock(symbol) {
// selectedStock = symbol;
// updateChart(selectedStock, selectedRange);
// fetch('https://stock-market-api-k9vl.onrender.com/api/profiledata?stock=${selectedStock}')
// .then(res => res.json())
// .then(data => {
// // Update details section DOM nodes with data (name, profit, bookValue, summary)
// document.querySelector('.details-section h3').textContent = data.name;
// const profitElem = document.querySelector('.details-section .profit');
// profitElem.textContent = 'Profit: ' + data.profit + '%';
// profitElem.className = 'profit ' + (data.profit > 0 ? 'positive' : 'negative');
// document.querySelector('.details-section span:not(.profit)').textContent = 'Book Value: ' + data.bookValue;
// document.querySelector('.details-section p').textContent = data.summary;
// });
// // Fetch and update chart & details sections
// fetch('https://stock-market-api-k9vl.onrender.com/api/stocksdata?stock=${selectedStock}&range=${selectedRange}')
// .then(res => res.json())
// .then(data => {
// const labels = data.map(point => new Date(point.timestamp * 1000).toLocaleDateString());
// const prices = data.map(point => point.price);
// stockChart.data.labels = labels;
// stockChart.data.datasets[0].data = prices;
// stockChart.data.datasets[0].label = selectedStock;
// stockChart.update();
// });

// fetch('https://stock-market-api-k9vl.onrender.com/api/profiledata?stock=${selectedStock}')
// .then(res => res.json())
// .then(data => {
// document.querySelector('.details-section h3').textContent = data.name;
// const profitElem = document.querySelector('.details-section .profit');
// profitElem.textContent = 'Profit: ' + data.profit + '%';
// profitElem.className = 'profit ' + (data.profit > 0 ? 'positive' : 'negative');
// document.querySelector('.details-section span:not(.profit)').textContent = 'Book Value: ' + data.bookValue;
// document.querySelector('.details-section p').textContent = data.summary;
// });


// }

// // Fetch and display chart data:
// function updateChart(stock, range) {
// fetch('https://stock-market-api-k9vl.onrender.com/api/stocksdata?stock=${stock}&range=${range}')
// .then(res => res.json())
// .then(chartData => {
// const labels = chartData.map(point => new Date(point.timestamp * 1000).toLocaleDateString());
// const prices = chartData.map(point => point.price);
// stockChart.data.labels = labels;
// stockChart.data.datasets[0].label = stock;
// stockChart.data.datasets[0].data = prices;
// stockChart.update();
// });
// }

// const stocks = ['AAPL','MSFT','GOOGL','AMZN','PYPL','TSLA','JPM','NVDA','NFLX','DIS'];

// fetch('https://stock-market-api-k9vl.onrender.com/api/stocksstatsdata')
// .then(response => response.json())
// .then(data => {
//     const stockDiv = document.createElement('div');
//     stockDiv.innerHTML = <strong>${stock}</strong> 
//     stockDiv.innerHTML = `Book Value: ${data[stock].bookValue}`
//     stockDiv.innerHTML = `Profit: <span style="color:${data[stock].profit > 0 ? 'green' : 'red'}">${data[stock].profit}</span>;`

    
   
// // Loop through stocks array
// stocks.forEach(stock => {
// // Create a div for each stock and add stats from data
// // Attach click event: update chart and details section
//     stockDiv.addEventListener('click', function() {
//         fetchChartData(stock);
//         fetchProfileData(stock);
//         updateChartUI();
//         updateDetailsUI();
//     });
//     document.getElementById('stock-list').appendChild(stockDiv);
// });
// });

// async function stockstatus(params) {
//     fetch('https://stock-market-api-k9vl.onrender.com/api/stocksdata')
    
// }
// async function stocksstatsdata(params) {
//     fetch('')
    
// }
// async function statuslist(params) {
    
// }

// async function callrender() {
    
// }

// const Stocks = [
//  "AAPL", "MSFT", "GOOGL", "AMZN", "PYPL",
//  "TSLA", "JPM", "NVDA", "NFLX", "DIS"
// ];
// let selectedStock = "AAPL";
// let selectedRange = "1month";
// let stockChartData;
// let stockStatsData;
// let stockProfileData;
// let canvas;
// let ctx;


// async function fetchData() {
//  const chartResponse = await fetch(
//  "https://stock-market-api-k9vl.onrender.com/api/stocksdata"
//  );
//  stockChartData = await chartResponse.json();
//  const statsResponse = await fetch(
//  "https://stock-market-api-k9vl.onrender.com/api/stocksstatsdata"
//  );
//  stockStatsData = await statsResponse.json();
//  const profileResponse = await fetch(
//  "https://stock-market-api-k9vl.onrender.com/api/profiledata"
//  );
//  stockProfileData = await profileResponse.json();
//  renderStockList();
//  renderChart();
//  renderSummary();
// }
// fetchData();


// function renderStockList() {
//  const stockList = document.getElementById("stock-List");
//  stockList.innerHTML = "";
//  Stocks.forEach(stock => {
//  const data = stockStatsData[stock];
//  const div = document.createElement("div");
//  div.className = "lists";
//  div.innerHTML = `
//  ${stock}
//  `;
//  div.addEventListener("click", () => {
//  selectedStock = stock;
//  renderChart();
//  renderSummary();
//  });
//  stockList.appendChild(div);
//  });
// }


// function renderChart() {
//  const data =
//  stockChartData[selectedStock][selectedRange];
//  const labels = data.map(item =>
//  new Date(item.timestamp * 1000)
//  .toLocaleDateString()
//  );
//  const prices = data.map(item => item.price);
//  // Create/update Chart.js chart here
// }

// document.querySelectorAll("#btn button").forEach(button => {
//  button.addEventListener("click", () => {
//  selectedRange = button.dataset.range;
//  renderChart();
//  });
// });

// let chart;
// if (chart) {
//  chart.destroy();
// }
// chart = new Chart(ctx, {
//  type: "line",
//  data: {
//  labels: labels,
//  datasets: [{
//  label: selectedStock,
//  data: prices,
//  borderWidth: 2
//  }]
//  }
// });


// ptions: {
//  interaction: {
//  mode: "index",
//  intersect: false
//  }
// }

// const tooltip = document.getElementById("canva-tool");
// tooltip.style.display = "block";
// tooltip.innerHTML = `
//  ${selectedStock}<br>
//  Price: ${price}<br>
//  Date: ${date}
// `;


// function renderSummary() {
//  const stats = stockStatsData[selectedStock];
//  const profile = stockProfileData[selectedStock];
//  document.getElementById("company-name").textContent =
//  selectedStock;
//  document.getElementById("profit-value").textContent =
//  stats.profit;
//  document.getElementById("company-summary").textContent =
//  profile.summary;
// }

// const profitElement =
//  document.getElementById("profit-value");
// profitElement.textContent = stats.profit;
// if (stats.profit > 0) {
//  profitElement.style.color = "green";
// } else {
//  profitElement.style.color = "red";
// }


// const peak = Math.max(...prices);
// const low = Math.min(...prices);
// document.getElementById("peak-low").innerHTML = `
//  Peak: ${peak} &nbsp;&nbsp;
//  Low: ${low}
// `;
