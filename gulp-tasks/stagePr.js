/*
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Sends a request to a Cloud Build webhook
 * to create a build for the specified commit. Only meant to be run
 * on GitHub actions.
 */

const {default: fetch} = require('node-fetch');

const CHECK_NAME_STATIC_BUILD = 'Build (dcc-staging)';

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

async function requestBuild() {
  console.log(
    `Requesting staging build for ${process.env.COMMIT_SHA} (${process.env.GITHUB_SHA})`
  );

  const request = await fetch(
    `https://cloudbuild.googleapis.com/v1/projects/dcc-staging/triggers/Webhook:webhook?key=${process.env.CLOUD_BUILD_KEY}&secret=${process.env.CLOUD_BUILD_SECRET}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        COMMIT_SHA: process.env.COMMIT_SHA,
      }),
    }
  );

  await request.json();
  console.log('Requested staging build.');
}

async function fetchGitHubApi(endpoint) {
  const request = await fetch(`https://api.github.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });

  const data = await request.json();
  return data;
}

async function findBuild(checkName) {
  console.log(`Fetching checks for commit ${process.env.COMMIT_SHA} ...`);
  let build = null;
  try {
    const checks = await fetchGitHubApi(
      `repos/GoogleChrome/developer.chrome.com/commits/${process.env.COMMIT_SHA}/check-runs`
    );
    build = checks.check_runs.find(run => {
      return run.name === checkName;
    });
  } catch (e) {
    console.error('Could not fetch checks.');
  }

  return build;
}

async function waitForCloudBuild(checkId) {
  console.log(`Waiting for Cloud Build (${checkId}) to finish ...`);
  // Wait 30s before querying GitHub. A full build takes approx.
  // 5 minutes, so we don't need to query that quick/often
  await wait(30 * 1000);
  const build = await fetchGitHubApi(
    `repos/GoogleChrome/developer.chrome.com/check-runs/${checkId}`
  );

  if (build.status === 'completed') {
    return build;
  }

  // If the build has not completed yet, then just query again
  return waitForCloudBuild(checkId);
}

async function stagePr() {
  if (!process.env.GITHUB_ACTION) {
    console.warn(
      'This task is inteded to run on GitHub actions. Use npm run stage:personal locally instead.'
    );
    return;
  }

  try {
    await requestBuild();
  } catch (e) {
    throw Error('Failed to request staging build.');
  }

  // Wait for 30 seconds, for the webhook to create the actual
  // build and Cloud Build propagate the status back to GitHub.
  // This can take up to 1m30s - wait for 2m30s to have room to wiggle
  // and as the build takes a while anyway
  console.log('Waiting for Cloud Build job to start ...');
  await wait(2.5 * 60 * 1000);

  const build = await findBuild(CHECK_NAME_STATIC_BUILD);
  if (!build) {
    throw Error('Can not determine Cloud Build job status.');
  }

  try {
    await waitForCloudBuild(build.id);
  } catch (e) {
    throw Error('Can not determine Cloud Build job status.');
  }

  console.log('Staging build finished.');
  // TODO: Post comment to PR.
}

module.exports = stagePr;