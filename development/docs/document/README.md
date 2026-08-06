# User Documentation Presentation (DRAFT)

This page records presentation patterns currently used in the end-user documentation under [`docs/`](../../../docs). It is not a required template or a complete documentation system. Use judgment, adapt the patterns to the material, and revise these notes as the documentation develops.

For product names and other repository terminology, follow [Documentation Terminology](./terminology.md).

## Page Structure

**Start with the purpose.** Use a title and short introduction to explain what the page enables, when it is relevant, and anything readers must understand before they begin. This lets readers confirm that they have found the right page before parsing its details. See [Enabling Login with Wikimedia](../../../docs/configure/login-with-wikimedia.md) and [Resetting an Instance](../../../docs/operate/reset.md).

**Use a compact procedure for a straightforward task.** Put the ordered actions in one numbered list under an **Instructions** heading. Nest commands, choices, explanations, callouts, and screenshots beneath the action they support. See [Installing Extensions](../../../docs/configure/extensions.md).

**Give substantial steps their own sections.** When individual steps contain enough explanation, screenshots, or subsections to benefit from navigation, use numbered level-two headings and omit the **Instructions** heading. See [Installing Wikibase Suite (WBS)](../../../docs/install/README.md) and [Manual Installation](../../../docs/install/manual-install.md).

**Use descriptive sections for distinct procedures or topics.** A page containing several closely related procedures may give each one a descriptive level-two heading. Longer or less closely related tasks may be easier to use as separate pages. See [Backing Up and Restoring](../../../docs/operate/backup-and-restore.md), [Updating and Upgrading](../../../docs/operate/updating.md), and [Troubleshooting](../../../docs/operate/troubleshooting.md).

## Procedure Content

**Number reader actions.** Use numbered items for actions that must be completed in order. Use bullets for choices or supporting information rather than for additional steps.

**Make actions recognizable.** Begin each step with what the reader should do. Format visible interface labels in bold. Use code formatting for filenames, settings, commands, and literal values, and put commands in fenced code blocks.

**Keep supporting information with its action.** Place explanations, commands, callouts, and screenshots directly beneath the relevant step instead of separating them into parallel sections.

**Describe the result.** End with an observable way to confirm that the procedure worked. [Enabling Login with Wikimedia](../../../docs/configure/login-with-wikimedia.md) verifies both the new login option and the complete authorization flow.

## Screenshots and Assets

Screenshots are optional. Include one when it helps readers locate a control, recognize an interface state, or verify a result more clearly than text alone. Place it directly after the step it supports, keep relevant controls readable, preserve enough context for orientation, remove sensitive information, and describe the relevant interface state in the alt text. See [Enabling Login with Wikimedia](../../../docs/configure/login-with-wikimedia.md).

Store supporting files in an `assets/` directory beside the Markdown files they serve and use descriptive filenames. For example, assets for `docs/configure/login-with-wikimedia.md` live under `docs/configure/assets/`.

## Titles and Links

Use title case for page titles. Directory README titles establish their documentation area; pages within that area can usually use a shorter task or subject title. The detailed product-name conventions and examples are in [Documentation Terminology](./terminology.md).

When a link names a document, use its page title. Use contextual link text when pointing readers to a specific section or action. The root [Wikibase Suite (WBS) Documentation](../../../docs/README.md) page uses concise task labels because its purpose is to help readers choose a destination. The migration list in [Updating and Upgrading](../../../docs/operate/updating.md#upgrade-guides) omits repeated wording so that version transitions are easier to scan.

## Callouts

Use callouts only when the information benefits from standing apart from the procedure: `[!NOTE]` for useful context, `[!TIP]` for a more efficient approach, `[!IMPORTANT]` for information required for success, and `[!WARNING]` for security, data-loss, or other harmful risks.
