/**
 * Serialise a JSON-LD payload safely for injection into a `<script>` tag.
 *
 * JSON.stringify does not escape `<`, `>`, `&`, or the line separators
 * U+2028 / U+2029. A value that reaches the payload from editable content —
 * a dish name set in the admin — could otherwise break out of the
 * `<script type="application/ld+json">` block. Escaping the dangerous
 * sequences keeps the JSON valid while making break-out impossible.
 */
const LS = new RegExp('\\u2028', 'g')
const PS = new RegExp('\\u2029', 'g')

export function ldjson(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LS, '\\u2028')
    .replace(PS, '\\u2029')
}
