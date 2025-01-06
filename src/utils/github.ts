export function getRepoInfoFromUrl(repoUrl: string) {
  const urlParts = repoUrl.split("/");
  const owner = urlParts[urlParts.length - 2];
  const repo = urlParts[urlParts.length - 1];
  return { owner, repo };
}
