//Global Leaflet Map variables

var myMap = null;
var div = d3.select("#leaflet-container").append("div").attr("id","leafletmap");
var geoLayer = null;
var JSONData = null;
var popup = L.popup()

//State variables
var selectedVis = null;

//Data set variables

var entireData = null;
var cf = null
var gradesDimension = null;
var numStudents = null;




//Adds the map to the page
function drawMapInitial()
{
    myMap = new L.Map("leafletmap", {center: [-10.3333,-53.2], zoom: 4}).addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
}

//Responsible for creating the legend
//Creates a series of small rectangles with the colors of the scale, to represent the scale.
var addLegend = function(target, transformer, width)
{
    textMargin = 30
    leftMargin = 15
    
    //Besides the size of the rectangle, we also leave a small margin for the text.
    let svg = target.append("svg").attr("width",width + leftMargin + 30).attr("height",20 + textMargin + 5).attr("id","legend")

    let squareWidth = 5

    let [lb,ub] = transformer.domain()

    //A scale to convert the position of the rectangle to a color.
    let posScaler = d3.scaleLinear().domain([0,width]).range(transformer.domain())

    //Adding the text with the upper and lower bounds of the scale.
    svg.append("text").attr("x",0).attr("y",15).text(lb)
    svg.append("text").attr("x",width - squareWidth).attr("y",15).text(ub)

	for(let pos = 0; pos < width; pos += squareWidth)
	{
		v = posScaler(pos)

		svg.append("rect").attr("x",leftMargin + pos).attr("y",textMargin+5).attr("width",squareWidth).attr("height",20).attr("fill",transformer(v)).attr("v",v).attr("fill-opacity",0.3)
	}
}

//This function is called whenever a new visualization is selected, i.e. when either the radio buttons or dropdown change value.
var callbackSelectVis = function(event)
{ 
    let radioValue = document.querySelector('input[name="w"]:checked').value;
    
    let de = document.querySelector('select#dropdown')
    let dropdownValue = de.options[de.selectedIndex].value;    
     
    let vis = radioValue + '-' + dropdownValue
    selectedVis = dropdownValue
    
    //Cleaning up what was already there    
    d3.select("svg#legend").remove()
   	
   	if(geoLayer != null)
   	{
   	    myMap.removeLayer(geoLayer)
   	}
	
    
    if(radioValue == "vis1")
    {
        cb = drawStatesVis
    }
    else if(radioValue == "vis2")
    {
        cb = drawInstitutionsVis
    }

    fillTextDiv(vis)
    
    //If we have not yet loaded the GeoJSON, do it now. Otherwise, avoid loading it multiple times, since disk I/O is slow.
    if(JSONData == null)
    {
        d3.json('project_files/brazil-states.geojson',cb)
    }
    else
    {
        cb(null, null)
    }
}


//Add the event listeners
var formElement = document.querySelector('form#selectvis')
formElement.addEventListener('change', callbackSelectVis);

var dropdownElement = document.querySelector('select#dropdown')
dropdownElement.addEventListener('change', callbackSelectVis);



drawMapInitial()

