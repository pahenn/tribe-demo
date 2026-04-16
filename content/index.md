---
seo:
  title: King James Bible — A Knowledge Graph
  description: The complete King James Version, restructured as a navigable knowledge graph. Every chapter annotated with people, places, topics, and cross-references.
---

::u-page-hero
#title
The Bible as a Knowledge Graph

#description
The complete King James Version — all 66 books, 1,189 chapters — restructured and annotated with rich metadata. Every chapter tagged with the people, places, topics, and events it contains. Every connection between passages made explicit and navigable.

This is not a reading app. It is the scripture made searchable, linkable, and explorable as structured data.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /docs/old-testament/genesis
  trailing-icon: i-lucide-book-open
  ---
  Browse Books
  :::

  :::u-button
  ---
  color: neutral
  size: xl
  to: /explore
  variant: outline
  trailing-icon: i-lucide-compass
  ---
  Explore the Graph
  :::

::

::u-page-section
#title
What is this?

#description
An experiment in treating ancient text as modern data.

The King James Bible was published in 1611. For four centuries it has been read linearly — Genesis to Revelation, front to back. But scripture was never written that way. It is a web of references, callbacks, prophecies, and fulfillments spanning thousands of years of human history.

This project takes the full KJV text and layers structured metadata onto every chapter: who appears, where events take place, what themes are present, and how passages connect to one another across testaments. The result is a knowledge graph — a Bible you can query, filter, and traverse by relationship rather than by page number.
::

::u-page-section
#title
How it was built

#description
The entire pipeline is automated and reproducible.

#features
  :::u-page-feature
  ---
  icon: i-lucide-file-text
  ---
  #title
  1,189 Markdown Files

  #description
  Each chapter of the Bible lives in its own file with YAML frontmatter. The content is the original KJV text. The metadata is structured data layered on top — people, locations, topics, era, key verses, and cross-references.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-brain
  ---
  #title
  AI-Generated Metadata

  #description
  Claude read every chapter and extracted structured annotations — identifying people by role (protagonist, speaker, mentioned), tagging locations and time periods, surfacing thematic connections, and generating cross-references between related passages.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-search
  ---
  #title
  Full-Text Search

  #description
  Built on Nuxt Content's SQLite-backed search. Find any verse, person, or place instantly. Every piece of metadata is indexed and queryable — search for "Moses" and find every chapter where he appears.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-git-branch
  ---
  #title
  Open and Reproducible

  #description
  The source text is public domain. The splitting, annotation, and enrichment scripts are in the repository. Every step from raw markdown to knowledge graph can be re-run and verified.
  :::
::

::u-page-section
#title
The structure

#features
  :::u-page-feature
  ---
  icon: i-lucide-scroll-text
  ---
  #title
  Old Testament

  #description
  39 books from Genesis to Malachi. Law, history, poetry, and prophecy — the foundation of the biblical narrative, from creation through exile and return.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-book-open
  ---
  #title
  New Testament

  #description
  27 books from Matthew to Revelation. Gospels, letters, and apocalyptic vision — the life of Christ, the birth of the church, and the arc of history toward its conclusion.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-tags
  ---
  #title
  Rich Annotations

  #description
  Every chapter is tagged with people (by role), geographic locations, historical era, thematic topics, major events, key verses, and cross-references to related passages across the entire Bible.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-network
  ---
  #title
  Cross-References

  #description
  The graph in knowledge graph. Explicit links between chapters that share people, fulfill prophecies, or echo themes across testaments — making the Bible's internal structure visible and navigable.
  :::
::

::u-page-section
#title
Why the KJV?

#description
The King James Version is in the public domain in the United States. Published in 1611 under commission from King James I of England, it remains one of the most influential works in the English language. Its translation shaped English prose, gave us hundreds of common phrases, and remains widely read over four hundred years later.

This project uses the KJV not because it is the best translation for study — modern scholarship has produced more accurate renderings — but because it is freely available, universally recognized, and beautiful. The public domain status means this knowledge graph can be forked, modified, and redistributed without restriction.
::

::u-page-section
#title
Start exploring

#description
Pick a book, search for a person, or follow a thread across testaments.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /docs/old-testament/genesis/chapter-1
  trailing-icon: i-lucide-arrow-right
  ---
  Genesis 1
  :::

  :::u-button
  ---
  color: neutral
  size: xl
  to: /docs/new-testament/matthew/chapter-1
  trailing-icon: i-lucide-arrow-right
  ---
  Matthew 1
  :::

  :::u-button
  ---
  color: neutral
  size: xl
  to: /docs/new-testament/john/chapter-1
  trailing-icon: i-lucide-arrow-right
  ---
  John 1
  :::
::
