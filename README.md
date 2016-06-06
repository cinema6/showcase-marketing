# showcase-marketing
Marketing widgets for the Showcase family of products.  
##Usage  
adWidget.render( parent , options )  

parent = parent node (e.g `document.getElementById("root")`)  
options = `{ titleText : "Your title Here, subtitleText: "Your sub here", buttonText: "click me", showLoadingAnimation: false }`  
###Example :  
`var options = {titleText : "Promote your app", subtitleText: "Search iTunes", buttonText: "Preview", showLoadingAnimation: true};`  

`adWidget.render( document.getElementById("app") , options );`
