Security Policy
===

supported versions
---

| Version | Supported |
| ------- | --------- |
| latest  | yes       |

we only support the latest version deployed at https://fortura.cc.

reporting a vulnerability
===

**please do not report security vulnerabilities through public github issues.**

instead, email **security@fortura.cc** with:

- description of the vulnerability
- steps to reproduce
- potential impact
- suggested fix (if any)

what to include
---

1. **type of issue** (e.g., XSS, CSRF, injection, auth bypass)
2. **location** of the affected code (file path, URL, or component)
3. **reproduction steps** - step-by-step instructions
4. **proof-of-concept** - code or screenshots if possible
5. **impact** - what an attacker could achieve

what to expect
---

- **acknowledgment:** within 48 hours
- **initial assessment:** within 7 days
- **fix timeline:** within 30 days for critical issues

we'll keep you informed throughout the process and coordinate disclosure timing with you.

in-scope vulnerabilities
===

we're interested in:

- authentication or authorization bypasses
- injection vulnerabilities (SQL, command, etc.)
- cross-site scripting (XSS)
- cross-site request forgery (CSRF)
- sensitive data exposure
- server-side request forgery (SSRF)
- insecure direct object references
- security misconfigurations

out-of-scope
===

the following are generally not in scope:

- denial of service attacks
- spam or social engineering
- issues in third-party dependencies (report to the upstream project)
- theoretical vulnerabilities without proof-of-concept
- issues requiring physical access to a user's device
- self-XSS or issues requiring victim to paste code

safe harbor
===

we consider security research and vulnerability disclosure activities conducted consistent with this policy to be:

- authorized concerning any applicable anti-hacking laws
- authorized concerning any applicable anti-circumvention laws
- exempt from restrictions in our terms of service that would interfere with conducting security research

we will not initiate legal action against researchers who:

- act in good faith
- avoid privacy violations, data destruction, and service interruption
- report vulnerabilities promptly
- give us reasonable time to address issues before disclosure

recognition
===

we appreciate responsible disclosure. if you'd like, we'll acknowledge your contribution:

- credit in the security advisory
- listing in our security acknowledgments (if we create one)

*last updated: january 2026*
