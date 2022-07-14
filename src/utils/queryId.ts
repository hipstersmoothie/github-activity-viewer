import { Repo } from "./types";

const sanitize = (name: string) => name.replace(/[-.\\/]/g, "_");

export const queryId = (repo: Repo) => `id_${repo.id}_${sanitize(repo.name)}`;

export const userQueryId = (actor: { id: string | number; login: string }) =>
  `id_${actor.id}_${sanitize(actor.login)}`;
