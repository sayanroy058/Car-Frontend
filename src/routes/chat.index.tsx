import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/States";
import { Seo } from "@/components/site/Seo";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/chat/")({
  component: ChatInbox,
});

function ChatInbox() {
  const { user, conversations, listings } = useApp();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Sign in to view messages</h1>
        <Button asChild className="mt-4">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const mine = isAdmin ? conversations : conversations.filter((c) => c.buyerId === user.id);

  const unreadCount = (c: (typeof conversations)[number]) => {
    const lastRead = c.lastReadAt?.[user.id] ?? 0;
    return c.messages.filter((m) => m.senderId !== user.id && m.createdAt > lastRead).length;
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Seo
        title="Messages — DriveHub"
        description="Your conversations with our team."
        canonical="/chat"
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "All buyer conversations with DriveHub."
            : "Chat with our team about cars you're interested in."}
        </p>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="Start a chat from any car's detail page by tapping the message button."
          icon={<MessageCircle className="h-6 w-6" />}
          action={
            <Button asChild>
              <Link to="/buy">Browse cars</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {mine.map((c) => {
            const listing = listings.find((l) => l.id === c.listingId);
            const last = c.messages[c.messages.length - 1];
            const unread = unreadCount(c);
            return (
              <Link
                key={c.id}
                to="/chat/$id"
                params={{ id: c.id }}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition hover:border-primary/40"
              >
                {listing && (
                  <img
                    src={listing.images[0]}
                    alt=""
                    className="h-14 w-20 flex-none rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-semibold">{c.listingTitle}</div>
                    {last && (
                      <span className="flex-none text-xs text-muted-foreground">
                        {new Date(last.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {last ? `${last.senderId === user.id ? "You: " : ""}${last.text}` : "No messages yet"}
                  </p>
                </div>
                {unread > 0 && (
                  <span className="grid h-6 min-w-6 flex-none place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
