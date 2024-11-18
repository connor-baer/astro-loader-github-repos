import type { Loader } from "astro/loaders";
import { Octokit } from "octokit";

import { RepoSchema, type Repo } from "./schema.js";

export type { Repo };

type GitHubReposLoaderOptions = {
	/**
	 * A GitHub access token such as a personal access token or a GitHub App user
	 * access token, with at least the "Metadata" repository permissions (read).
	 * Optional if only public repositories are requested.
	 * See the [GitHub API Authentication docs](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28) for more details.
	 */
	auth?: string;
	/**
	 * The organization name for which to fetch the repositories.
	 * The name is not case sensitive.
	 */
	org: string;
	/**
	 * The types of repositories to fetch.
	 *
	 * @default "public"
	 */
	type?: "all" | "public" | "private" | "forks" | "sources" | "member";
};

export function githubReposLoader({
	auth,
	org,
	type = "public",
}: GitHubReposLoaderOptions): Loader {
	const octokit = new Octokit({ auth });

	return {
		name: "github-repos-loader",
		schema: RepoSchema,
		load: async ({ store, logger, generateDigest }) => {
			logger.info(`Loading GitHub repositories for ${org}`);

			try {
				const iterator = octokit.paginate.iterator(
					octokit.rest.repos.listForOrg,
					{
						org,
						type,
						headers: { "X-GitHub-Api-Version": "2022-11-28" },
					},
				);

				for await (const { data: repos } of iterator) {
					for (const repo of repos) {
						store.set({
							id: repo.id.toString(),
							data: repo satisfies Repo,
							digest: generateDigest(repo),
						});
					}
				}
			} catch (error) {
				logger.error(
					`Failed to load GitHub repositories. ${(error as Error).message}`,
				);
			}
		},
	};
}
