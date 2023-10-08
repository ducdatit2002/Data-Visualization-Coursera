function loadData() {
    return Promise.all([
        d3.csv("routes.csv"),
        d3.json("countries.geo.json"),
    ]).then(datasets => {
        store.routes = datasets[0];
        store.geoJSON = datasets[1];
        return store;
    })
}

function showData() {
    let routes = store.routes;
    // Compute the number of routes per airline.
    let airlines = groupByAirline(routes);
    console.log(airlines);
    // Draw airlines barchart and draw base map
    drawAirlinesChart(airlines);
    drawMap(store.geoJSON);
    // Draw airports on  top of base map 
    let airports = groupByAirport(store.routes);
    drawAirports(airports);
}

function groupByAirline(data) {
    //Iterate over each route, producing a dictionary where the keys are the airlines IDs and the values are the properties of the airline
    let result = data.reduce((result, d) => {
        let currentData = result[d.AirlineID] || {
            "AirlineID": d.AirlineID,
            "AirlineName": d.AirlineName,
            "Count": 0
        }

        currentData.Count += 1;
        result[d.AirlineID] = currentData;

        return result;
    }, {});

    //Convert result into a list
    result = Object.keys(result).map(key => result[key])
    result.sort(function (d1, d2) {
        return d3.descending(d1.Count, d2.Count);            
    });

    return result;
}

function drawAirlinesChart(airlines) {
    let config = getAirlinesChartConfig();
    let scales = getAirlinesChartScales(airlines, config);
    drawBarsAirlinesChart(airlines, scales, config);
    drawAxesAirlinesChart(airlines, scales, config);
}

function drawMap(geoJson) {
    let config = getMapConfig();
    let projection = getMapProjection(config)
    drawBaseMap(config.container, geoJson.features, projection)
}

function getAirlinesChartConfig() {
    // Sets barchart SVG dimensions and returns an object with the dim of the actual barchart
    let width = 350;
    let height = 400;
    let margin = {
        top: 10,
        bottom: 50,
        left: 130,
        right: 10
    }
    //The body is the area that will be occupied by the bars.
    let bodyHeight = height - margin.top - margin.bottom;
    let bodyWidth = width - margin.right - margin.left;

    //Container is the barchart SVG
    let container = d3.select("#AirlinesChart");
    container.attr("width", width);
    container.attr("height", height);

    return { width, height, margin, bodyHeight, bodyWidth, container }
}

function getAirlinesChartScales(airlines, config) {
        let { bodyWidth, bodyHeight } = config;
        let maximumCount = d3.max(airlines, d => d.Count);

        let xScale = d3.scaleLinear()
            .domain([0, maximumCount])
            .range([0, bodyWidth])

        let yScale = d3.scaleBand()
            .domain(airlines.map(a => a.AirlineName)) //The domain is the list of airlines names
            .range([0, bodyHeight])
            .padding(0.2)

        return { xScale, yScale }
}

function drawBarsAirlinesChart(airlines, scales, config) {
    let { margin, container } = config;
    let { xScale, yScale } = scales;

    let body = container.append("g")
        .style("transform",
            `translate(${margin.left}px,${margin.top}px)`)

    let bars = body.selectAll(".bar").data(airlines);

    //Draw a rect tag for each airline
    bars.enter().append("rect")
        .attr("height", yScale.bandwidth())
        .attr("y", (d) => yScale(d.AirlineName))
        .attr("width", (d) => xScale(d.Count))
        .attr("fill", "#2a5599")
        .on("mouseenter", function(d) {
            drawRoutes(d.AirlineID);
            this.style.fill = "#992a5b";
        })
        .on("mouseleave", function(d) {
            drawRoutes(null);
            this.style.fill = "#2a5599";
        })
}

function drawAxesAirlinesChart(airlines, scales, config) {
    let { xScale, yScale } = scales;
    let { container, margin, height } = config;
    let axisX = d3.axisBottom(xScale)
        .ticks(5)

    container.append("g")
        .style("transform",
            `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)

    let axisY = d3.axisLeft(yScale);

    container.append("g")
        .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY)
}

function getMapConfig(){
    // Set and return information of the size of the map
    let width = 600;
    let height = 400;
    let container = d3.select("#Map")

    container.attr("width", width);
    container.attr("height", height);

    return {width, height, container}
}

function getMapProjection(config) {
    // Create and return projection
    let { width, height } = config;

    let projection = d3.geoMercator();
    projection.scale(97)
        .translate([width / 2, height / 2 + 20])

    store.mapProjection = projection;   // Save in store for easy access
    return projection;
}

function drawBaseMap(container, countries, projection) {
    // Draw base map by using path generator
    let path = d3.geoPath()
        .projection(projection)

    container.selectAll("path").data(countries)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#ccc")
        .attr("fill", "#eee")
}

function groupByAirport(data) {

    // Transform the list (data) into a object where each key points to a unique airport
    let result = data.reduce((result, d) => {

        // Create a new object for the current destination airport only if it is the first time we are iterating over it
        let currentDest = result[d.DestAirportID] || {
            "AirportID": d.DestAirportID,
            "Airport": d.DestAirport,
            "Latitude": +d.DestLatitude,
            "Longitude": +d.DestLongitude,
            "City": d.DestCity,
            "Country": d.DestCountry,
            "Count": 0
        }
        currentDest.Count += 1
        result[d.DestAirportID] = currentDest

        // Same as above, but for the current source airport
        let currentSource = result[d.SourceAirportID] || {
            "AirportID": d.SourceAirportID,
            "Airport": d.SourceAirport,
            "Latitude": +d.SourceLatitude,
            "Longitude": +d.SourceLongitude,
            "City": d.SourceCity,
            "Country": d.SourceCountry,
            "Count": 0
        }
        currentSource.Count += 1
        result[d.SourceAirportID] = currentSource

        return result
    }, {})

    // Transform the object result into a list.
    result = Object.keys(result).map(key => result[key])
    return result
}

function drawAirports(airports) {
    // Draw airport location on top of the base map
    let config = getMapConfig();
    let projection = getMapProjection(config);
    let container = config.container;

    let circles = container.selectAll("circle")
    
    circles.data(airports)
        .enter()
        .append("circle")
        .attr("r", 1)
        .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
        .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
        .attr("fill", "#2a5599")
}

function drawRoutes(airlineID) {
    let routes = store.routes;
    let projection = store.mapProjection;
    let container = d3.select("#Map");
    let selectedRoutes = routes.filter(function(route) {
        return route.AirlineID === airlineID;
    })
    
    let bindedData = container.selectAll("line")
        .data(selectedRoutes, d => d.ID) // ID helps correctly identify which routes have been added or removed
    
    bindedData.enter()
        .append("line")
        .attr("x1", d => projection([d.SourceLongitude, d.SourceLatitude])[0])
        .attr("y1", d => projection([d.SourceLongitude, d.SourceLatitude])[1])
        .attr("x2", d => projection([d.DestLongitude, d.DestLatitude])[0])
        .attr("y2", d => projection([d.DestLongitude, d.DestLatitude])[1])
        .attr("stroke", "#992a2a")
        .attr("opacity", 0.1)
    
    bindedData.exit().remove();
}

// Store: global variable to store data for easy access
let store = {};
loadData().then(showData);
