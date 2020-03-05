# ECS 163 team project

## format of the data passed to init()
data is an array in which each datum is an object with property:

* available: boolean, true if this datum is *meaningful*, which means values can be used.
* region: string
* subregion: string
* country: string
* suicide\_no, population, GDP\_year, GDP\_percap, suicide_ratio: if *available* is true then they are of type *number*. Otherwise they are 'NA', which is type *string*.

Some utility funcitons/fields under *main* object you should know:

* main.getItem(data, country, year), please look at its Jsdoc in [main.js](./scripts/main.js).
* main.START_YEAR: the smallest year
* main.END_YEAR: the biggest year.