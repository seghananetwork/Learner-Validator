import { get, set, del } from "idb-keyval";
import { ValidatedLearner, Learner, toValidatedLearner } from "./constants";

const LEARNERS_KEY = "agritech:learners";
const QUEUE_KEY = "agritech:submission-queue";

export async function loadLearners(seed: Learner[]): Promise<ValidatedLearner[]> {
  const existing = await get<ValidatedLearner[]>(LEARNERS_KEY);
  if (existing && existing.length) return existing;
  const seeded = seed.map(toValidatedLearner);
  await set(LEARNERS_KEY, seeded);
  return seeded;
}

export async function saveLearners(learners: ValidatedLearner[]): Promise<void> {
  await set(LEARNERS_KEY, learners);
}

export async function resetLearners(seed: Learner[]): Promise<ValidatedLearner[]> {
  const seeded = seed.map(toValidatedLearner);
  await set(LEARNERS_KEY, seeded);
  return seeded;
}

export type QueuedSubmission = {
  id: string;
  createdAt: string;
  submittedBy: string;
  learners: ValidatedLearner[];
};

export async function queueSubmission(sub: QueuedSubmission): Promise<void> {
  const queue = (await get<QueuedSubmission[]>(QUEUE_KEY)) || [];
  queue.push(sub);
  await set(QUEUE_KEY, queue);
}

export async function getQueue(): Promise<QueuedSubmission[]> {
  return (await get<QueuedSubmission[]>(QUEUE_KEY)) || [];
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = (await get<QueuedSubmission[]>(QUEUE_KEY)) || [];
  await set(
    QUEUE_KEY,
    queue.filter((q) => q.id !== id)
  );
}

export async function clearQueue(): Promise<void> {
  await del(QUEUE_KEY);
}
