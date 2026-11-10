import type { ReactNode } from 'react'

const BULLET = /^\s*[-*•]\s+/
const NUMBERED = /^\s*\d+[.)]\s+/
const HEADING = /^\s*#{1,6}\s+/

/** "**bold**" inside a line as <strong>; everything else stays plain text (never HTML). */
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    )
}

/**
 * The assistant answers in light Markdown. Paragraphs, bullet and numbered lists, headings and bold are rendered as
 * React text; any other markup shows as typed, so a reply can never inject HTML.
 */
export function ChatMessageText({ content }: { content: string }) {
  const blocks = content.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return (
    <div className='space-y-2 break-words'>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').filter((line) => line.trim().length > 0)
        if (lines.length === 0) return null
        if (lines.every((line) => BULLET.test(line))) {
          return (
            <ul className='list-disc space-y-1 pl-5' key={blockIndex}>
              {lines.map((line, index) => (
                <li key={index}>{inline(line.replace(BULLET, ''))}</li>
              ))}
            </ul>
          )
        }
        if (lines.every((line) => NUMBERED.test(line))) {
          return (
            <ol className='list-decimal space-y-1 pl-5' key={blockIndex}>
              {lines.map((line, index) => (
                <li key={index}>{inline(line.replace(NUMBERED, ''))}</li>
              ))}
            </ol>
          )
        }
        return (
          <p className='whitespace-pre-line' key={blockIndex}>
            {lines.map((line, index) => (
              <span key={index}>
                {index > 0 ? '\n' : null}
                {HEADING.test(line) ? <strong>{inline(line.replace(HEADING, ''))}</strong> : inline(line)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}
