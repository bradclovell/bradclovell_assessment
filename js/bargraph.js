// set the dimensions and margins of the graph
var bar_margin = {top: 20, right: 30, bottom: 70, left: 220},
bar_width = window.innerWidth / 3 - bar_margin.left - bar_margin.right,
bar_height = window.innerHeight * 5/12 - bar_margin.top - bar_margin.bottom;


function drawBargraph(){

  document.getElementById("reaction_graph").innerHTML = "";

  // append the svg object to the body of the page
  var svg = d3.select("#reaction_graph")
  .append("svg")
  .attr("width", bar_width + bar_margin.left + bar_margin.right)
  .attr("height", bar_height + bar_margin.top + bar_margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + bar_margin.left + "," + bar_margin.top + ")");
  
  data = myWords;

  // Add X axis
  var x = d3.scaleLinear()
  .domain([0, data[0].size / 1000]) // Data displayed in thousands
  .range([ 0, bar_width])

  svg.append("g")
  .attr("transform", "translate(0," + bar_height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
  .attr("transform", "translate(0,5)")
  .style("text-anchor", "middle");

  // Y axis
  var y = d3.scaleBand()
  .range([ 0, bar_height ])
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
  .attr("width", function(d) { return x(d.size/1000); }) // Data displayed in thousands
  .attr("height", y.bandwidth() )
  .attr("fill", function(d){ return getWordColor(d.word); }).attr("class","bars")


  // text label for the x axis
  svg.append("text")
  .attr("transform",
          "translate(" + (bar_width/2) + " ," + 
                      (bar_height + bar_margin.top + 35) + ")")
  .style("text-anchor", "middle")
  .text("# CO-OCCURRING EVENTS (THOUSANDS)").attr("class", "axislabel")

  // text label for the y axis
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - bar_margin.left)
  .attr("x",0 - (bar_height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("DRUG REACTION SYMPTOM").attr("class", "axislabel")

}