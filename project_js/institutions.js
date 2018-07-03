//This script is responsible for drawing the visualization of the institution level results.

function drawInstitutionsVis(error,data)
{   
    let extentDict = null;
    
    //Counts the number of students by institution
    function countsByInstitution()
    {
        let raw = d3.nest().key(function(d) { return d.CO_IES; })
                 .rollup(function(v) { return v.length;})
                 .entries(entireData)

        let countByInstitution = {}
        for(let i = 0; i < raw.length ; i++)
        {
            let k = raw[i].key
            countByInstitution[k] = raw[i].value
            
        }
        return countByInstitution         
    }
    
    //Normalize the counts, so we have the institution's fraction of the best students, relative to its fraction of the students in the exam.
    function normalizeCounts(counts, totalBestStudents, countByInstitution, numStudents)
    {
        for(let i = 0; i < counts.length ; i++)
        {       
            counts[i].value = (counts[i].value/totalBestStudents)/(countByInstitution[counts[i].key]/numStudents)
        }
    }

    function unrollDict(arr)
    {
       return arr.map(e=>e.value)   
    }
    
    //Calculates the Gini of a distribution.
    function calculateGini(arr)
    {
        let arrValues = unrollDict(arr)
        
        let num = 0
        let den = 0
        
        for(let i = 0 ; i < arrValues.length ; i++)
        {
            for(let j = 0 ; j < arrValues.length; j++)
            {
                num += Math.abs(arrValues[i] - arrValues[j])
            }
        }
        
        for(let i = 0 ; i <arr.length ; i++)
        {
            den += arrValues[i]
        }
        
        return num/(2*arrValues.length*den);  
    }
    
    //Used to get the lowest/highest grades/counts for each state.
    function getExtent(dict)
    {
        let unrolled = dict.map(e=>e.values.map(f=>f.value))
        
        let newDict = {}
        
        for(let i = 0 ; i < unrolled.length; i++)
        {
            let extent = d3.extent(unrolled[i])
            
            newDict[statesCodes[dict[i].key]] = extent
        }
        
        return newDict
    }
    
    
    //The function which adds the Leaflet GeoJSON layer, i.e. the function that actually does the drawing.
    function addGeoLayer(arr)
    {
        let newArr = []
        for(let i = 0; i < arr.length ; i++)
        {
            let k = arr[i].key
            let newObj = {}
            newObj['key'] = k
            newObj['value'] = calculateGini(arr[i].values)
            newArr.push(newObj)
        }
        
        let dict = {}
              
        newArr.forEach(d=>dict[statesCodes["" + d.key]] = d.value)
     
        let domain = d3.extent(newArr,d=>d.value)
        
        domain[0] = Math.round((0.9 * domain[0]*1000))/1000
        domain[1] = Math.round((1.1 * domain[1]*1000))/1000
        
    	let colorScaler = d3.scaleSequential(d3.interpolateWarm).domain(domain)
    	
    	//The function that adds the popup to a state when it's clicked.
    	function whenClicked(e) 
        {
            let popupString = e.target.feature.properties.name
            popupString += ': '
            popupString += dict[e.target.feature.properties.sigla].toFixed(2)
            
            let t = null
            
            if(selectedVis == 'mean')
            {
                t = 'score'
            }
            else
            {
                t = 'number'
            }
            
            popupString += '<br/>'
            
            popupString += 'Minimum '
            popupString += t
            popupString += ': '
            popupString += extentDict[e.target.feature.properties.sigla][0]
            
            popupString += '<br/>'
            popupString += 'Maximum '
            popupString += t
            popupString += ': '
            popupString += extentDict[e.target.feature.properties.sigla][1]
            
            
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
        
        
        geoLayer = L.geoJSON(JSONData,{style:featureStyle, onEachFeature: onEachFeature}).addTo(myMap);
    	addLegend(d3.select("#leaflet-container"), colorScaler, 500)
    }   
    
    //Draws the visualization of the bottom one percent of students
    function drawBottom()
    {
        //We're going to use this function to filter out invalid grades.        
        function isNumeric(n)
        {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        
        //A few of the grades were just empty strings, and this was producing crazy results.
        gradesDimension.filter(d=>isNumeric(d))
        
        let top1value = 0.01 * cf.size()
        
        let top1 = gradesDimension.bottom(top1value) 
        
        //Group the grades by state, and within each state, by institution.
        let countsByState = d3.nest()
                            .key(function(d) { return d.CO_UF_CURSO; })
                            .key(function(d) {return d.CO_IES})
                            .rollup(function(v) { return v.length;})
                            .entries(top1)
        
        //Gets the maximum and minimum count by state.                    
        extentDict = getExtent(countsByState)
                            
        let countInst = countsByInstitution()
        countsByState.forEach(e=>normalizeCounts(e.values,top1value,countInst,cf.size()))                     
        
        addGeoLayer(countsByState)
    	
    	//Remove the filter
    	gradesDimension.filterAll()
    }
    
    //Works similarly to drawBottom, except there is no need to filter invalid grades.
    function drawTop()
    {
        let top1value = 0.01 * cf.size()
        
        let top1 = gradesDimension.top(top1value) 
        
        let countsByState = d3.nest()
                            .key(function(d) { return d.CO_UF_CURSO; })
                            .key(function(d) {return d.CO_IES})
                            .rollup(function(v) { return v.length;})
                            .entries(top1)
                            
       extentDict = getExtent(countsByState)                     
       
       let countInst = countsByInstitution()
       countsByState.forEach(e=>normalizeCounts(e.values,top1value,countInst,cf.size()))
                 
       addGeoLayer(countsByState)
    }
    
    //Works similarly to the previous two functions, but here instead of counts we work with averages.
    //Also, there is no need for normalization.
    function drawMean()
    {        
        let gradesByState = d3.nest().
                            key(function(d) { return d.CO_UF_CURSO})
                            .key(function(d) {return d.CO_IES})
                            .rollup(function(v) { return d3.mean(v, function(d) { return d.NT_GER; }); })
                            .entries(entireData)
                            
        extentDict = getExtent(gradesByState)
        
                            
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
    
    //This function is used to create the crossfilter object upon first use of the bottom or top visualizations.
    //We keep the object in a variable, in order to avoid recreating it.
    //The same goes for the grades dimension.
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
    //Here we fill the GeoJSON data, in order to avoid reading it again.
    if(JSONData == null)
    {
        JSONData = data
    }
    
    //By far the most costly operation in the entire code: reading the ENADE data.
    //We keep it in memory to avoid the cost of disk I/O.    
    if(entireData == null)
    {
        console.log('Era null')
        d3.csv('project_files/dados_enade.csv').get(fillAndDraw)
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
