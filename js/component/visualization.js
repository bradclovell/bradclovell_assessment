/**
 * Visualize the results of an API call to the FDA.
 */
component.visualization = function() {
  component.apply(this, arguments);
};
assessment.extend(component.visualization, component);

/**
 * Decorate.
 *
 * @param {HTMLDivElement} parent
 */
component.visualization.prototype.decorate = function(parent) {
  var self = this;
  var container = document.createElement('div');
  parent.appendChild(container);

  // Show basic loading text until the API call to the FDA completes.
  var loading = document.createElement('div');
  //loading.innerText = 'Loading...';
  container.appendChild(loading);

  /**
   * Here are some other ideas:
   *
   * Route summary for all human prescription drugs
   * https://api.fda.gov/drug/label.json?search=openfda.product_type.exact:"HUMAN PRESCRIPTION DRUG"&count=openfda.route.exact
   *
   * Brand names for all drugs containing ibuprofen as an active ingredient
   * https://api.fda.gov/drug/label.json?search=active_ingredient:ibuprofen&count=openfda.brand_name.exact
   *
   * Routes for all drugs that treat headaches
   * https://api.fda.gov/drug/label.json?search=indications_and_usage:headache&count=openfda.route.exact
   *
   * Manufacturers of all congestion medications
   * https://api.fda.gov/drug/label.json?search=indications_and_usage:congestion&count=openfda.manufacturer_name.exact
   *
   * Substances contained in medications that have a warning for dizziness
   * https://api.fda.gov/drug/label.json?search=warnings:dizziness&count=openfda.substance_name.exact
   *
   * Frequency of boxed warning use over time
   * https://api.fda.gov/drug/label.json?search=effective_time:20090601+TO+20181008&count=effective_time
   * https://api.fda.gov/drug/label.json?search=(effective_time:20090601+TO+20181008)+AND+_exists_:boxed_warning&count=effective_time
   *
   * Frequency of the phrase "ice cream" in food recalls grouped by recalling company
   * https://api.fda.gov/food/enforcement.json?search=reason_for_recall:%22ice+cream%22&count=recalling_firm.exact
   */


  var searchTerm = "off label use";
  const regex = /\s+/g;
  searchTerm = searchTerm.replace(regex, "+");
  
  var query = 'https://api.fda.gov/drug/event.json?api_key=' + authKey + '&search=patient.reaction.reactionmeddrapt.exact:"' + searchTerm + '"&count=patient.reaction.reactionmeddrapt.exact'
  assessment.fda_api(
    //'https://api.fda.gov/drug/label.json?search=openfda.product_type.exact:"HUMAN PRESCRIPTION DRUG"&count=openfda.route.exact',
    query,
    function(data) {
      self.data = data;
      self.decorate_data(container);
    }
  );
};

// FDA API Authentication Key:
const authKey = "J29rmYpDaiZHD3k0z5rwJOdLMhsFLdXdesOrbZl6";


/**
 * TODO
 *
 * @param {HTMLElement} parent
 */
component.visualization.prototype.decorate_data = function(parent) {
  //parent.innerHTML = '<pre>' + JSON.stringify(this.data, null, '  ') + '</pre>';


  createGraphing("headache");

  /*
  var totalCount = 0;
  for (let entry = 1; entry <= 20; entry ++){
    totalCount += this.data[entry].count;
  }

  var reactions = []
  for (let index = 1; index <= 20; index ++){
    reactions.push({ word: this.data[index].term, size: getCloudsize(this.data[index].term, this.data[index].count, totalCount) });
  }


  //var reactions = [{word: "Running", size: "10"}, {word: "Surfing", size: "20"}, {word: "Climbing", size: "50"}, {word: "Kiting", size: "30"}, {word: "Sailing", size: "20"}, {word: "Snowboarding", size: "60"} ];

  makeWordcloud(reactions);*/
};


