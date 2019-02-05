//********************************************************************************
//DOGET.GS
//*********************************************************************************
//This file contains the doGet() function, which serves up the web-based  
//app, responding to get requests with query strings as appropriate to dish out
//new pages
//*********************************************************************************

function doGet(e) {
  return HtmlService.createTemplateFromFile('html/app')
    .evaluate()
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle("Test Speedgolf Web Service");
}

//include: Allows us to include files using templated HTML, per Google's best practices 
//(https://developers.google.com/apps-script/guides/html/best-practices)
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}   
