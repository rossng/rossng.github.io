import Giscus from "@giscus/react";

export function Comments() {
  return (
    <Giscus
      id="comments"
      repo="rossng/rossng.github.io"
      repoId="MDEwOlJlcG9zaXRvcnkzMzU0ODExNA=="
      category="Comments"
      categoryId="DIC_kwDOAf_nUs4Cl5JL"
      mapping="pathname"
      strict="1"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="bottom"
      theme="light"
      lang="en"
      loading="lazy"
    />
  );
}
