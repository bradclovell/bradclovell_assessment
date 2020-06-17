


function drawDrugGraph(searchTerm){

  const regex = /\s+/g;
  searchTerm = searchTerm.replace(regex, "+");

  var returnedData;
  
  var query = 'https://api.fda.gov/drug/event.json?api_key=' + AUTH_KEY + '&search=patient.reaction.reactionmeddrapt.exact:"' + searchTerm + '"&count=patient.drug.openfda.substance_name.exact';
  assessment.fda_api(
    query,
    drugGraphCallback
  );
  
  
}

function drugGraphCallback(data){

  //alert(JSON.stringify(data, null, '  '));
  
  var totalCount = 0;
  for (let entry = 0; entry < 20; entry ++){
    totalCount += data[entry].count;
  }

  var drugs = [];
  for (let index = 0; index < 20; index ++){
    drugs.push({ word: data[index].term, size: data[index].count });
  }

  drugTerms = drugs;

  printDrugGraph();
}










// set the dimensions and margins of the graph
var drug_margin = {top: 20, right: 30, bottom: 70, left: 220},
drug_width = window.innerWidth / 3 - drug_margin.left - drug_margin.right,
drug_height = window.innerHeight * 5/12 - drug_margin.top - drug_margin.bottom;


function printDrugGraph(){

  document.getElementById("drug_graph").innerHTML = "";

  // append the svg object to the body of the page
  var svg = d3.select("#drug_graph")
  .append("svg")
  .attr("width", drug_width + drug_margin.left + drug_margin.right)
  .attr("height", drug_height + drug_margin.top + drug_margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + drug_margin.left + "," + drug_margin.top + ")");
  
  data = drugTerms;

  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, data[0].size / 1000]) // Data displayed in thousands
  .range([ 0, drug_width])

  svg.append("g")
  .attr("transform", "translate(0," + drug_height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
  .attr("transform", "translate(0,5)")
  .style("text-anchor", "middle");

  // Y axis
  var y = d3.scaleBand()
  .range([ 0, drug_height ])
  .domain(data.map(function(d) { return d.word; }))
  .padding(.1)

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
  .attr("fill", function(d){ return "yellow"; }).attr("class","bars")


  // text label for the x axis
  svg.append("text")             
  .attr("transform",
          "translate(" + (drug_width/2) + " ," + 
                      (drug_height + drug_margin.top + 35) + ")")
  .style("text-anchor", "middle")
  .text("# EVENTS WITH DRUG (THOUSANDS)").attr("class", "axislabel")

  // text label for the y axis
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - drug_margin.left)
  .attr("x",0 - (drug_height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("DRUG SUBSTANCE").attr("class", "axislabel")

}


