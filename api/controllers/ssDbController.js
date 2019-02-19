/* ssDbController.js -- This file implements functions to process incoming GET and POST requests
   For now, the functions do not interact with a database; they just send back fake data.
   Eventually, they will interact with a database. 
*/

'use strict'; //JavaScript "strict" mode

var http = require('http');
const request = require('request');

exports.addCourse = function(req, res) {
     /* Eventually we'll do database lookup here to ensure coruse doesn't exist.
        If it doesn't exist, we'd add the course to the Db
        For now, we're just going to do the look up using the existing GAS web service for 
        the speedgolf coruse DB */
    var courseDBApiBaseUrl = "https://script.google.com/macros/s/AKfycbwHG49FpYZ-Fz8n3mLJsGQa85tWydFrEZ1qPpQcMPU7n76GmfU/exec"
    var courseDbApiUrl = courseDBApiBaseUrl + "?"; //prepare to append query params
    for (const key in req.query) { //append query params to our GAS web service URL...
      courseDbApiUrl += key + "=" + req.query[key] + "&";
    }
    courseDbApiUrl = courseDbApiUrl.substr(0,courseDbApiUrl.length - 1); //clip off last "&"
    console.log(courseDbApiUrl);
    request.get(courseDbApiUrl,function(err,resp,body) {
        res.json({message: 'Add Course: Response from Speedgolf DB Web Service: ' + JSON.stringify(resp)});
    });
};

exports.getCourseData = function(req, res) {
    /* Eventually we'll do database lookup here to get the course 
       If the course exists,  return the data associated with the course...
       For now, we're going to use the existing GAS web service for the speedgolf
       course DB to get the data...
    */
   var courseDBApiBaseUrl = "https://script.google.com/macros/s/AKfycbwHG49FpYZ-Fz8n3mLJsGQa85tWydFrEZ1qPpQcMPU7n76GmfU/exec"
   var courseDbApiUrl = courseDBApiBaseUrl + "?"; //prepare to append query params
   for (const key in req.query) { //append query params to our GAS web service URL...
     courseDbApiUrl += key + "=" + req.query[key] + "&";
   }
   courseDbApiUrl = courseDbApiUrl.substr(0,courseDbApiUrl.length - 1); //clip off last "&"
   console.log(courseDbApiUrl);
   request.get(courseDbApiUrl,function(err,resp,body) {
       res.json({message: 'Get Course Data: Response from Speedgolf DB Web Service: ' + JSON.stringify(resp)});
   });
   
};

exports.updateCourseHole = function(req, res) {
    /* Eventually we'll do database lookup here to get the course.
       We'll then update the hole with the data.
       For now, we'll call the existing GAS web service to post the hole data.
    */
   var courseDbApiBaseUrl = "https://script.google.com/macros/s/AKfycbwHG49FpYZ-Fz8n3mLJsGQa85tWydFrEZ1qPpQcMPU7n76GmfU/exec"
   console.log(req.body);
   request.post({url: courseDbApiBaseUrl, form: JSON.stringify(req.body)}, function(err,resp,body) {
       res.json({message: 'Update Course Hole Data: Response from Speedgolf DB Web Service: ' + JSON.stringify(err)});
   });
};