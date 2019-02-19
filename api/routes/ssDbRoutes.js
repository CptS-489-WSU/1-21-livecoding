'use strict';
module.exports = function(app) {
    var sgCourse = require('../controllers/ssDbController');

    //routes
    app.route('/courses')
    .get(sgCourse.addCourse);

    app.route('/courses/:courseId')
      .get(sgCourse.getCourseData)
      .post(sgCourse.updateCourseHole);

   
    
};