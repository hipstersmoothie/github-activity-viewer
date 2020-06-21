import { Repo } from "./types";

export const queryId = (repo: Repo) =>
  `id_${repo.id}_${repo.name.split("/")[0].replace(/-/g, "_")}`;
