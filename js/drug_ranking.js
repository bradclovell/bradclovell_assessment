//
// Note: Some D3.js code below is based on code form the following instructional resource:
// https://www.d3-graph-gallery.com/graph/barplot_horizontal.html
// https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
//





/**
 * Takes a reaction name and makes a query to find the most common associated drugs.
 * 
 * @param {string} searchTerm The reaction being searched by the user.
 */
function drawDrugGraph(searchTerm){

  // Format and submit query.
  const regex = /\s+/g;
  searchTerm = searchTerm.replace(regex, "+");
  
  var query = 'https://api.fda.gov/drug/event.json?api_key=' + AUTH_KEY + '&search=patient.reaction.reactionmeddrapt.exact:"' + searchTerm + '"&count=patient.drug.openfda.substance_name.exact';
  assessment.fda_api(
    query,
    drugGraphCallback
  );
  
}

// Number of top co-occurring drugs to be considered and displayed.
const NUM_DRUGS = 20;

/**
 * Callback from the associated drugs query.
 * 
 * @param {Object} data Drug data returned by query.
 */
function drugGraphCallback(data){

  // Get list of most commonly associated drugs from adverse drug events data.
  var drugs = [];
  for (let index = 0; index < NUM_DRUGS; index ++){
    drugs.push({ word: data[index].term, size: data[index].count });
  }

  drugTerms = drugs;

  printDrugGraph();
}


// Set dimensions and margins for lower bar graph.
var drug_margin = {top: 20, right: 30, bottom: 70, left: 220},
drug_width = window.innerWidth / 3 - drug_margin.left - drug_margin.right,
drug_height = window.innerHeight * 5/12 - drug_margin.top - drug_margin.bottom;


/**
 * Uses D3.js to render the associated drugs bar graph.
 */
function printDrugGraph(){

  // Clear drug graph div in HTML
  document.getElementById("drug_graph").innerHTML = "";

  // Append the svg object to the appropriate HTML div.
  var svg = d3.select("#drug_graph")
  .append("svg")
  .attr("width", drug_width + drug_margin.left + drug_margin.right)
  .attr("height", drug_height + drug_margin.top + drug_margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + drug_margin.left + "," + drug_margin.top + ")");
  
  data = drugTerms;

  // Add X axis.
  var x = d3.scaleLinear()
  .domain([0, data[0].size / 1000]) // Data displayed in thousands
  .range([ 0, drug_width]);

  svg.append("g")
  .attr("transform", "translate(0," + drug_height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
  .attr("transform", "translate(0,5)")
  .style("text-anchor", "middle");

  // Add Y axis.
  var y = d3.scaleBand()
  .range([ 0, drug_height ])
  .domain(data.map(function(d) { return d.word; }))
  .padding(.1);

  svg.append("g")
  .call(d3.axisLeft(y));


  //Bars
  svg.selectAll("myRect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", x(0) )
  .attr("y", function(d) { return y(d.word); })
  .attr("width", function(d) { return x(d.size / 1000); }) // Data displayed in thousands
  .attr("height", y.bandwidth() )
  .attr("fill", function(d){ return "yellow"; }).attr("class","bars");


  // Create label for the X axis.
  svg.append("text")             
  .attr("transform",
          "translate(" + (drug_width/2) + " ," + 
                      (drug_height + drug_margin.top + 35) + ")")
  .style("text-anchor", "middle")
  .text("# EVENTS WITH DRUG (THOUSANDS)").attr("class", "axislabel");

  // Create label for the Y axis.
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - drug_margin.left)
  .attr("x",0 - (drug_height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("DRUG SUBSTANCE").attr("class", "axislabel");

}


