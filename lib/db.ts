import { get, set, del } from "idb-keyval";
import { ValidatedLearner } from "./constants";

const learnersKey = (hub: string) => `hub:${hub}:learners`;
const queueKey = (hub: string) => `hub:${hub}:submission-queue`;

export async function getCachedLearners(hub: string): Promise<ValidatedLearner[] | null> {
  return (await get<ValidatedLearner[]>(learnersKey(hub))) || null;
}

export async function saveLearners(hub: string, learners: ValidatedLearner[]): Promise<void> {
  await set(learnersKey(hub), learners);
}

export type QueuedSubmission = {
  id: string;
  createdAt: string;
  submittedBy: string;
  hub: string;
  learners: ValidatedLearner[];
};

export async function queueSubmission(sub: QueuedSubmission): Promise<void> {
  const queue = (await get<QueuedSubmission[]>(queueKey(sub.hub))) || [];
  queue.push(sub);
  await set(queueKey(sub.hub), queue);
}

export async function getQueue(hub: string): Promise<QueuedSubmission[]> {
  return (await get<QueuedSubmission[]>(queueKey(hub))) || [];
}

export async function removeFromQueue(hub: string, id: string): Promise<void> {
  const queue = (await get<QueuedSubmission[]>(queueKey(hub))) || [];
  await set(
    queueKey(hub),
    queue.filter((q) => q.id !== id)
  );
}

export async function clearQueue(hub: string): Promise<void> {
  await del(queueKey(hub));
}
