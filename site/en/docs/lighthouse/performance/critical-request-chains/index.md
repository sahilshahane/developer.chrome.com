---
layout: 'layouts/doc-post.njk'
title: Avoid chaining critical requests
description: |
  Learn what critical request chains are, how they affect web page performance,
  and how you can reduce the effect.
date: 2019-05-02
updated: 2020-04-29
---

[Critical request chains](https://web.dev/critical-rendering-path/)
are series of dependent network requests important for page rendering.
The greater the length of the chains and the larger the download sizes,
the more significant the impact on page load performance.

[Lighthouse](/docs/lighthouse/overview/)
reports critical requests loaded with a high priority:

<figure>
  {% Img src="image/tcFciHGuF3MxnTr1y5ue01OGLBn2/apWYFAWSuxf9tQHuogSN.png", alt="A screenshot of the Lighthouse Minimize critical request depth audit", width="800", height="452" %}
</figure>

{% Partial 'lighthouse-performance/scoring.njk' %}

## How Lighthouse identifies critical request chains

Lighthouse uses network priority as a proxy for identifying render-blocking critical resources.
See Google's [Chrome Resource Priorities and Scheduling](https://docs.google.com/document/d/1bCDuq9H1ih9iNjgzyAL0gpwNFiEP4TZS-YLRp_RuMlc/edit)
for more information about how Chrome defines these priorities.

Data on critical request chains, resource sizes,
and time spent downloading resources is extracted from the
[Chrome Remote Debugging Protocol](https://github.com/ChromeDevTools/devtools-protocol).

## How to reduce the effect of critical request chains on performance

Use the critical request chains audit results to target the resources that have the biggest effect on page load first:

- Minimize the number of critical resources: eliminate them, defer their download, mark them as `async`, and so on.
- Optimize the number of critical bytes to reduce the download time (number of round trips).
- Optimize the order in which the remaining critical resources are loaded: download all critical assets as early as possible to shorten the critical path length.

Learn more about optimizing your
[images](https://web.dev/use-imagemin-to-compress-images/),
[JavaScript](https://web.dev/apply-instant-loading-with-prpl/),
[CSS](https://web.dev/defer-non-critical-css/), and
[web fonts](https://web.dev/avoid-invisible-text/).

## Stack-specific guidance

### Magento

If you are not bundling your JavaScript assets, consider using [baler](https://github.com/magento/baler).

## Resources

[Source code for **Minimize critical request depth** audit](https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/audits/critical-request-chains.js)
