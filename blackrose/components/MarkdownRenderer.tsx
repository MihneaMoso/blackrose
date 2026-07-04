'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-4xl md:text-5xl font-serif text-rose-200 mb-8 tracking-wide">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl md:text-3xl font-serif text-rose-200 mt-12 mb-4 tracking-wide">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-serif text-rose-200 mt-8 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-zinc-300 leading-relaxed mb-5 text-base md:text-lg font-light">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-2 mb-6 text-zinc-300 font-light">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2 mb-6 text-zinc-300 font-light list-decimal list-inside">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 before:content-['—'] before:text-rose-200 before:mr-2">
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-rose-200/40 pl-6 italic text-zinc-400 mb-6">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-rose-200 underline underline-offset-2 decoration-rose-200/30 hover:decoration-rose-200 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="text-zinc-100 font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="text-rose-200/80">{children}</em>,
  hr: () => (
    <hr className="border-t border-white/5 my-12" />
  ),
  img: ({ src, alt }) => (
    <div className="my-8 rounded-xl overflow-hidden border border-white/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ''}
        className="w-full h-auto object-cover"
      />
    </div>
  ),
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="max-w-3xl mx-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
