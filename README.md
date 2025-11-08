# demo-content

## Development container

This repository relies on the Microsoft "universal" devcontainer image specified in
`.devcontainer/devcontainer.json`:

```
{"image":"mcr.microsoft.com/devcontainers/universal:2"}
```

That means the development environment is provided by the container image. The
image supplies common tools and runtimes, so there are no repository-level
configuration files (like `package.json` or `pyproject.toml`) included here.

When you need repository-specific setup (installing packages, adding VS Code
extensions, running a `postCreateCommand`, or pinning tool versions), consider
adding additional fields to `.devcontainer/devcontainer.json` or including a
Dockerfile / devcontainer features in this repo.

For now, the single-line `devcontainer.json` is intentional and keeps the repo
minimal. Update it later if you want project-specific automation or reproducible
builds.
