import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { api } from "../lib/api";
import { Card, CardBody, Button, Input, Label, Select, Textarea } from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function Broadcast() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("INFO");
  const [link, setLink] = useState("");
  const [userIdsText, setUserIdsText] = useState("");

  const sendMut = useMutation({
    mutationFn: async () => {
      const userIds = userIdsText
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const payload: any = { title, body, type };
      if (link) payload.link = link;
      if (userIds.length > 0) payload.userIds = userIds;
      return (await api.post("/admin/content/notifications/broadcast", payload)).data;
    },
    onSuccess: (data: any) => {
      toast.success(`Sent to ${data.sent} user${data.sent === 1 ? "" : "s"}`);
      setTitle(""); setBody(""); setLink(""); setUserIdsText("");
    },
  });

  return (
    <div className="p-8">
      <PageHeader title="Broadcast" description="Send a notification to all users or to a specific list" />

      <Card className="max-w-3xl">
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="System maintenance notice" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option>INFO</option><option>SUCCESS</option><option>WARNING</option><option>DANGER</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Body</Label>
              <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message body…" />
            </div>
            <div>
              <Label>Optional link</Label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://… (optional)" />
            </div>
            <div>
              <Label>User IDs (leave empty to send to ALL users)</Label>
              <Textarea
                rows={3}
                value={userIdsText}
                onChange={(e) => setUserIdsText(e.target.value)}
                placeholder="Comma- or whitespace-separated user IDs"
              />
            </div>
            <Button onClick={() => sendMut.mutate()} loading={sendMut.isPending} disabled={!title || !body}>
              <Send className="w-4 h-4" /> Send
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
