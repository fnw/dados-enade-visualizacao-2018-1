function drawStatesVis(error,data)
{
    function countStudentsByState()
    {
        let raw = d3.nest().key(function(d) { return d.CO_UF_CURSO; })
                 .rollup(function(v) { return v.length;})
                 .entries(entireData)

        let countByState = {}
        for(let i = 0; i < raw.length ; i++)
        {
            let k = raw[i].key
            countByState[k] = raw[i].value
            
        }
        return countByState          
    }

    //Fraction of the best students over the fraction of students from the state
    
    function normalizeCounts(counts, totalBestStudents, countByState, numStudents)
    {
        for(let i = 0; i < counts.length ; i++)
        {
            debugger        
            counts[i].value = (counts[i].value/totalBestStudents)/(countByState[counts[i].key]/numStudents)
        }
    }

    function addGeoLayer(arr)
    {
        let dict = {}
              
        arr.forEach(d=>dict[statesCodes[d.key]] = d.value)
               
        let domain = d3.extent(arr,d=>d.value)
        domain[0] = Math.round((0.9 * domain[0]*1000))/1000
        domain[1] = Math.round((1.1 * domain[1]*1000))/1000
        
    	let colorScaler = d3.scaleSequential(d3.interpolateWarm).domain(domain)
    	
    	function whenClicked(e) 
        {
            let popupString = e.target.feature.properties.name
            popupString += ': '
            popupString += dict[e.target.feature.properties.sigla].toFixed(2)
            
            popup
            .setLatLng(e.latlng)
            .setContent(popupString)
            .openOn(myMap); 
        }

        function onEachFeature(feature, layer)
        {
            layer.on({
                click: whenClicked
            });
        }
    	
    	function featureStyle(feature)
        {
            let featureDict = {
                "fillColor": colorScaler(dict[feature.properties.sigla]),
                "color":"black",
                "stroke":false,
                "fillOpacity":0.3
            }
            return featureDict
        }
        geoLayer = L.geoJSON(JSONData,{style: featureStyle, onEachFeature: onEachFeature}).addTo(myMap);
    	addLegend(d3.select("#leaflet-container"), colorScaler, 500)
    }   
    
    function drawBottom()
    {
    
        function isNumeric(n)
        {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        
        gradesDimension.filter(d=>isNumeric(d))
        
        let top1value = 0.01 * cf.size()
        
        let top1 = gradesDimension.bottom(top1value) 
        
        let countsByState = d3.nest()
                            .key(function(d) { return d.CO_UF_CURSO; })
                            .rollup(function(v) { return v.length;})
                            .entries(top1)
        let allCounts = countStudentsByState()
        normalizeCounts(countsByState, top1value, allCounts, cf.size())
                    
        addGeoLayer(countsByState)
    	
    	gradesDimension.filterAll()
    }
    
    function drawTop()
    {
        let top1value = 0.01 * cf.size()
        
        let top1 = gradesDimension.top(top1value) 
        
        let countsByState = d3.nest()
                            .key(function(d) { return d.CO_UF_CURSO; })
                            .rollup(function(v) { return v.length;})
                            .entries(top1)
        
        let allCounts = countStudentsByState()
        normalizeCounts(countsByState, top1value, allCounts, cf.size())
        
        addGeoLayer(countsByState)
    }
    
    function drawMean()
    {        
        let gradesByState = d3.nest()
                            .key(function(d) { return d.CO_UF_CURSO; })
                            .rollup(function(v) { return d3.mean(v, function(d) { return d.NT_GER; }); })
                            .entries(entireData)
                            
        addGeoLayer(gradesByState)
    }
    
    function draw()
    {
        if(selectedVis == 'mean')
        {
            drawMean()
        }
        else if(selectedVis == 'top')
        {
            drawTop()
        }
        else if(selectedVis == 'bottom')
        {
            drawBottom()
        }
    }
    
    function fillCF()
    {
        cf = crossfilter(entireData)
        
        gradesDimension = cf.dimension(d=>d.NT_GER)   
    }
    
    function fillAndDraw(error,csv)
    {
        entireData = csv 
        
        if(selectedVis == 'top' || selectedVis == 'bottom')
        {
            fillCF()
        }
         
        draw()     
    }

    if(JSONData == null)
    {
        JSONData = data;
    }
    
    
    if(entireData == null)
    {
        console.log('Era null')
        d3.csv('dados_enade.csv').get(fillAndDraw)
    }
    else
    {	
        if((selectedVis == 'top' || selectedVis == 'bottom') && cf == null)
        {
           fillCF()
        }
    
        draw()
    }
}
