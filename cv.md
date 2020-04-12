---
layout: page
title: CV
permalink: /cv/
---

**[<i class="fab fa-linkedin-in"></i>](https://www.linkedin.com/in/rngardiner)**

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