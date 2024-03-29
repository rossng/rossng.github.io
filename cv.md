---
layout: page
title: CV
permalink: /cv/
---

## Ross Gardiner

**[<i class="fab fa-linkedin-in"></i>](https://www.linkedin.com/in/rngardiner)** &nbsp;
**[<i class="fab fa-github"></i>](https://www.github.com/rossng)** &nbsp; | &nbsp; _Amsterdam, Netherlands_

<br />

I am a software engineer who likes to work on deep tech projects that have real world impact. My main focus is on 3D/CAD technologies and building early-stage products. I'm also interested in functional programming and developer tools.

{% assign sorted_cv_entries = site.cv_entries | sort: "start_date" | reverse %}
{% for cv_entry in sorted_cv_entries %}

<article class="post">
    <h1>{{ cv_entry.position }}, {{ cv_entry.organisation }}</h1>
    <div class="post-info">
        <time datetime="{{ cv_entry.start_date }}">{{ cv_entry.start_date }}</time> to <time datetime="{{ cv_entry.end_date }}">{{ cv_entry.end_date | default: "present" }}</time>
        <ul class="post-tags">
            {% for tag in cv_entry.tags %}
            <li>{{ tag }}</li>
            {% endfor %}
        </ul>
    </div>
    {{ cv_entry.content | markdownify }}
</article>
{% endfor %}
