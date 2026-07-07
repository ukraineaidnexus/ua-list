// Submission Worker for ukraineaidnexus.org
//
// Deployed MANUALLY via the Cloudflare dashboard (Workers & Pages), this file
// is the source of truth — re-paste it there after any edit.
//
// Route:   ukraineaidnexus.org/api/*
// Secrets: GITHUB_TOKEN      fine-grained PAT, repo ua-list, Issues read+write ONLY
//          TURNSTILE_SECRET  Turnstile secret key (pairs with turnstile_sitekey in hugo.toml)
//
// Fundraiser issue bodies use the exact "### Label" headings that
// .github/workflows/fundraiser-issue-to-pr.yml parses. Change one, change both.

const REPO = 'ukraineaidnexus/ua-list';
const ALLOWED_ORIGIN = 'https://ukraineaidnexus.org';

// name attr in the form -> [H3 heading in the issue body, required?]
const TYPES = {
  correction: {
    titlePrefix: '[Correction] ', titleField: 'entry', label: 'correction',
    fields: [
      ['entry', 'Which entry?', true],
      ['entryid', 'Entry ID', false],
      ['details', "What's wrong, and what's your evidence?", true],
    ],
  },
  org: {
    titlePrefix: '[Org] ', titleField: 'name', label: 'org-submission',
    fields: [
      ['name', 'Name', true],
      ['orgtype', 'Type', false],
      ['links', 'Links and social handles', true],
      ['trust', 'Why should this be trusted?', false],
    ],
  },
  fundraiser: {
    titlePrefix: '[Fundraiser] ', titleField: 'title', label: 'fundraiser-submission',
    fields: [
      ['orgname', 'Organisation or volunteer', true],
      ['orgid', 'Org ID', false],
      ['title', 'Fundraiser title', true],
      ['beneficiary', "Who it's for", false],
      ['amount', 'Goal amount (number only)', true],
      ['currency', 'Currency', true],
      ['announced', 'Date announced (YYYY-MM-DD)', false],
      ['post', 'Link to the fundraiser post', true],
      ['donate', 'Direct donation link (optional)', false],
      ['trust', 'Why should this be trusted?', false],
    ],
  },
  creator: {
    titlePrefix: '[Creator] ', titleField: 'name', label: 'creator-submission',
    fields: [
      ['name', 'Name', true],
      ['makes', 'What do they make?', true],
      ['shop', 'Storefront link', true],
      ['links', 'Social handles', false],
      ['notes', 'Notes', false],
    ],
  },
  scammer: {
    titlePrefix: '[Scammer] ', titleField: 'name', label: 'scammer-report',
    fields: [
      ['name', 'Account name(s) and handles', true],
      ['details', 'Documented behaviour', true],
      ['evidence', 'Public evidence links', true],
    ],
  },
  follow: {
    titlePrefix: '[Follow] ', titleField: 'name', label: 'follow-suggestion',
    fields: [
      ['name', 'Name', true],
      ['handles', 'Where to follow them', true],
      ['why', 'Why worth following', true],
    ],
  },
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function clean(v, max) {
  return (v || '').toString()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max || 3000);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/submit') return json({ error: 'Not found' }, 404);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const origin = request.headers.get('Origin') || '';
    if (origin !== ALLOWED_ORIGIN) return json({ error: 'Bad origin' }, 403);

    let fd;
    try { fd = await request.formData(); }
    catch (e) { return json({ error: 'Bad request' }, 400); }

    // Honeypot: bots fill it, humans never see it. Pretend success.
    if (clean(fd.get('website'), 100)) return json({ ok: true });

    // Turnstile verification
    const token = clean(fd.get('cf-turnstile-response'), 4000);
    if (!token) return json({ error: 'Anti-spam check missing. Reload the page and try again.' }, 400);
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || '',
      }),
    });
    const vr = await verify.json();
    if (!vr.success) return json({ error: 'Anti-spam check failed. Reload the page and try again.' }, 400);

    // Type + fields
    const type = clean(fd.get('type'), 20);
    const spec = TYPES[type];
    if (!spec) return json({ error: 'Unknown submission type.' }, 400);

    const values = {};
    for (const [name, , req] of spec.fields) {
      values[name] = clean(fd.get(name));
      if (req && !values[name]) return json({ error: 'Please fill in all required fields.' }, 400);
    }

    // Fundraiser sanity checks (mirrors what the parser expects)
    if (type === 'fundraiser') {
      if (!values.announced) values.announced = new Date().toISOString().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(values.announced)) return json({ error: 'Date must be YYYY-MM-DD.' }, 400);
      if (!/^\d+$/.test(values.amount)) return json({ error: 'Goal amount must be a whole number.' }, 400);
      values.currency = values.currency.toUpperCase();
      if (!/^[A-Z]{3}$/.test(values.currency)) return json({ error: 'Currency must be a 3-letter code, e.g. USD.' }, 400);
      values.orgid = values.orgid.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    const title = (spec.titlePrefix + values[spec.titleField]).slice(0, 120);
    // Card click-throughs carry the org id in a hidden field, so "### Org ID"
    // is prefilled and the fundraiser-issue-to-pr.yml automation works
    // unattended. Generic submissions leave it as "_No response_" and the
    // parser fails safely until the maintainer edits the issue.
    let body = spec.fields
      .map(([name, heading]) => '### ' + heading + '\n\n' + (values[name] || '_No response_') + '\n')
      .join('\n') + '\n---\n_Submitted via the site form._';
    if (type === 'fundraiser' && !values.orgid) {
      body += '\n_Maintainer: edit this issue and put the real org id under "### Org ID" before adding the approved label._';
    }

    const res = await fetch('https://api.github.com/repos/' + REPO + '/issues', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'ukraineaidnexus-submit-worker',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ title: title, body: body, labels: [spec.label] }),
    });

    if (!res.ok) return json({ error: 'Could not file the submission. Please try again later.' }, 502);
    return json({ ok: true });
  },
};
