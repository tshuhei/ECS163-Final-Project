#suicide data cleaning

#read the data
suicide<-read.csv("suicide.csv",header=T)
suicide<-suicide[,-c(3,4,8,9,12)]
names(suicide)<-c("country","year","suicide_no","population","suicide_ratio","GDP_year","GDP_percap")


#change the GDP_year
suicide$GDP_year<-as.character(suicide$GDP_year)
suicide$GDP_year<-gsub(",","",suicide$GDP_year)
suicide$GDP_year<-as.numeric(suicide$GDP_year)


#make sum and mean tables
tb<-tapply(suicide$suicide_no,suicide[,1:2],sum)
tb_pop<-tapply(suicide$population,suicide[,1:2],sum)
tb_gdpyear<-tapply(suicide$GDP_year,suicide[,1:2],mean)
tb_percap<-tapply(suicide$GDP_percap,suicide[,1:2],mean)


#make new columns
country<-c()
for(i in 1:length(levels(suicide$country))){
    for(j in 1:32){
            country<-c(country,levels(suicide$country)[i])
    }
}

year<-c()
for(i in 1:length(levels(suicide$country))){
    year<-c(year,1985:2016)
}

suicide_no<-c()
for(i in 1:length(levels(suicide$country))){
    suicide_no<-c(suicide_no,tb[i,])
}

population<-c()
for(i in 1:length(levels(suicide$country))){
    population<-c(population,tb_pop[i,])
}

GDP_year<-c()
for(i in 1:length(levels(suicide$country))){
    GDP_year<-c(GDP_year,tb_gdpyear[i,])
}

GDP_percap<-c()
for(i in 1:length(levels(suicide$country))){
    GDP_percap<-c(GDP_percap,tb_percap[i,])
}


#combine and make new suicide dataset
suicide_new<-data.frame(country,year,suicide_no,population,GDP_year,GDP_percap)

suicide_ratio<-c()
for(i in 1:nrow(suicide_new)){
    ratio<-suicide_new$suicide_no[i] / suicide_new$population[i] * 100000
    suicide_ratio<-c(suicide_ratio,ratio)
}

suicide_new<-data.frame(suicide_new,suicide_ratio)
#suicide_new$GDP_year<-as.character(suicide_new$GDP_year)