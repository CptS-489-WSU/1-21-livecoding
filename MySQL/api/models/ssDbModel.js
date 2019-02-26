/* ssDbModel.js
   This file defines the model for interacting with the speedgolfdb mySQL database.
   Per Node.js's model-view-routes paradigm for RESTful APIs, it defines JavaScript
   classes for addding/updating each mySQL table. It creates class methods for each type
   RESTful API request supporrted. In this case we support three API requests:
     --Add a new course to the speedgolfdb.coursesdb table (GET)
     --Get all data associated with an existing course in the speedgolfdb.coursesdb table (GET)
     --add or update data on a specific hole in an existing course in the speedgolfdb.coursesdb table (POST)
*/
'user strict';
var sql = require('./db.js');

//Course object helps us add and update courses table in speedgolf db
var Course = function(course) {
    this.name = course.name;
    this.city = course.city;
    this.state = course.state;
    this.country = course.country;
    this.numHoles = course.numHoles;
};

//Hole object helps us add and update holes table in the speedgolf db
var Hole = function(hole) {
    this.courseId = hole.courseId;
    this.holeNum = hole.holeNum;
    this.strPar = hole.strPar;
    this.timePar = hole.timePar;
    this.golfDist = hole.golfDist;
    this.runDist = hole.runDist;
}

/*addCourse -- Add a new course to the speedgolfdb.courses table. 
  First, we check course data to ensure it is valid. If it is not valid,
  we return a JSON object like this:
  {name: <coursename>, id: "", courseAdded: false, errorMsg: "Invalid data: ..."} 
  
  Next, we make sure that the course does not already exist. We do this by
  querying the table with the course name, city, state and country to see if there's
  a match. If there is a match, we return a JSON object like this:
  {name: <coursename>, id: "", courseAdded: false errorMsg: "Course already exists"}
  
  Finally, we add the course, returning a JSON object of the following form:
  {name: <coursename>, id: <course id in table>, courseAdded: true}
*/
Course.addCourse = function (newCourse, result) {
    var testCourse, query, resultObj;
    resultObj = {name: newCourse.name, id: "", courseAdded: false};
    //1. Ensure course data is valid
    if (!(typeof newCourse.name == 'string') || newCourse.name.length < 5 ||
        !(typeof newCourse.city == 'string') || newCourse.city.length < 2 ||
        !(typeof newCourse.state == 'string') || newCourse.city.length < 2 ||
        !(typeof newCourse.country == 'string') || newCourse.country.length != 2 ||
       isNaN(newCourse.numHoles) || Number(newCourse.numHoles) < 3 ||
       Number(newCourse.numHoles > 100)) {
         //Invalid data
         resultObj.errMsg = "Error: Course could not be added because course data is invalid. Please check API definition and try again.";
         result(resultObj, null); 
    } else { //valid data 
        //2. Ensure course isn't already in db
        testCourse = {name: newCourse.name, city: newCourse.city, state: newCourse.state, country: newCourse.country};
        query = "SELECT * from speedgolfdb.courses WHERE ";
        for (const prop in testCourse) {
            query += prop + " = '" + testCourse[prop] + "' AND ";
        }
        query = query.substr(0,query.length-5);
        sql.query(query,
          function(err,res) {
              if (err) { //Error when testing if course already exists
                console.log("Error when testing to see if course to be added already exists: ", err);
                resultObj.errMsg = err;
                result(resultObj, null);
              } else if (res.length > 0) { //Error: Course already in db
                resultObj.errMsg = "Could not add course to database. Course already exists in database.";
                result(resultObj, null);
              } else
                //3. Course isn't in DB -- Add it.
                sql.query("INSERT INTO courses SET ?", newCourse, function (err2, res2) {
                    if(err2) { //Error when addint
                        console.log("Error when adding course to database: ", err2);
                        resultObj.errMsg = err2;
                        result(resultObj, null);
                    }
                    else { //Success!
                        resultObj.id = res2.insertId; 
                        resultObj.courseAdded = true;
                        result(resultObj,null);
                    }
                });
          });
    }
};


