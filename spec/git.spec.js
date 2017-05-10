var jasmineReporter = require('jasmine-reporters');
var util=require('util');
var request = require('request');
var token='?private_token='+'yourToken';
var issues={};
var projects=[];
var merges = {};
var siteUrl = "https://gitlab.example.com/api/v3/projects/" //Update with your Gitlab URl


jasmine.getEnv().addReporter(
  new jasmineReporter.TerminalReporter(
    {
       verbosity: 3,
       color: true,
       showStack: true
     }
   )
 );

jasmine.getEnv().addReporter(
     new jasmineReporter.JUnitXmlReporter(
         {
             savePath: './results',
             consolidateAll: true
         }
     )
 );



describe(
  'Gitlab Verification',
  function(){
    it(
      'GET - Verifies initially that there is no project in gitlab',
      function(done){
        request(
          {
            method:'GET',
            url:siteUrl+token,
            rejectUnauthorized:false
          },
          function (error, response, body) {
            if(error){
              console.log(error);
              expect(error).toBe(null);
              done();
            }
            projects=JSON.parse(body);
            expect(projects.length).toBe(0);
            done();
          }
        );
      }
    );

    it(
        'POST - Verifies that a new project is created in Gitlab',
        function(done){
            request(
                {
                    method:'POST',
                    url:siteUrl+token,
                    rejectUnauthorized:false,
                    'Content-type':'application/x-www-form-urlencoded',
                    formData:{
                        name:'TestGitlabProject',
                        path:'newRepo'
                    }
                },
                function (error, response, body) {
                    if(error){
                        console.log(error);
                        expect(error).toBe(null);
                        done();
                    }
                    expect(response.statusCode).toBe(201);
                    done();
                }
            );
        }
    );

    it(
      'GET - Verifies that the Project is created in gitlab',
      function(done){
        request(
          {
            method:'GET',
            url:siteUrl+token,
            rejectUnauthorized:false
          },
          function (error, response, body) {
            if(error){
              console.log(error);
              expect(error).toBe(null);
              done();
            }
            projects=JSON.parse(body);
            expect(projects.length).toBe(1);
            done();
          }
        );
      }
    );

    it(
      'PUT - Verifies that the project can be updated',
      function(done){
        for(var i in projects){
          request(
            {
              method:'PUT',
              url:siteUrl+'/'+projects[i].id+token,
              rejectUnauthorized:false,
              'Content-type':'application/x-www-form-urlencoded',
              formData:{
                name:'Test Project',
              }
            },
            function (error, response, body) {
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              expect(response.statusCode).toBe(200);
              done();
            }
          );
        }
      }
    );

    it(
      'POST - Creates a new file in the repository',
      function(done){
        for(var i in projects){
          request(
            {
              method:'POST',
              url:siteUrl+'/'+projects[i].id+'/repository/files'+token,
              rejectUnauthorized:false,
              'Content-type':'application/x-www-form-urlencoded',
              formData:{
                file_path:'README.markdown',
                branch_name:'master',
                content:'README file for the GITLAB test project',
                commit_message:'Adding Readme file to gitlab'
              }
            },
            function (error, response, body) {
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              expect(response.statusCode).toBe(201);
              done();
            }
          );
        }
      }
    );

    it(
      'POST - Verifies that a new issue is created in the project',
      function(done){
        for(var i in projects){
          request(
            {
              method:'POST',
              url:siteUrl+'/'+projects[i].id+'/issues'+token,
              rejectUnauthorized:false,
              'Content-type':'application/x-www-form-urlencoded',
              formData:{
                title:'New Issue Created for test project',
                description:'A new issue is created to test project...no assignee'
              }
            },
            function (error, response, body) {
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              issues = JSON.parse(body);
              expect(response.statusCode).toBe(201);
              done();
            }
          );
        }
      }
    );

    it(
      'PUT - Verifies the issue can be successfully Edited',
      function(done){
        for (var i in projects){
          request(
            {
              method:'PUT',
              url:siteUrl+'/'+projects[i].id+'/issues/'+issues.id+token,
              rejectUnauthorized:false,
              'Content-type':'application/x-www-form-urlencoded',
              formData:{
                title:'New Edited issue in test project'
              }
            },
            function(error, response, body){
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              issues = JSON.parse(body);
              expect(issues.title).toBe('New Edited issue in test project');
              done();
            }
          )
        }
      }
    );

    it(
      'GET - Verifies the successful retrival of the issue',
      function(done){
        for (var i in projects){
          for (var j in issues){
            if(j!=='id'){
              return;
            }
            request(
              {
                method:'GET',
                url:siteUrl+'/'+projects[i].id+'/issues/'+issues[j]+token,
                rejectUnauthorized:false,
              },
              function(error, response, body){
                if(error){
                  console.log(error);
                  expect(error).toBe(null);
                  done();
                }
                expect(response.statusCode).toBe(200);
                done();
              }
            )
          }
        }
      }
    );

    it(
      'PUT - Verifies that the issue can be closed',
      function(done){
        for (var i in projects){
          request(
            {
              method:'PUT',
              url:siteUrl+'/'+projects[i].id+'/issues/'+issues.id+token,
              rejectUnauthorized:false,
              'Content-type':'application/x-www-form-urlencoded',
              formData:{
                'state_event':'close'
              }
            },
            function(error, response, body){
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              issues = JSON.parse(body);
              expect(issues.state).toBe('closed')
              done();
            }
          )
        }
      }
    );

    it(
      'GET: Checks for the existing branches',
      function(done){
        for (var i in projects){
          request(
            {
              method:'GET',
              url:siteUrl+'/'+projects[i].id+'/repository/branches'+token,
              rejectUnauthorized:false
            },
            function(error, response, body){
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              expect(response.statusCode).toBe(200);
              done();
            }
          )
        }
      }
    );

    it(
      'POST - Verifies that a branch is created in the project',
      function(done){
        for (var i in projects){
          request(
            {
              method:'POST',
              url:siteUrl+'/'+projects[i].id+'/repository/branches/'+token,
              rejectUnauthorized:false,
              'Content-type':'application/x-www-form-urlencoded',
              formData:{
                branch_name:'TesterTestDevelopment',
                ref:'master'
              }
            },
            function(error, response, body){
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              expect(response.statusCode).toBe(201);
              done();
            }
          )
        }
      }
    );

    it(
      'POST - Creates a new file in the new branch',
      function(done){
        for(var i in projects){
          request(
            {
              method:'POST',
              url:siteUrl+'/'+projects[i].id+'/repository/files'+token,
              rejectUnauthorized:false,
              'Content-type':'application/x-www-form-urlencoded',
              formData:{
                file_path:'newTestFile.txt',
                branch_name:'TesterTestDevelopment',
                content:'Sample text file for new branch',
                commit_message:'Adding a new file to test merge'
              }
            },
            function (error, response, body) {
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              expect(response.statusCode).toBe(201);
              done();
            }
          );
        }
      }
    );

    it(
      'POST - Creates a new Merge Request',
      function(done){
        for(var i in projects){
          request(
            {
              method:'POST',
              url:siteUrl+'/'+projects[i].id+'/merge_requests'+token,
              rejectUnauthorized:false,
              'Content-type':'application/x-www-form-urlencoded',
              formData:{
                source_branch:'TesterTestDevelopment',
                target_branch:'master',
                title:'Merging Test branch with Master'
              }
            },
            function (error, response, body) {
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              merges=JSON.parse(body);
              expect(response.statusCode).toBe(201);
              done();
            }
          );
        }
      }
    );

    it(
      'GET - Verifies for changes in the merge',
      function(done){
        for(var i in projects){
          request(
            {
              method:'GET',
              url:siteUrl+'/'+projects[i].id+'/merge_request/'+merges.id+'/changes'+token,
              rejectUnauthorized:false,
            },
            function (error, response, body) {
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              merges=JSON.parse(body);
              expect(response.statusCode).toBe(200);
              expect(merges.changes.length).toBeGreaterThan(0);
              done();
            }
          );
        }
      }
    );

    it(
      'PUT - Accepts the changes in the merge',
      function(done){
        for(var i in projects){
          request(
            {
              method:'PUT',
              url:siteUrl+'/'+projects[i].id+'/merge_request/'+merges.id+'/merge'+token,
              rejectUnauthorized:false,
              merge_commit_message:'Accepting merge request'
            },
            function (error, response, body) {
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              merges=JSON.parse(body);
              expect(response.statusCode).toBe(200);
              expect(merges.state).toBe('merged');
              done();
            }
          );
        }
      }
    )

    it(
      'DELETE - Verifies that the created project is DELETED',
      function(done){
        for(var i in projects){
          request(
            {
              method:'DELETE',
              url:siteUrl+'/'+projects[i].id+token,
              rejectUnauthorized:false
            },
            function (error, response, body) {
              if(error){
                console.log(error);
                expect(error).toBe(null);
                done();
              }
              expect(response.statusCode).toBe(200);
            }
          );
        }
        done();
      }
    );

    it(
      'GET - Verifies that the project is deleted from gitlab',
      function(done){
          setTimeout(
              function(){
                  request(
                    {
                      method:'GET',
                      url:siteUrl+token,
                      rejectUnauthorized:false
                    },
                    function (error, response, body) {
                      if(error){
                        console.log(error);
                        expect(error).toBe(null);
                        done();
                      }
                      projects=JSON.parse(body);
                      expect(projects.length).toBe(0);
                      done();
                    }
                );
            }, 1200
          )
      }
    );
  }
)
