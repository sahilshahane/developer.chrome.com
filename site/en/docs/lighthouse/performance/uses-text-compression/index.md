---
layout: 'layouts/doc-post.njk'
title: Enable text compression
description: |
  Learn about how enabling text compression can improve your webpage load performance.
date: 2019-05-02
updated: 2022-12-03
---

Text-based resources should be served with compression
to minimize total network bytes.
The Opportunities section of your Lighthouse report lists all text-based resources
that aren't compressed:

<figure>
  {% Img src="image/tcFciHGuF3MxnTr1y5ue01OGLBn2/ZftZfKlPcEu2cs4ltwK8.png", alt="A screenshot of the Lighthouse Enable text compression audit", width="800", height="271" %}
</figure>

## How Lighthouse handles text compression

Lighthouse gathers all responses that:

- Have text-based resource types.
- Do not include a `content-encoding` header set to `br`, `gzip`, or
  `deflate`.

Lighthouse then compresses each of these with
[GZIP](https://www.gnu.org/software/gzip/) to compute the potential
savings.

If the original size of a response is less than 1.4KiB, or if the
potential compression savings is less than 10% of the original size, then
Lighthouse does not flag that response in the results.

{% Aside 'note' %}
The potential savings that Lighthouse lists are the potential savings
when the response is encoded with GZIP.
If Brotli is used, even more savings are possible.
{% endAside %}

## How to enable text compression on your server

Enable text compression on the server(s) that served these responses in order to
pass this audit.

When a browser requests a resource, it will use the
[`Accept-Encoding`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Accept-Encoding)
HTTP request header to indicate what compression algorithms it supports.

```text
Accept-Encoding: gzip, compress, br
```

If the browser supports [Brotli](https://opensource.googleblog.com/2015/09/introducing-brotli-new-compression.html)
(`br`) you should use Brotli because it can reduce the file size of the resources more than the
other compression algorithms. Search for `how to enable Brotli compression in <X>`, where
`<X>` is the name of your server. As of December 2022 Brotli is supported in all major browsers except Safari on iOS. See
[Browser compatibility](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Encoding#Browser_compatibility)
for updates.

Use GZIP as a fallback to Brotli. GZIP is supported in all major browsers,
but is less efficient than Brotli. See [Server Configs](https://github.com/h5bp/server-configs)
for examples.

Your server should return the
[`Content-Encoding`](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Encoding)
HTTP response header to indicate what compression algorithm it used.

```text
Content-Encoding: br
```

## Check if a response was compressed in Chrome DevTools

To check if a server compressed a response:

Press `Control+Shift+J` (or `Command+Option+J` on Mac) to open DevTools.
Click the Network tab.

[comment]: <> (The following list was a shortcode from web.dev, but it was not translated from English for any language.)
1. Press <code><kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd></code> (or <code><kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>J</kbd></code> on Mac) to open DevTools.
2. Click the **Network** tab.
3. Click the request that caused the response you're interested in.
4. Click the **Headers** tab.
5. Check the `content-encoding` header in the **Response Headers** section.

<figure>
  {% Img src="image/tcFciHGuF3MxnTr1y5ue01OGLBn2/jBKe0MYnlcQK9OLzAKTa.svg", alt="The content-encoding response header", width="800", height="571" %}
  <figcaption>
    The <code>content-encoding</code> response header.
  </figcaption>
</figure>

To compare the compressed and de-compressed sizes of a response:

[comment]: <> (The following list was a shortcode from web.dev, but it was not translated from English for any language.)
1. Press <code><kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd></code> (or <code><kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>J</kbd></code> on Mac) to open DevTools.
2. Click the **Network** tab.
3. Enable large request rows.
   See [Use large request rows](/docs/devtools/network/reference/#request-rows).
4. Look at the **Size** column for the response you're interested in. The
   top value is the compressed size. The bottom value is the de-compressed
   size.

See also [Minify and compress network payloads](https://web.dev/reduce-network-payloads-using-text-compression/).

## Stack-specific guidance

### Joomla

Enable the Gzip Page Compression setting (**System** > **Global configuration** > **Server**).

### WordPress

Enable text compression in your web server configuration.

## Resources

- [Source code for **Enable text compression** audit](https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/audits/byte-efficiency/uses-text-compression.js)
