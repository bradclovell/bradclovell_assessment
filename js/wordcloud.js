//
// Note: Some D3.js code below is based on code form the following instructional resource:
// https://www.d3-graph-gallery.com/wordcloud
//



// List of coreations with number of appearances.
var coreactions;
// Dict that maps each coreaction to its seriousness.
var severityDict;


// The authentication key I secured for access to the FDA API.
const AUTH_KEY = "J29rmYpDaiZHD3k0z5rwJOdLMhsFLdXdesOrbZl6";

// Sets the dimensions and margins of the wordcloud.
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = window.innerWidth * 7/16 - margin.left - margin.right,
    height = window.innerHeight * 13/16 - margin.top - margin.bottom;


// Multiplier that modifies wordcloud text size.
const TEXT_SIZE_MODIFIER = 1.6;

/**
 * Takes a word and its frequency and returns a processed font size for display in the word cloud.
 * 
 * @param {string} wordText The word itself.
 * @param {number} wordCount The word's number of occurrences.
 */
function getCloudsize(wordText, wordCount){
  var finalSize;

  // Total area of wordcloud
  var totalArea = width * height;

  // Get linearized analogue for area
  totalArea = Math.sqrt(totalArea);
  
  // Proportion of space that should be devoted to this word
  var proportion = wordCount/totalCount;

  // Get desired final size, adjusted roughly for word length
  finalSize = proportion * totalArea * TEXT_SIZE_MODIFIER / Math.sqrt(wordText.length);

  // Make size differences more dramatic
  finalSize = Math.pow(finalSize, 1.3);

  return finalSize;
}


/**
 * Causes all three graphs to update with the appropriate search term.
 * 
 * @param {string} searchTerm The reaction name being searched for.
 */
function createGraphing(searchTerm){

  // Format query properly and start the API call.
  const regex = /\s+/g;
  searchTerm = searchTerm.replace(regex, "+");
  
  var query = 'https://api.fda.gov/drug/event.json?api_key=' + AUTH_KEY + '&search=patient.reaction.reactionmeddrapt.exact:"' + searchTerm + '"&count=patient.reaction.reactionmeddrapt.exact'
  assessment.fda_api(
    query,
    graphingCallback // Starts process of updating the wordcloud and reaction bar graph.
  );
  
  // Starts the process of updating the drug ranking data and graph.
  drawDrugGraph(searchTerm);
}

// Total count of events considered
var totalCount;

/**
 * Callback that processes comorbid reactions query.
 * 
 * @param {Object} data Information returned by the initial query for comorbid reactions.
 */
function graphingCallback(data){

  // Get count of all events among those considered.
  totalCount = 0;
  for (let entry = 1; entry <= 20; entry ++){
    totalCount += data[entry].count;
  }

  // Create object of top reaction names and their frequencies.
  var reactions = []
  for (let index = 1; index <= 20; index ++){
    reactions.push({ word: data[index].term, size: data[index].count });
  }

  // Move on to graphing phase
  makeWordcloud(reactions);
}


// Number of queries returned so far.
var numSeverityRequestsFinished;

/**
 * Populates the seriousness dictionary that determines wordcloud word color.
 * 
 * @param data Response to the seriousness query.
 * @param word Word being queried.
 * @param numEntries Total number of queries that need to return before moving on and displaying the graph.
 */
function addSeverityEntry(data, word, numEntries){

  let term0 = data[0].term;
  let term0Weight = data[0].count;

  let term1 = data[1].term;
  let term1Weight = data[1].count;

  // 1 corresponds to a serious event in the API
  // 2 corresponds to a non-serious event

  // Make term0 represent serious events
  if (term0 != 1){
    // Switch term variables
    let tempTerm = term0;
    let tempTermWeight = term0Weight;

    term0 = term1;
    term0Weight = term1Weight;

    term1 = tempTerm;
    term1Weight = tempTermWeight;
  }

  
  // Proportion of serious to total events
  let severity = term0Weight / (term0Weight + term1Weight);

  // Create dictionary entry
  severityDict[word] = severity;


  // Confirm that the query has been processed.
  numSeverityRequestsFinished++;

  // Once all numEntries queries have been processed, move on to the drawing phase of making the wordcloud.
  if (numSeverityRequestsFinished >= numEntries){
    drawWordcloud(coreactions);
  }
}

