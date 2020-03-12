
main = {};
main.originalData = null;
main.wholeYearData = null;
main.singleYearData = null;//initial year = 1985
main.init = function(error, data){
    if(error) throw error;
    // preprocess data so that the type string is converted to number
    main.preprocess(data);
    main.data = data;
    
    //initialize originalData. NEVER CHANGE!
    main.originalData = data;
    //initialize wholeYearData
    main.wholeYearData = data;
    //initialize singleYearData. Data only in 1985
    main.singleYearData = data.filter(function(datum){
        return datum.year === main.START_YEAR;
    });

    // initialize each part
    //TODO: init(data) should be init() in the final version
    // first initialize sunburst, so that other charts can use color map defined in sunburst to color their curves/points
    sunburst.init();//init();
    curvechart.init();//init();
    scatterplot.init(data);//init();
    histogram.init(data);//init();
    reset.init(data);//init();
}


/**
 * preprocess csv raw data so that it can be better used later
 * after being preprocessed, data is an array in which each datum is an object with property:
 * available: boolean;
 * region: string;
 * subregion: string;
 * country: string;
 * others: if available is true then others are of type number. Otherwise others are 'NA'.
 * 
 * Also, this function will initialize main.START_YAER and main.END_YEAR.
 */
main.preprocess = function(data){
    for(let datum of data){
        datum.year = Number(datum.year);
        if(datum.suicide_no === 'NA'){
            datum.available = false;
        }
        else{
            datum.available = true;
            // convert other fields to type number, if applicable
            datum.suicide_no = Number(datum.suicide_no);
            datum.population = Number(datum.population);
            datum.GDP_year = Number(datum.GDP_year);
            datum.GDP_percap = Number(datum.GDP_percap);
            datum.suicide_ratio = Number(datum.suicide_ratio);
        }
    }
    main.START_YEAR = data[0].year;
    // find the start year and end year
    let countrySample = data[0].country;
    let year;
    for(let datum of data){
        if(datum.country !== countrySample){
            break;
        }
        year = datum.year;
    }
    main.END_YEAR = year;
}

/**
 * get the datum of a specific country in a specific year
 * 
 * if the year is not in [main.START_YEAR, main.END_YEAR], null is returned
 * if the year is in that interval but the datum.available is false, null is returned as well
 * @param {array} data the data we have
 * @param {string} country
 * @param {number} year
 */
main.getItem = function(data, country, year){
    if(year < main.START_YEAR || year > main.END_YEAR){
        return null;
    }
    else{
        for(let datum of data){
            if(datum.year === year && datum.country === country){
                if(datum.available){
                    return datum;
                }
                else{
                    return null;
                }
            }
        }
    }
    // else{
    //     let found = false;
    //     let yearNum = this.END_YEAR - this.START_YEAR + 1;
    //     let countryNum = data.length/yearNum;
    //     let i;
    //     for(i = 0; i < countryNum; i++){
    //         if(data[i * yearNum].country === country){
    //             found = true;
    //             break;
    //         }
    //     }

    //     if(found === false){
    //         return null;
    //     }
    //     datum = data[i * yearNum + year - this.START_YEAR] 
    //     if(datum.available === true){
    //         return datum;
    //     }
    //     else{
    //         return null;
    //     }
    // }
}

d3.csv('./data/suicide_new.csv', main.init);