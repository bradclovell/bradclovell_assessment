
// List of words
var myWords;
// Dict that maps each word to its severity.
var severityDict;

/*
// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;*/

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = window.innerWidth * 3/4 - margin.left - margin.right,
    height = window.innerHeight * 3/4 - margin.top - margin.bottom;

var svg;
var layout;

var textSizeModifier = 2;

function getCloudsize(wordText, wordCount, totalCount){
  var finalSize;

  var totalArea = width * height;

  totalArea = Math.sqrt(totalArea);
  
  var proportion = wordCount/totalCount;

  finalSize = proportion * totalArea * textSizeModifier / Math.sqrt(wordText.length);


  finalSize = Math.pow(finalSize, 1.3);

  //this.data[index].count/totalCount * 200


  return finalSize;
}


var numSeverityRequestsFinished;

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

  
  let severity = term0Weight / (term0Weight + term1Weight);

  severityDict[word] = severity;

  numSeverityRequestsFinished++;

  if (numSeverityRequestsFinished >= numEntries){
    //alert(severityDict);
    /*for(let key in severityDict){
      alert("Key: " + key + ", Entry: " + severityDict[key]);
    }*/

    drawWordcloud(myWords);
  }
}


function populateSeverityDict(numEntries){
  severityDict = {};

  myWords.forEach((wordObject) => {

    let searchTerm = wordObject.word;
    const regex = /\s+/g;
    searchTerm = searchTerm.replace(regex, "+");
    
    let query = 'https://api.fda.gov/drug/event.json?api_key=' + authKey + '&search=patient.reaction.reactionmeddrapt.exact:"' + searchTerm + '"&count=serious';

    numSeverityRequestsFinished = 0;

    assessment.fda_api(
      query,
      function(data){
        return addSeverityEntry(data, wordObject.word, numEntries);
      }
    );

  });

}


function makeWordcloud(wordsObject){
  myWords = wordsObject;

  populateSeverityDict(20);

}


/**
 * Draws a wordcloud with the desired words and properties
 * 
 * @param {Object} wordsObject object takes form [{word, size, severity}, ... ]
 */
function drawWordcloud(wordsObject){


  // append the svg object to the body of the page
  svg = d3.select("#wordcloud").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
  
  // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
  // Wordcloud features that are different from one word to the other must be here
  layout = d3.layout.cloud()
    .size([width, height])
    .words(myWords.map(function(d) { return {text: d.word, size:d.size}; }))
    .padding(4)        //space between words
    .rotate(function(d) { return Math.floor(Math.random() * 2) * 90; })
    .fontSize(function(d) { return d.size; })      // font size of words
    .on("end", draw);
  layout.start();

}


function getWordColor(wordObject){

  let red = 1;
  let green = 1;
  let blue = 1;

  let severity = severityDict[wordObject.text];

  let differenceFromCenter = Math.abs(severity - .5);


  //
  differenceFromCenter = Math.sqrt(differenceFromCenter);
  //
  
  if (severity > .5){
    green -= differenceFromCenter * 2;
    blue  -= differenceFromCenter * 2;
  }
  else {
    red   -= differenceFromCenter * 2;
    green -= differenceFromCenter * 2;
  }

  return "rgb(" + Math.floor(red * 256) + "," + Math.floor(green * 256) + "," + Math.floor(blue * 256) + ")";
}


// This function takes the output of 'layout' above and draw the words
// Wordcloud features that are THE SAME from one word to the other can be here
function draw(words) {
  svg
    .append("g")
      .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .attr("font-size", function(d) { return d.size; })
        .style("fill", function(d) {return getWordColor(d);})
        .attr("text-anchor", "middle")
        .style("font-family", "Impact")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
}