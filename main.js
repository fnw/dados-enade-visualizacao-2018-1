//Variáveis globais do mapa do Leaflet

var myMap = null;
var div = d3.select("body").append("div").attr("id","leafletmap");
var geoLayer = null;
var JSONData = null;
var popup = L.popup()

//Variáveis de estado
var selectedVis = null;

//Variáveis de dados

var entireData = null;
var cf = null
var gradesDimension = null;
var numStudents = null;


//Seletores e callbacks

//Funções
function drawMapInitial()
{
    myMap = new L.Map("leafletmap", {center: [-10.3333,-53.2], zoom: 4}).addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
}

//Função que faz a legenda
//Cria uma série de pequenos retângulos com as cores da escala, para representar a escala.
var addLegend = function(target, transformer, width)
{
    textMargin = 30
    leftMargin = 15
    //Eu usei let aqui porque eu vi um exemplo de coisas dando errado com var quando você usa múltiplas cópias de uma mesma função de certas formas.
    //Além do tamanho dos retângulos, deixamos uma margem para o texto.
    let svg = target.append("svg").attr("width",width + leftMargin + 30).attr("height",20 + textMargin + 5).attr("id","legend")

    let squareWidth = 5

    let [lb,ub] = transformer.domain()

    //Uma escala para converter a posição do retângulo no svg para uma cor da escala.
    let posScaler = d3.scaleLinear().domain([0,width]).range(transformer.domain())

    //Adicionando o texto com os limites superiores e inferiores da escala.
    svg.append("text").attr("x",0).attr("y",15).text(lb)
    svg.append("text").attr("x",width - squareWidth).attr("y",15).text(ub)

	for(let pos = 0; pos < width; pos += squareWidth)
	{
		v = posScaler(pos)

		svg.append("rect").attr("x",leftMargin + pos).attr("y",textMargin+5).attr("width",squareWidth).attr("height",20).attr("fill",transformer(v)).attr("v",v).attr("fill-opacity",0.3)
	}
}

var callbackSelectVis = function(event)
{ 
    let radioValue = document.querySelector('input[name="w"]:checked').value;
    
    let de = document.querySelector('select#dropdown')
    let dropdownValue = de.options[de.selectedIndex].value;    
     
    let vis = radioValue + '-' + dropdownValue
    selectedVis = dropdownValue
    
    console.log(selectedVis)
    
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

    if(JSONData == null)
    {
        d3.json('brazil-states.geojson',cb)
    }
    else
    {
        cb(null, null)
    }
}



var formElement = document.querySelector('form#selectvis')
formElement.addEventListener('change', callbackSelectVis);

var dropdownElement = document.querySelector('select#dropdown')
dropdownElement.addEventListener('change', callbackSelectVis);



drawMapInitial()

