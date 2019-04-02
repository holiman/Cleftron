# cleftron

An electron-vue project to serve as a UI for Clef.

This is PRE-RELEASE software. Use at your own risk, or, preferably, just don't use this yet.

## Install

Install dependencies:

```bash
yarn
```

Note, you may hit this [issue](https://github.com/yarnpkg/yarn/issues/2821):

```
ERROR: There are no scenarios; must have at least one.
```

That means you're using the wrong `yarn`, and have to do `apt remove cmdtest`, then

```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install yarn
```

## Develop

Serve with hot reload at `localhost:9080`:

```bash
yarn run dev --clefbin path/to/clef
```

### Editor

We recommend adding [eslint](https://eslint.org/docs/user-guide/integrations) and [prettier](https://prettier.io/docs/en/editors.html) to your editor for an enjoyable coding experience.

#### [Atom](https://atom.io)

```bash
apm install language-vue linter linter-ui-default linter-eslint prettier-atom
```

In package settings for `prettier-atom`, enable `Format Files on Save`.

## Build

Build electron application for production:

```bash
yarn run build
```

## Run

Use --clefbin option to specify location of signer binary. If omitted you can choose it in a dialog box.
