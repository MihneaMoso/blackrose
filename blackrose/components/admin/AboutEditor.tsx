'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Save, Loader2, Eye, Edit3, CheckCircle, XCircle } from 'lucide-react'

type ToastType = 'success' | 'error' | null

export default function AboutEditor() {
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'split' | 'edit' | 'preview'>('split')

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    fetch('/api/pages?slug=about')
      .then((res) => res.json())
      .then((data) => {
        setContent(data.content ?? '')
        setSavedContent(data.content ?? '')
      })
      .catch(() => setError('Failed to load page content'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'about', content }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to save')
      }
      setSavedContent(content)
      showToast('success', 'About page updated successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      setError(message)
      showToast('error', message)
    } finally {
      setSaving(false)
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length
  const hasChanges = content !== savedContent

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-rose-200 animate-spin" />
      </div>
    )
  }

  if (error && !content) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
        <XCircle className="h-10 w-10 text-red-400 mb-4" />
        <p className="text-lg font-light">Failed to load page content</p>
        <p className="text-sm text-zinc-500 mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              previewMode === 'edit'
                ? 'bg-rose-200/10 text-rose-200'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setPreviewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              previewMode === 'split'
                ? 'bg-rose-200/10 text-rose-200'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            Split
          </button>
          <button
            onClick={() => setPreviewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              previewMode === 'preview'
                ? 'bg-rose-200/10 text-rose-200'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">
            {wordCount} words · {charCount} characters
          </span>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              saving || !hasChanges
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-rose-200/10 text-rose-200 hover:bg-rose-200/20 active:scale-95'
            }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            toast.type === 'success'
              ? 'bg-emerald-900/20 border-emerald-800/30 text-emerald-300'
              : 'bg-red-900/20 border-red-800/30 text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Editor / Preview */}
      <div
        className={`rounded-xl border border-white/5 bg-zinc-900/50 overflow-hidden ${
          previewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5' : ''
        }`}
      >
        {/* Edit panel */}
        {previewMode !== 'preview' && (
          <div className="flex flex-col">
            <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/80">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Markdown
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] lg:min-h-[600px] bg-transparent text-zinc-200 font-mono text-sm p-4 resize-none focus:outline-none placeholder-zinc-600 leading-relaxed"
              placeholder="Write your markdown content here..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview panel */}
        {previewMode !== 'edit' && (
          <div className="flex flex-col">
            <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/80">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Preview
              </span>
            </div>
            <div className="min-h-[500px] lg:min-h-[600px] p-6 overflow-y-auto">
              {content.trim() ? (
                <div className="prose-custom">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                  <div className="text-center">
                    <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>Start typing markdown to see the preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
