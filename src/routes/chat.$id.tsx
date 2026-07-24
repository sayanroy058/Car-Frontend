import { createFileRoute, Link, notFound, useParams, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Seo } from "@/components/site/Seo";
import { useApp } from "@/lib/store";
import { getConversation, markConversationRead, sendMessage } from "@/lib/api";

export const Route = createFileRoute("/chat/$id")({
  component: ChatThread,
  errorComponent: ({ error }) => (
    <div className="container mx-auto p-10 text-center text-destructive">{String(error)}</div>
  ),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Conversation not found</h1>
      <Button asChild className="mt-4">
        <Link to="/chat">Back to inbox</Link>
      </Button>
    </div>
  ),
});

function ChatThread() {
  const { id } = useParams({ from: "/chat/$id" });
  const { user, conversations, listings } = useApp();
  const nav = useNavigate();
  const conversation = conversations.find((c) => c.id === id);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation && user) markConversationRead(conversation.id, user.id);
  }, [conversation?.id, conversation?.messages.length, user?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Sign in to chat</h1>
        <Button asChild className="mt-4">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!conversation) throw notFound();

  const listing = listings.find((l) => l.id === conversation.listingId);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !conversation || !user) return;
    const msg = text.trim();
    setText("");
    setSending(true);
    try {
      await sendMessage(
        conversation.id,
        {
          senderId: user.id,
          senderName: user.name,
          text: msg,
          mine: true,
        },
        conversation.sellerId,
      );
    } catch {
      toast.error("Failed to send message");
      setText(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Seo title="Chat — DriveHub" description="Conversation with DriveHub team." canonical="/chat" />
      <Link
        to="/chat"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <div className="mt-4 rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 p-4">
          <div>
            <div className="font-semibold">{conversation.listingTitle}</div>
            <div className="text-xs text-muted-foreground">
              {user.role === "admin" ? `Buyer #${conversation.buyerId}` : `with ${conversation.sellerName}`}
            </div>
          </div>
          {listing && (
            <Button asChild size="sm" variant="outline">
              <Link to="/buy/$id" params={{ id: listing.id }}>
                View car
              </Link>
            </Button>
          )}
        </div>

        <div className="flex h-[55vh] flex-col gap-3 overflow-y-auto p-4">
          {conversation.messages.length === 0 ? (
            <p className="m-auto text-sm text-muted-foreground">No messages yet. Say hello!</p>
          ) : (
            conversation.messages.map((m) => {
              const mine = m.senderId === user.id;
              return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-secondary text-foreground"
                  }`}
                >
                  {m.text}
                  <div
                    className={`mt-0.5 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-border/60 p-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={!text.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
