var width = window.innerWidth - 40;
var height = window.innerHeight - 40;

var scaleWidth = 400;
var scaleHeight = 30;

var svg = d3.select("#content").append("svg").attr("width", width).attr("height", height)

var projection = d3.geoMercator().center([0, 40]).scale(220).translate([width / 2, height / 2]);

var path = d3.geoPath(projection);

var title = svg.append("text")
  .attr("class", "map-title")
  .attr("x", width / 2)
  .attr("y", 30)
  .attr("text-anchor", "middle")
  .style("font-size", "30px")
  .style("fill", "black") // Promijenite boju naslova ovdje
  .text("Covid-19");

var g = svg.append("g");

var zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

svg.call(zoom);

function zoomed(event) {
    g.attr("transform", event.transform);
}

var tooltip = d3.select("#content").append("div")
    .attr("class", "tooltip");

var scaleColor = d3.scaleLinear()
    .domain([0, 100000])
    .range(["lightgreen", "darkgreen"])
    .interpolate(d3.interpolateHcl);
  
    var legendData = [10000, 20000, 40000, 60000, 80000, 100000];var legendHeight = 20;
    var legendHeight = 20;
    var legendWidth = 20;
    var legendSpacing = 10;

var legend = svg.append("g")
.attr("class", "legend")
.attr("transform", `translate(50, ${height - (legendData.length * (legendHeight + legendSpacing))})`);
      


var barWidth = scaleWidth / 10;

legend.selectAll(".legend-square")
  .data(legendData)
  .enter()
  .append("rect")
  .attr("class", "legend-square")
  .attr("x", 0)
  .attr("y", function(d, i) {
    return i * (legendHeight + legendSpacing);
  })
  .attr("width", legendHeight)
  .attr("height", legendHeight)
  .style("fill", function(d) {
    return scaleColor(d);
  });

legend.selectAll(".legend-label")
  .data(legendData)
  .enter()
  .append("text")
  .attr("class", "legend-label")
  .attr("x", legendHeight + 10)
  .attr("y", function(d, i) {
    return (i + 0.5) * (legendHeight + legendSpacing);
  })
  .style("text-anchor", "start")
  .style("alignment-baseline", "middle")
  .style("fill", "white")
  .text(function(d) {
    return `${d}`;
  });

  var legendTitle = legend.append("text")
  .attr("class", "legend-title")
  .attr("x", scaleWidth / 7)
  .attr("y", -26)
  .style("text-anchor", "middle")
  .style("fill", "white")
  .text("COVID DEATH COUNT");


function updateBarChart(countryName, suicideData) {
    const groupedData = Array.from(d3.group(suicideData, d => d.year + d.country));

    const filteredData = groupedData
        .filter(group => group[0].includes(countryName))
        .map(group => {
            const year = group[1][0].year;
            const suicides = d3.sum(group[1], d => parseInt(d.suicides_no));
            return { year, suicides };
        });

    const years = filteredData.map(item => item.year);
    const suicideCounts = filteredData.map(item => item.suicides);
    const totalSuicides = d3.sum(suicideCounts);

    const barChartHeight = 500;
    const barChartWidth = 978;

    const margin = { top: 20, right: 20, bottom: 30, left: 120 };

    const width = barChartWidth - margin.left - margin.right;
    const height = barChartHeight - margin.top - margin.bottom;

    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(suicideCounts)])
        .range([height, 0]);

    const barChart = d3.select("#barchart")
        .html("")
        .append("svg")
        .attr("width", barChartWidth)
        .attr("height", barChartHeight)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    barChart.selectAll(".bar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.suicides))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.suicides))
        .style("fill", "steelblue");

    barChart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    barChart.append("g")
        .call(d3.axisLeft(yScale));

    barChart.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width - 30)
        .attr("y", 480)
        .style("text-anchor", "middle")
        .text("Year");

    barChart.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -50)
        .attr("y", 0 - margin.left + 50)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Suicide Count");

    if (totalSuicides === 0) {
        barChart.html("");
    }
}




