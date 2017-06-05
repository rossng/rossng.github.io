---
layout: post
title:  Assured Certificates - A Solution to the Certificate Authority Trust Problem?
date:   2016-09-01 21:40:00
categories: security
---
Another month goes by, [another CA is caught issuing certificates incorrectly](https://www.schrauger.com/the-story-of-how-wosign-gave-me-an-ssl-certificate-for-github-com).

It has become clear in recent years that the threat of revocation is simply not a good incentive for CAs to behave properly. Why is this?

* Root certificate revocation is incredibly bad for end users, breaking hundreds of thousands of websites simultaneously. Many sites will not update their certificate for days or weeks, rendering them unusable to the average user during this time.
* Revoking trust is essentially guaranteed to [bankrupt a certificate authority](https://en.wikipedia.org/wiki/DigiNotar). If CAs believe that revealing security lapses will lead to their revocation, they will never reveal these incidents voluntarily.
* As a result of these two factors, root trust stores are extremely reluctant to revoke problematic CAs (e.g. [Trustwave](https://en.wikipedia.org/wiki/Trustwave_Holdings#Unrestricted_sub-CA_incident), [Comodo](https://en.wikipedia.org/wiki/Comodo_Group#Certificate_hacking), [Symantec](https://www.symantec.com/connect/sites/default/files/Test_Certificates_Incident_Final_Report_10_13_2015v3b.pdf))

## What about Certificate Transparency?

Certificate Transparency is a great technical solution, providing a guaranteed-correct audit trail of certificates issued by a CA. It does have some issues, though:

* End users don't see any difference between a CT-enabled CA and a non-CT-enabled CA
  * This may change soon if browser makers start requiring CT
  * My understanding is that, in order for a browser to verify that CT is actually working properly, it must act as an Auditor (see [how CT works](https://www.certificate-transparency.org/how-ct-works))
    * In order to do this, it must communicate with a Monitor periodically
    * The Monitor may be run by the CA (in which case it may not be trustworthy)
    * Monitors and Auditors may be run by independent authorities (e.g. Google, Facebook), in which case you start running into the same distributed trust issues
* There is no financial incentive to audit the Certificate Transparency logs
  * And the system largely relies on certificate owners checking that nobody has issued an invalid certificate for their domain
* You can easily distrust individual certificates that have not been logged properly, but the same issues arise if you have to distrust a CA completely

// TODO: flesh out these ideas

## Assured Certificates

So here is my suggestion of a potential solution: assured certificates.

Essentially, each CA will be able to purchase insurance from a range of insurance providers. These insurers will cross-sign the CA's intermediates, and browsers will be able to verify that both the CA and insurer are trusted.

An insurer can insure a CA up to some amount. If an independent party reports an incorrectly-issued certificate to the insurer, the insurer will pay out that amount to the reporter.

Insurers will be added to insurance root stores through similar programs to those that already exist for CAs ([Mozilla](https://www.mozilla.org/en-US/about/governance/policies/security-group/certs/policy/inclusion/), [Microsoft](https://technet.microsoft.com/en-us/library/cc751157.aspx)).

## What are the downsides?

* Fraudulent insurance claims
