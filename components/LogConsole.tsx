'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import type { LogEntry } from '@/types';

interface LogConsoleProps {
  logs: LogEntry[];
}

const LEVEL_STYLES: Record<LogEntry['level'], { line: string; badge: string; prefix: string }> = {
  info:    { line: 'text-fg',         badge: 'bg-accent-muted text-accent-fg border-accent-muted', prefix: 'INFO ' },
  success: { line: 'text-success-fg', badge: 'bg-success-muted text-success-fg border-success-muted', prefix: 'DONE ' },
  warn:    { line: 'text-attention-fg', badge: 'bg-attention-muted text-attention-fg border-attention-muted', prefix: 'WARN ' },
  error:   { line: 'text-danger-fg',  badge: 'bg-danger-muted text-danger-fg border-danger-muted', prefix: 'ERR  ' },
  system:  { line: 'text-done-fg',    badge: 'bg-done-muted text-done-fg border-done-muted', prefix: 'SYS  ' },
};

function formatTimestamp(tick: number): string {
  return `T+${String(tick).padStart(4, '0')}`;
}

export default function LogConsole({ logs }: LogConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  // Auto-scroll unless user manually scrolled up
  useEffect(() => {
    const container = containerRef.current;
    if (!container || userScrolledRef.current) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [logs]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 40;
    userScrolledRef.current = !isAtBottom;
  };

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-canvas flex-shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono text-fg-muted">
          <Terminal size={13} className="text-fg-subtle" />
          <span>thread.log_stream</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-fg-subtle">{logs.length} entries</span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-success-fg">
            <span className="w-1.5 h-1.5 rounded-full bg-success-emphasis animate-pulse" />
            live
          </span>
        </div>
      </div>

      {/* Log Lines */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto font-mono text-[11px] bg-[#fafbfc] min-h-0"
        style={{ maxHeight: '340px' }}
      >
        {logs.length === 0 ? (
          <div className="p-4 text-fg-subtle text-center text-xs">
            No logs yet — click <span className="font-semibold">Simulate</span> to begin
          </div>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {logs.map((log, idx) => {
                const style = LEVEL_STYLES[log.level];
                return (
                  <tr
                    key={log.id}
                    className={`border-b border-canvas-subtle hover:bg-canvas transition-colors ${
                      idx === logs.length - 1 ? 'animate-fade-in' : ''
                    }`}
                  >
                    {/* Tick */}
                    <td className="py-1 px-3 text-fg-subtle whitespace-nowrap w-16 select-none">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    {/* Level badge */}
                    <td className="py-1 px-2 w-14">
                      <span className={`inline-block rounded px-1 py-0.5 text-[9px] border ${style.badge}`}>
                        {style.prefix.trim()}
                      </span>
                    </td>
                    {/* Message */}
                    <td className={`py-1 px-2 ${style.line}`}>
                      {log.message}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-border bg-canvas text-[10px] font-mono text-fg-subtle flex items-center gap-1 flex-shrink-0">
        <span className="animate-blink">_</span>
        <span>auto-scroll enabled · max 500 entries</span>
      </div>
    </div>
  );
}
