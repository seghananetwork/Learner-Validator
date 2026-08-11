import { ValidatedLearner } from "./constants";
import { buildWorkbookBase64 } from "./xlsx-export";
import { queueSubmission, getQueue, removeFromQueue, QueuedSubmission } from "./db";

async function sendToServer(sub: QueuedSubmission, hub: string) {
  const fileBase64 = buildWorkbookBase64(sub.learners);
  const fileName = `${hub}-validated-${sub.createdAt.slice(0, 10)}-${sub.id.slice(0, 6)}.xlsx`;
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileBase64,
      fileName,
      submittedBy: sub.submittedBy,
      hub,
      learnerCount: sub.learners.length,
    }),
  });
  if (!res.ok) throw new Error("send failed");
}

/** Try to send immediately; if it fails (offline, timeout, server error) queue it for later. */
export async function submitOrQueue(
  learners: ValidatedLearner[],
  submittedBy: string,
  hub: string
): Promise<"sent" | "queued"> {
  const sub: QueuedSubmission = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    submittedBy,
    learners,
  };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await queueSubmission(sub);
    return "queued";
  }

  try {
    await sendToServer(sub, hub);
    return "sent";
  } catch {
    await queueSubmission(sub);
    return "queued";
  }
}

/** Flush anything queued while offline. Call on reconnect. */
export async function flushQueue(hub: string): Promise<number> {
  const queue = await getQueue();
  let sentCount = 0;
  for (const sub of queue) {
    try {
      await sendToServer(sub, hub);
      await removeFromQueue(sub.id);
      sentCount++;
    } catch {
      // still offline or server unreachable — leave it queued
    }
  }
  return sentCount;
}