/* getCourse -- Obtain all data associated with a course whose id is supplied.
   We return an error if the course could not be found in db. 
*/
Course.getCourse = function (courseId, result) {
    var resultObj = {success: false, statusMsg: "", statusObj: null};
    sql.query("SELECT * from courses WHERE id = ?",courseId, function (err, res) {
        if(err) {
            resultObj.statusMsg = "An error occurred when attempting to access course in database.";
            console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
            resultObj.statusObj = err;
            result(resultObj, null)
        }
        else if (res.length == 1) { //course found in database
            if (res.totalStr != null) { //There is data on at least one hole; let's query...
              sql.query("SELECT * from holes WHERE courseId = ?",courseId, function( err2, res2) {
                if(err2) {
                    resultObj.statusMsg = "An error occurred when attempting to access holes associated with the course.";
                    console.log(resultObj.statusMsg + ": " + JSON.stringify(err2));
                    resultObj.statusObj = err2;
                    result(resultObj, null);
                } else {
                    for (var i = 0; i < res2.length; ++i) { //iterate through each hole and build JSON return obj
                      res[res2[i].holeNum] = {strPar : res2[i].strPar, timePar: res2[i].timePar,
                                            golfDist: res2[i].golfDist, runDist: res2[i].runDist};
                    }
                    resultObj.statusMsg = "Course data successfully retrieved.";
                    resultObj.success = true;
                    resultObj.data = res2;
                    result(resultObj,null);
                }
              });
            } 
        } else { //course not found in database 
            resultObj.statusMsg = "Course could not be found in database";
            result(resultObj,null);             
        }
    });
}

Course.updateCourse = function(courseId, holeData, result) {
    var hd, hdOk, numHoles, resultObj;
    //First, ensure that courseId exists in speedgolf.course DB. If not, can't add holes!
    resultObj = {success: false, statusMsg: "", statusObj: null}
    sql.query("SELECT * FROM speedgolfdb.courses WHERE id = ?",courseId,
      function(err,res) {
        if (err) { //Unexpected error in query
            resultObj.statusMsg = "Error when seeing if course with id " + courseId + " exists in courses DB.";
            resultObj.statusObj = err;
            console.log(resultObj.statusMsg + ": " + JSON.stringify(err));
            result(resultObj,null);
        } else if (res.length == 0) { //no course with id courseId
            resultObj.statusMsg = "Cannot update hole of course with id " + courseId + ". No such course exists.";
            console.log(resultObj.statusMsg);
            result(resultObj,null);
        } else {
            numHoles = res[0].numHoles;
            hd = {courseId: courseId, holeNum: holeData.holeNum, strPar: holeData.strPar,
                timePar: holeData.timePar, golfDist: holeData.golfDist, runDist: holeData.runDist};
            hdOk = checkHoleData(hd,numHoles);
            if (hdOk == null) { //data cannot be inserted because it's not in proper format
                resultObj.statusMsg = "Cannot update hole data for course with id " + courseId + 
                ". At least one data item not in proper format or out of bounds. Please check API definition and try again."
                console.log(resultObj.statusMsg);
                result(resultObj,null);
            } else {
                //If here, we can proceed with data update...
                console.log("hdOk: " + JSON.stringify(hdOk));
                sql.query("INSERT INTO speedgolfdb.holes SET ? ON DUPLICATE KEY UPDATE ?",[hdOk,hdOk], 
                function(err2, res2) {
                    if (err2) {
                        resultObj.statusMsg = "Error when trying to add/modify hole data for course with id " + courseId;
                        resultObj.statusObj = err2;
                        console.log(resultObj.statusMsg + ": " + JSON.stringify(err2));
                        result(resultObj,null);
                    } else {
                        resultObj.success = true;
                        resultObj.statusMsg = "Hole data for course with id " + courseId + " successfully added/modified."
                        resultObj.statusObj = res2;
                        console.log(resultObj.statusMsg + ": " + JSON.stringify(res2));
                        result(resultObj,null);
                    }
                });
            }
        }
    });
};
 
 /* checkHoleData: Given an object with holeNum, strPar, timePar, golfDist, and runDist
    properties, ensures that all data values are of proper type and in proper format, returning
    null if the values cannot be converted or an object with values converted to proper types and formats
 */
 function checkHoleData(data, numHoles) {
   //console.log("in checkHoleData with data = " + JSON.stringify(data) + ", numHoles: " + numHoles);
   if (isNaN(data.holeNum) || Number(data.holeNum) < 1 || Number(data.holeNum) > numHoles ||
       isNaN(data.strPar) || Number(data.strPar) < 2 || Number(data.strPar) > 6 || 
       !(typeof data.timePar == 'string') || 
       !(/(([0-9]?[0-9]:)?[0-5]?[0-9]:[0-5][0-9]){1}/.test(data.timePar)) || 
       isNaN(data.golfDist) || Number(data.golfDist) < 1 ||
       isNaN(data.runDist) || Number(data.runDist) < 1) { 
           return null; //invalid data exists!
       }
       if (data.timePar.split(":").length == 2) { //Splits into two parts; need to add leading 0...
          data.timePar = "0:" + data.timePar;
       }
       console.log("checkHoleData is returning: " + JSON.stringify(data));
       return data;
  }

module.exports = {Course, Hole};