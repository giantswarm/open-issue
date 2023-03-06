const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
    const token = core.getInput("token");
    const issuesJSON = core.getInput("issues");
    var repoName = core.getInput("repo");
    var org = core.getInput("org");
    var issues = JSON.parse(issuesJSON)

    const octokit = github.getOctokit(token);

    if (!issues || issues.length == 0) {
      core.info("The issues var is empty: "+issues)
      core.info("The issues JSON: "+issuesJSON)
      return
    }

    if (!org) {
      org = github.context.repo.owner 
    }
    if (!repoName) {
      repoName = github.context.repo.repo 
    }

    issues.forEach(issue => {
        //check if exists
        const regex = /\s/g;
        let q = issue.title.replace(regex, '+') + "+in:title+is:issue+is:open+repo:" +org+ "/" +repoName;
        core.info("Searching for issue: " + q);
        octokit.rest.search.issuesAndPullRequests({
          q,
        }).then(issues => {
          core.info("Issues found: " + JSON.stringify(issues.data));
          if (issues.data && issues.data.total_count > 0) {
            return
          }

          //create issue
          octokit.rest.issues.create({
            owner: org,
            repo: repoName,
            title: issue.title,
            body: issue.message,
            labels: issue.owner
          }).then(response => {
            core.info("Response from issue creation: " + JSON.stringify(response.data));
          });
        }).catch(error => {
          core.error(error.message);
        });
    });
}

run();