/**
 * Submit all queries for seriousness to the API
 * 
 * @param {number} numEntries Total number of queries that have to be made to find seriousness of all comorbid reactions.
 */
function populateSeverityDict(numEntries){
  // Clear dictionary.
  severityDict = {};

  // Create a query for each co-reaction.
  coreactions.forEach((wordObject) => {

    // Process search term properly.
    let searchTerm = wordObject.word;
    const regex = /\s+/g;
    searchTerm = searchTerm.replace(regex, "+");
    
    let query = 'https://api.fda.gov/drug/event.json?api_key=' + AUTH_KEY + '&search=patient.reaction.reactionmeddrapt.exact:"' + searchTerm + '"&count=serious';

    // Reset number of queries returned to zero
    numSeverityRequestsFinished = 0;

    // Call API to find seriousness.
    assessment.fda_api(
      query,
      function(data){
        return addSeverityEntry(data, wordObject.word, numEntries);
      }
    );

  });

}

/**
 * Starts querying API given information from the initial co-reaction query.
 * 
 * @param {Object} wordsObject Reactions and their frequencies
 */
function makeWordcloud(wordsObject){
  coreactions = wordsObject;

  // Sort coreactions in descending order of frequency. This is important for the bar graph to display correctly.
  coreactions.sort((a, b) => {return b.size - a.size});

  // Start submitting queries for the seriousness/color of the wordcloud words.
  populateSeverityDict(20);

}


// Variables needed to render and add the wordcloud.
var svg;
var layout;


/**
 * Draws a wordcloud with the desired words and properties
 * 
 * @param {Object} wordsObject object takes form [{word, size, severity}, ... ]
 */
function drawWordcloud(wordsObject){

  // Once the data are ready to be rendered by the wordcloud,
  // they are also ready to be rendered by the top bargraph.
  drawBargraph(coreactions);

  document.getElementById("wordcloud").innerHTML = "";

  // Appends the svg object to the correct HTML div.
  svg = d3.select("#wordcloud").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
  
  // Create a layout for the wordcloud
  layout = d3.layout.cloud()
    .size([width, height])
    .words(coreactions.map(function(d) { return {text: d.word, size: getCloudsize(d.word, d.size)}; }))
    .padding(4)        //space between words
    .rotate(function(d) { return Math.floor(Math.random() * 2) * 90; }) // Words can only be vertical or horizontal. (Other variations don't seem to look as nice for my purposes.)
    .fontSize(function(d) { return d.size;  })
    .on("end", draw);
  layout.start();

}

/**
 * Takes the reaction and uses the already-populated severity/seriousness dictionary to return the appropriate color.
 * 
 * @param {string} word Word to be colored in the wordcloud/bar graph.
 */
function getWordColor(word){

  let red = 1;
  let green = 1;
  let blue = 1;

  let severity = severityDict[word];

  // Difference from .5 seriousness ratio
  let differenceFromCenter = Math.abs(severity - .5);


  // Makes color differences more obvious.
  differenceFromCenter = Math.sqrt(differenceFromCenter);
  
  // If ratio is above .5, word is made redder, else word is made bluer
  if (severity > .5){
    green -= differenceFromCenter * 2;
    blue  -= differenceFromCenter * 2;
  }
  else {
    red   -= differenceFromCenter * 2;
    green -= differenceFromCenter * 2;
  }

  // Return as rgb color
  return "rgb(" + Math.floor(red * 256) + "," + Math.floor(green * 256) + "," + Math.floor(blue * 256) + ")";
}


/**
 * Callback that draws and adds the SVG using the layout generated above.
 * 
 * @param {Object} words Product of layout d3 operation from the drawWordCloud function.
 */
function draw(words) {

  svg
    .append("g")
      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .attr("font-size", function(d) { return d.size; })
        .style("fill", function(d) {return getWordColor(d.text);}) // Get proper word color for each word
        .attr("text-anchor", "middle")
        .style("font-family", "Mouse Memoirs") // Narrow font
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  
}
