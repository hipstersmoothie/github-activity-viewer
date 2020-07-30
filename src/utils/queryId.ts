import { Repo } from "./types";

const sanitize = (name: string) => name.split("/")[1].replace(/[-.]/g, "_");

export const queryId = (repo: Repo) => `id_${repo.id}_${sanitize(repo.name)}`;
