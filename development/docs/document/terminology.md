# Documentation Terminology

Use these conventions for terminology and presentation choices in Wikibase Suite documentation. Preserve changelog wording when it records text published with an earlier release.

## Wikibase Suite, Wikibase Suite (WBS), and WBS

**Wikibase Suite** is the product name. **WBS** is its standard abbreviation.

Directory README titles establish the documentation area and normally include the full product name: **Wikibase Suite (WBS) Documentation**, **Installing Wikibase Suite (WBS)**, **Configuring Wikibase Suite (WBS)**, and **Operating Wikibase Suite (WBS)**.

Documents within those areas normally rely on that context and name only their task or subject: use **Resetting an Instance** or **Troubleshooting** rather than repeating the product name. Root-level reference documents and documents that need to stand on their own outside the directory context may include the product name, as in **Wikibase Suite (WBS) Glossary**, **Wikibase Suite (WBS) Versions**, or **Upgrading Wikibase Suite (WBS) from 7 to 8**.

When a page title includes the product name, write **Wikibase Suite (WBS)**. Do not use bare **Wikibase Suite** or **WBS** in a page title. When a page title names the Docker Image collection, write **Wikibase Suite (WBS) Docker Images**.

Prefer **Wikibase Suite (WBS)** again at the first meaningful reference in the body, even when the page title has already introduced the abbreviation. In the rest of the page, use either **Wikibase Suite** when the full product name reads better or **WBS** when the abbreviation is clearer and more concise. Do not repeatedly write **Wikibase Suite (WBS)** in body text.

Use **Wikibase Suite** without the abbreviation when:

- the abbreviation has already been introduced;
- the formal product name is clearer or more appropriate than an abbreviation;
- it is part of another proper name, such as **Wikibase Suite Team** or **Wikibase Suite Docker Images**; or
- reproducing an interface label, publication title, or other official text.

Use **WBS** in navigation labels, repeated procedural instructions, and compound terms such as **WBS release**, **WBS configuration**, and **WBS Docker Images**. A short label other than a page title may use **WBS** without defining it when the surrounding page has already established the meaning.

Do not use **the** when the term names the product itself: write “Install WBS,” not “install the WBS.” Use **the** when referring to a specific object or instance, such as “the WBS configuration,” “the WBS release,” or “the WBS server.”

Do not use **Wikibase** as shorthand for **Wikibase Suite**. Wikibase is a service within WBS and is distributed through the Wikibase Docker Image.

## WBS Docker Image terminology

Treat the names of the published WBS Docker Image products as product names. Capitalize **Image** and **Images** when they are part of one of these names, including in prose.

| Use | Term | Example |
| --- | --- | --- |
| Collection, first use | **Wikibase Suite (WBS) Docker Images** | Wikibase Suite (WBS) Docker Images are tested together. |
| Collection, subsequent use | **WBS Docker Images** | Each release can update one or more WBS Docker Images. |
| Unspecified member of the collection | **WBS Docker Image** | Select the WBS Docker Image you want to run. |
| Named member of the collection | **[Product] Docker Image** | Update the Wikibase Docker Image. |
| Short form when the Docker context is already explicit | **WBS Image** or **WBS Images** | The WBS Images use compatible major-version tags. |

Prefer the forms containing **Docker**. Use **WBS Image** or **WBS Images** only when nearby text has already established that the subject is Docker images.

Use the specific product name when referring to one published image, such as **Wikibase Docker Image**, **Query Service Docker Image**, **Query Service frontend Docker Image**, **OpenSearch Docker Image**, **QuickStatements Docker Image**, or **WBS Tools Docker Image**.

Keep **image** lowercase when it is a generic technical noun or refers back to a product name already given. For example:

- A Docker image is a read-only package.
- Pull the image before starting the container.
- The Wikibase Docker Image publishes several image tags.

Do not use slash forms such as **image/s** or **Image/s**. Rewrite the sentence in the singular or plural.
