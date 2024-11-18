# Astro Loader for GitHub Repositories

This package enables you to load the data of the repositories in a GitHub org, and use the data in your Astro site.

Currently it provides `githubReposLoader`, which loads the repositories of a single org. By default it will load all repositories, but you can filter the types of repos loaded.

## Installation

```sh
npm install astro-loader-github-repos
```

## Usage

This package requires Astro 4.14.0 or later. You must enable the experimental content layer in Astro unless you are using version 5.0.0-beta or later. You can do this by adding the following to your `astro.config.mjs`:

```javascript
export default defineConfig({
  // ...
  experimental: {
    contentLayer: true,
  },
});
```

You can then use the loader in your content configuration:

```typescript
// src/content/config.ts
import { defineCollection } from "astro:content";
import { githubReposLoader } from "astro-loader-github-repos";

const repos = defineCollection({
  loader: githubReposLoader({
    auth: "YOUR-TOKEN", // Optional if only public repositories are requested
    org: "withastro",
    type: "public",
  }),
  // The loader provides its own type schema, so you don't need to provide one
});

export const collections = { repos };
```

You can then use these like any other content collection in Astro:

```astro
---
import { getCollection } from "astro:content";
import Layout from "../layouts/Layout.astro";

const repos = await getCollection("repos");
---

<Layout>
  {
    repos.map(async (repo) => (
      <div>
        <a href={repo.data.url}>{repo.data.name}</a>
        <span>{repo.data.stargazers_count} stars</span>
      </div>
    ))
  }
</Layout>

```

## Options

The `githubReposLoader` function takes an options object with the following properties:

- `auth`: A GitHub access token such as a personal access token or a GitHub App user access token, with at least the "Metadata" repository permissions (read). Optional if only public repositories are requested. See the [GitHub API Authentication docs](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28) for more details.
- `org`: The organization name for which to fetch the repositories. The name is not case sensitive.
- `type`: The types of repositories to fetch. Can be one of: `all`, `public`, `private`, `forks`, `sources`, `member`. Defaults to `public`.