function updatePieChart(confirmed, recovered) {

    const total = confirmed-recovered;
    const confirmedPercentage = (total / confirmed) * 100;
    const recoveredPercentage = (recovered / confirmed) * 100;

    const pieData = [
        { label: confirmedPercentage.toFixed(2) + "%", value: total },
        { label: recoveredPercentage.toFixed(2) + "%", value: recovered }
    ];

    const pieWidth = 300;
    const pieHeight = 300;
    const pieRadius = Math.min(pieWidth, pieHeight) / 2;
    const pieX = pieWidth / 2;
    const pieY = pieHeight / 2;

    let pieSvg = d3.select("#piechart svg");

    if (pieSvg.empty()) {
        pieSvg = d3.select("#piechart")
            .append("svg")
            .attr("width", pieWidth)
            .attr("height", pieHeight)
            .style("margin-left", "300px")
            .style("margin-top", "30px");
    } else {
        pieSvg.selectAll("*").remove();
    }

    const pieG = pieSvg.append("g")
        .attr("transform", `translate(${pieX}, ${pieY})`);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(pieRadius);

    const pie = d3.pie()
        .value(d => d.value);

    const arcs = pieG.selectAll("path")
        .data(pie(pieData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => i === 0 ? "red" : "green")
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    arcs.append("title")
        .text(d => `${d.data.label}: ${d.data.value}`);

    pieG.selectAll("text")
        .data(pie(pieData))
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .text(d => d.data.label);

    let legend = d3.select("#piechart .legend");

    if (legend.empty()) {
        legend = d3.select("#piechart")
            .append("svg")
            .attr("class", "legend")
            .attr("transform", `translate(${0}, ${0})`)
            .style("margin-left", "50px");

        const legendData = [
            { label: "Confirmed", color: "red" },
            { label: "Recovered", color: "green" }
        ];

        const legendItem = legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItem.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => d.color);

        legendItem.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(d => d.label);
    } else {
        legend.selectAll(".legend-item").remove();

        const legendData = [
            { label: "Not Recoverd", color: "red" },
            { label: "Recovered", color: "green" }
        ];

        const legendItem = legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItem.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", d => d.color);

        legendItem.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(d => d.label);
    }

    if (total === 0) {
        pieG.html("");
        legend.html("");
    }

}




Promise.all([
    fetch('newWorldTopo.json').then(response => response.json()),
    fetch('covid.json').then(response => response.json())
]).then(([topoData, covidData]) => {

    var countries = topojson.feature(topoData, topoData.objects.newWorld);

    const sortedData = covidData.sort((a, b) => b.Deaths - a.Deaths);

    const countryDeaths = {};
    const countryRecovered = {};
    const countryActive = {};
    const countryConfirmed = {};

    covidData.forEach(data => {
        const country = data['Country/Region'];
        const deaths = data.Deaths;
        if (countryDeaths[country]) {
            countryDeaths[country] += deaths;
        } else {
            countryDeaths[country] = deaths;
        }
    });

    covidData.forEach(data => {
        const country = data['Country/Region'];
        const recovered = data.Recovered;
        if (countryRecovered[country]) {
            countryRecovered[country] += recovered;
        } else {
            countryRecovered[country] = recovered;
        }
    });

    covidData.forEach(data => {
        const country = data['Country/Region'];
        const active = data.Active;
        if (countryActive[country]) {
            countryActive[country] += active;
        } else {
            countryActive[country] = active;
        }
    });

    covidData.forEach(data => {
        const country = data['Country/Region'];
        const confirmed = data.Confirmed;
        if (countryConfirmed[country]) {
            countryConfirmed[country] += confirmed;
        } else {
            countryConfirmed[country] = confirmed;
        }
    });

    g.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .on("mouseover", function (event, d) {
            const countryName = d.properties.name;
            const deathCount = countryDeaths[countryName] || "No data";
            const confirmedCount = countryConfirmed[countryName] || "No data";
            const recoveredCount = countryRecovered[countryName] || "No data";
            const tooltipContent = `Country: ${countryName}<br>Deaths: ${deathCount}<br>Confirmed: ${confirmedCount}
            <br>Recovered: ${recoveredCount}`;


            tooltip
                .html(tooltipContent)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`)
                .style("opacity", 0.9);
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        })
        .style("fill", function (d) {
            const countryName = d.properties.name;
            const deathCount = countryDeaths[countryName] || 0;
            return countryDeaths[countryName] ? scaleColor(deathCount) : "lightgray";
        })

        .on("click", function (event, d) {
            const countryName = d.properties.name;
            const confirmed = countryConfirmed[countryName];
            const recovered = countryRecovered[countryName];
            // updateBarChart(confirmed, recovered);
            updatePieChart(confirmed, recovered);
        })

        //barchart

        const svgWidth = 1800; // Širina SVG elementa
        const svgHeight = 800; // Visina SVG elementa
        
        const svg = d3.select("body").append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
        
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;
        
        const x = d3.scaleBand().range([0, width]).padding(0.1);
        const y = d3.scaleLinear().range([height, 0]);
        
        const h = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        x.domain(sortedData.map(d => d["Country/Region"]));
        y.domain([0, d3.max(sortedData, d => d.Deaths)]);
        
        h.selectAll(".bar")
            .data(sortedData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d["Country/Region"]))
            .attr("y", d => y(d.Deaths))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.Deaths));
        
        h.append("h")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        
        h.append("h")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));
        
        
});

