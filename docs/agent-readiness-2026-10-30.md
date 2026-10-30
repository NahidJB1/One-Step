# One-Step agent readiness — 30 October 2026

Status: implemented and verified locally; NOT deployed.

## Changes

1. `robots.txt` declares `Content-Signal: search=yes, ai-train=no` for the wildcard user agent.
2. Every sitemap URL has a lastmod date. `data/sitemap_lastmod.json` stores content fingerprints and dates. On first initialization existing pages use their last recorded Git content date, a conservative baseline; newly created pages use their creation build date. Subsequent content changes update the date; unchanged builds keep it. These dates describe page content, not verification of university fees or rankings. For release, reconcile these with any newer production edits.
3. Homepage JSON-LD contains linked Organization, WebSite, WebPage and Service nodes. The SEO generator uses the same schema module.
4. Organization sameAs reuses the existing One-Step Facebook profile. No unverified social or directory identities were added.
5. Visible homepage links expose About, Contact, Terms, email and telephone without requiring JavaScript. New About and Terms pages describe the site's actual study-guidance purpose without adding payment, refund or privacy commitments.
6. `llms.txt` and `index.md` expose concise public guidance and canonical links.
7. The homepage's internal PHP handler negotiates HTML/Markdown using Accept quality values, emits Vary: Accept and RFC 8288 Link headers, and reads only the two fixed public representations. Browser HTML remains the default.
8. A feature-detected read-only WebMCP tool registers against document.modelContext, falling back to navigator.modelContext. It returns public guidance and performs no submissions.
9. The requested SEP-1649-style server card advertises a functioning stateless Streamable HTTP endpoint at `/mcp.php`. Its capabilities are public resources only: homepage, llms.txt and the card. It supports initialize, ping, resources/list, resources/read and notifications, with bounded request size, Origin checks and a fixed public resource allowlist. It has no access to account, application, database or private configuration data.

## Verification

- `node scripts/build_site_seo.js --check`: zero outdated files.
- `node tests/article_seo_test.js`: 146 checks passed.
- `tests/agent_readiness_test.cjs` with PHP_CGI pointing to the installed php-cgi.exe: 173 checks passed. This executes actual PHP CGI request/response handling and simulated document/navigator WebMCP registration.
- Both PHP files pass `php -l`.
- Browser suite could not run: local network access was denied even with the installed Playwright browser selected.
- Existing coverage_redirects_test.cjs fails its old 28-mapping assertion; the checkout already has 38 mappings. No legacy redirect mappings were changed in this work.
- Apache/LiteSpeed routing, hosted MIME/CORS headers, CDN negotiation and native browser WebMCP remain unverified.

## Deployment boundary

The connected Hostinger tools expose WordPress abilities only. `list_sites` returned no sites. No usable file-level Hostinger deployment API is available in this session. No production files were changed.

The checkout contains extensive pre-existing changes. The release archive is a review artifact, not permission to replace the whole live site. Back up and compare the live homepage, robots, sitemap and .htaccess before applying these changes. In particular, merge the routing additions below into the live .htaccess; never replace its unrelated production rules with the local copy. Reconcile the sitemap's URL list with production, since this checkout already includes university URL migrations outside this task.

## Runtime files

New: `about.html`, `terms.html`, `llms.txt`, `index.md`, `mcp.php`, `includes/agent-home.php`, `assets/js/agent-tools.js`, `.well-known/mcp/server-card.json`.

Modified: `index.html`, `robots.txt`, `sitemap.xml`, `.htaccess`. The archive includes the current local versions for review; they may contain earlier changes. Source helpers and date manifest are included under their ordinary paths; tests and this document are included for reproducibility.

## Apache additions to merge

Near the top, after RewriteEngine/RewriteBase:

```apache
AddType text/markdown .md
<IfModule mod_headers.c>
  <Files "server-card.json">
    Header set Access-Control-Allow-Origin "*"
  </Files>
</IfModule>
```

After canonical host/index/extension redirects and before existing extensionless-page resolution:

```apache
RewriteRule ^(?:index\.html)?$ includes/agent-home.php [END]
```

## Hosted acceptance checks

Check the canonical homepage with Accept: text/html, text/markdown, and text/markdown;q=0. Expect HTML, Markdown, HTML respectively; all responses should advertise Vary: Accept and Link resources. Verify that CDN cache cannot serve one representation to requests for the other.

Verify HTTP 200 and the correct Content-Type for /llms.txt, /index.md and /.well-known/mcp/server-card.json; verify card CORS. Follow every new homepage link. Confirm sitemap URL destinations and lastmod dates after reconciliation. Test the MCP initialize/list/read sequence with Accept: application/json, text/event-stream and Content-Type: application/json, and verify rejected foreign Origin/private resource requests. Confirm the WebMCP tool in a supporting browser; unsupported browsers should load normally.

Clear the Hostinger website cache and repeat fresh requests before declaring the change live.

## References

- WebMCP API: https://developer.chrome.com/docs/modern-web-guidance/guides/webmcp/agentic-javascript-tools
- Requested server-card proposal: https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1649
- MCP transport: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
