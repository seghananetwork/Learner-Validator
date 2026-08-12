import { ValidatedLearner } from "./constants";
import { buildWorkbookBase64 } from "./xlsx-export";
import { queueSubmission, getQueue, removeFromQueue, QueuedSubmission } from "./db";

async function sendToServer(sub: QueuedSubmission, hubName: string) {
  const fileBase64 = buildWorkbookBase64(sub.learners);
  const fileName = `${hubName}-validated-${sub.createdAt.slice(0, 10)}-${sub.id.slice(0, 6)}.xlsx`;
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileBase64,
      fileName,
      submittedBy: sub.submittedBy,
      hub: sub.hub,
      hubName,
      learners: sub.learners,
    }),
  });
  if (!res.ok) throw new Error("send failed");
}

/** Try to send immediately; if it fails (offline, timeout, server error) queue it for later. */
export async function submitOrQueue(
  hub: string,
  hubName: string,
  learners: ValidatedLearner[],
  submittedBy: string
): Promise<"sent" | "queued"> {
  const sub: QueuedSubmission = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    submittedBy,
    hub,
    learners,
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await queueSubmission(sub);
    return "queued";
  }

  try {
    await sendToServer(sub, hubName);
    return "sent";
  } catch {
    await queueSubmission(sub);
    return "queued";
  }
}

/** Flush anything queued while offline. Call on reconnect. */
export async function flushQueue(hub: string, hubName: string): Promise<number> {
  const queue = await getQueue(hub);
  let sentCount = 0;
  for (const sub of queue) {
    try {
      await sendToServer(sub, hubName);
      await removeFromQueue(hub, sub.id);
      sentCount++;
    } catch {
      // still offline or server unreachable — leave it queued
    }
  }
  return sentCount;
}
