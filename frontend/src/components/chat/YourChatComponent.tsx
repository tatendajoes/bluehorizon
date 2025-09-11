import React, { useEffect, useMemo, useRef, useState } from "react";
import { useActions } from "../../contexts/ActionContext";
import { useTheme } from "../../contexts/ThemeContext";

// --- Types ---
export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: string; // ISO
  error?: boolean;
};

// --- Mock data layer (simulates backend) ---
const mockHistory: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "What is the current status?",
    ts: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
  {
    id: "m2",
    role: "assistant",
    content: "Currently safe. pH 7.2, NTU 1.1, TDS 220 mg/L.",
    ts: new Date(Date.now() - 1000 * 60 * 6 + 12_000).toISOString(),
  },
  {
    id: "m3",
    role: "user",
    content: "Explain why it's safe.",
    ts: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "m4",
    role: "assistant",
    content:
      "All metrics are within the configured limits (WHO v1.3). Turbidity is below 5 NTU and pH is between 6.5 and 8.5.",
    ts: new Date(Date.now() - 1000 * 60 * 4 + 8_000).toISOString(),
  },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadHistory(deviceId: string): Promise<ChatMessage[]> {
  await sleep(400);
  return mockHistory;
}

// Simulates streaming tokens coming from backend
async function* streamAssistantResponse(prompt: string): AsyncGenerator<string> {
  const fake =
    "Here is a short rationale based on the last 24h metrics: pH stable, turbidity low, TDS moderate.";
  const tokens = fake.split(" ");
  for (const t of tokens) {
    await sleep(80);
    yield t + " ";
  }
}

// --- UI Helpers ---
function timeShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ConnectionDot({ status }: { status: "connected" | "reconnecting" | "offline" }) {
  const color = status === "connected" ? "bg-emerald-500" : status === "reconnecting" ? "bg-amber-500" : "bg-gray-400";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

// --- Main Chat Component ---
export default function YourChatComponent() {
  const { isChatOpen, setIsChatOpen } = useActions();
  const [unread, setUnread] = useState(0);
  const [connection, setConnection] = useState<"connected" | "reconnecting" | "offline">("connected");
  const [deviceId] = useState("WQ-001");

  // Simulate a new message arriving when the panel is closed
  useEffect(() => {
    const t = setInterval(() => {
      if (!isChatOpen) setUnread((u) => (u < 9 ? u + 1 : u));
    }, 12000);
    return () => clearInterval(t);
  }, [isChatOpen]);

  return (
    <>
      {/* Chat Content Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 overflow-hidden text-gray-700 dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-lg dark:text-gray-300">
        <div className="bg-gray-100 rounded-lg p-4 dark:bg-black/20">
          {isChatOpen ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 text-sm dark:text-gray-400">Chat panel is open</p>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center">
              {/* <p className="text-gray-400 text-sm mb-3 text-center">Quick questions you can ask:</p> */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Any issues detected?",
                  "Export today's data",
                  "How's the pH trend?"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsChatOpen(true);
                      // Store the question to populate chat input
                      sessionStorage.setItem('pendingQuestion', question);
                    }}
                    className="px-3 py-1.5 text-xs bg-sky-100 text-sky-800 rounded-full border border-sky-200 hover:bg-sky-200 transition-colors cursor-pointer dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20 dark:hover:bg-sky-500/20"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sheet - Rendered outside the preview container */}
      <ChatSheet
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        deviceId={deviceId}
        setUnread={setUnread}
        setConnection={setConnection}
      />
    </>
  );
}

// --- Chat Trigger Button ---
function ChatTriggerButton({ unread, isOpen, onToggle }: { unread: number; isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle chat"
      className="relative inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 active:scale-[0.98]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
        <path d="M3 12a9 9 0 1 0 5.3-8.2L3 3l1.8 5.3A9 9 0 0 0 3 12z" />
      </svg>
      <span className="hidden sm:inline">Chat</span>
      {unread > 0 && !isOpen && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white shadow">
          {unread}
        </span>
      )}
    </button>
  );
}

// --- Chat Sheet (slide‑in panel) ---
function ChatSheet({ isOpen, onClose, deviceId, setUnread, setConnection }: { isOpen: boolean; onClose: () => void; deviceId: string; setUnread: (u: number | ((x: number) => number)) => void; setConnection: (s: "connected" | "reconnecting" | "offline") => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Load history when opened
  useEffect(() => {
    let mounted = true;
    if (isOpen) {
      setUnread(0);
      setLoading(true);
      
      // Check for pending question from quick questions
      const pendingQuestion = sessionStorage.getItem('pendingQuestion');
      if (pendingQuestion) {
        setInput(pendingQuestion);
        sessionStorage.removeItem('pendingQuestion');
      }
      
      loadHistory(deviceId)
        .then((h) => mounted && setMessages(h))
        .finally(() => mounted && setLoading(false));
    }
    return () => {
      mounted = false;
    };
  }, [isOpen, deviceId, setUnread]);

  // Auto‑scroll to bottom on message change when open
  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, ts: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    setStreaming(true);

    // Provisional assistant message to stream into
    const assistantId = crypto.randomUUID();
    setMessages((m) => [
      ...m,
      { id: assistantId, role: "assistant", content: "", ts: new Date().toISOString() },
    ]);

    try {
      // Simulate occasional reconnect state
      setConnection("reconnecting");
      await sleep(150);
      setConnection("connected");

      for await (const token of streamAssistantResponse(text)) {
        setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + token } : msg)));
      }
    } catch (e) {
      setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, content: "(error)", error: true } : msg)));
    } finally {
      setSending(false);
      setStreaming(false);
    }
  }

  function handleClear() {
    if (!confirm("Clear chat history for this device?")) return;
    setMessages([]);
  }

  function handleRefresh() {
    setLoading(true);
    loadHistory(deviceId)
      .then((h) => setMessages(h))
      .finally(() => setLoading(false));
  }

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity ${isOpen ? "opacity-100 pointer-events-auto" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 h-[90vh] w-full sm:w-[90vw] md:w-[60vw] lg:w-[40vw] xl:w-[25vw] min-w-[320px] max-w-[520px] border-l border-gray-200 bg-white/80 backdrop-blur-xl shadow-2xl transition-all duration-250 ease-out dark:border-white/10 dark:bg-gray-900/80 ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">Chat</span>
            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">{deviceId}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Refresh */}
            <IconButton label="Refresh" onClick={handleRefresh} disabled={loading}>
              <RefreshIcon spinning={loading} />
            </IconButton>
            {/* Clear */}
            <IconButton label="Clear history" onClick={handleClear} disabled={messages.length === 0}>
              <TrashIcon />
            </IconButton>
            {/* Close */}
            <IconButton label="Close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex h-[calc(90vh-8rem)] flex-col gap-3 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading history…</div>
          ) : messages.length === 0 ? (
            <ChatEmptyState onPick={(t) => setInput(t)} />
          ) : (
            messages.map((m) => <ChatMessageItem key={m.id} m={m} />)
          )}
          {streaming && <TypingIndicator />}
        </div>

        {/* Composer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white/80 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/80">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder="Message…"
              className="max-h-28 flex-1 resize-none rounded-xl border border-gray-300 bg-white p-2.5 text-sm text-gray-800 outline-none ring-0 focus:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-gray-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!sending) handleSend();
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-300 bg-gray-800 px-3 text-sm font-medium text-gray-100 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
          <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">Informational purposes only · WHO ruleset v1.3</div>
        </div>
      </aside>
    </>
  );
}

function ChatMessageItem({ m }: { m: ChatMessage }) {
  const align = m.role === "user" ? "items-end" : "items-start";
  const bubble =
    m.role === "user"
      ? "bg-sky-600 text-white"
      : m.role === "assistant"
      ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      : "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/30";

  return (
    <div className={`flex flex-col ${align}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${bubble}`}>
        {m.content}
      </div>
      <span className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{timeShort(m.ts)}</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <span className="inline-flex h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.2s] dark:bg-gray-500" />
      <span className="inline-flex h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" />
      <span className="inline-flex h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s] dark:bg-gray-500" />
      <span>Assistant is typing…</span>
    </div>
  );
}

function ChatEmptyState({ onPick }: { onPick: (text: string) => void }) {
  const suggestions = [
    "Summarize water quality in the last 24h",
    "Why did status change at 14:20?",
    "Compare current pH to limits",
  ];
  return (
    <div className="mx-auto mt-10 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="mb-3 text-gray-800 dark:text-gray-200">No messages yet</div>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-full border border-gray-300 bg-gray-100/50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function IconButton({ label, disabled, onClick, children }: React.PropsWithChildren<{ label: string; disabled?: boolean; onClick?: () => void }>) {
  return (
    <button
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-gray-50/50 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? "animate-spin" : undefined}
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}
