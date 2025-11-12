# How to work with Drizzle & Migration for Production environment?

When you create or change any table schema, generate a new file which will be used to migrate:

`pnpm db:generate`

This command also creates types for VS Code. At this point your DB is not changed, only the local files are.

Now to commit the changes to DB schema, you need to run:

`pnpm db:migrate`

This will enter a new entry in `__drizzle-migrations` table in the DB and make necessary schema changes.

# How to work with Drizzle in Development environment?

During development make changes to tables. and use command `pnpm db:push`. This command does not create the migration files and `__drizzle-migrations` table. So we can do rapid development during development time.

Once you are done with the feature then finally generate migration file using `pnpm db:generate`. This will create the necessary files and add to git. This will help us make the same changes available in prod DB.

# Mobile App related commands

### Add support for Android and iOS platforms: (Once)
```
pnpm nx run web:add:android
pnpm nx run web:add:ios
```

### Update native platform dependencies and copy the built frontend to the Capacitor project

Build the project then -

```
pnpm nx run web:sync:android
pnpm nx run web:sync:ios
```

### Open the native project in the respective IDE:

```
pnpm nx run web:open:android
pnpm nx run web:open:ios
```

### To add splash screens and icons:

```
pnpm install @capacitor/assets --save-dev
```
Provide icon and splash screen source images using this folder/filename structure:


```
assets/
├── icon-only.png
├── icon-foreground.png
├── icon-background.png
├── splash.png
└── splash-dark.png
```

Icon files should be at least 1024px x 1024px.
Splash screen files should be at least 2732px x 2732px.
The format can be jpg or png.
Then generate (which applies to your native projects or generates a PWA manifest file):

```
pnpm dlx @capacitor/assests generate
```

`Alternatively you can generate for a specific platform with --ios, --android or --pwa.`


# Convert all scss to css
To convert all SCSS files into CSS in an Angular project, you need to do two things:

---

## ✅ 1. **Change the global and component style references**

### a. **Update Angular CLI config (`angular.json`)**

Replace all occurrences of `scss` with `css`.

Example changes in `angular.json`:

```json
"schematics": {
  "@schematics/angular:component": {
    "style": "scss"  ⟶  "style": "css"
  }
},
"projects": {
  "your-project-name": {
    "architect": {
      "build": {
        "options": {
          "styles": [
            "src/styles.scss"  ⟶  "src/styles.css"
          ],
          ...
        }
      }
    }
  }
}
```

---

## ✅ 2. **Convert `.scss` files to `.css` files**

You’ll need to:

* Rename each `.scss` file to `.css`
* Remove or manually convert SCSS-specific syntax (e.g., nesting, variables, mixins)

### You can do this with a simple script:

#### a. **Bulk rename `.scss` files to `.css`**

In the project root:

```bash
find . -name "*.scss" -exec bash -c 'mv "$0" "${0%.scss}.css"' {} \;
```

#### b. **Update component decorators to use `.css`**

You can use a search & replace tool to find:

```ts
styleUrls: ['./something.component.scss']
```

and replace with:

```ts
styleUrls: ['./something.component.css']
```

If you're on VSCode:

* Open the folder.
* Use `Ctrl + Shift + F` to search `.scss`
* Enable "Replace" mode to do a bulk rename of paths.

---

## ⚠️ 3. **Convert SCSS syntax manually**

You’ll need to manually fix SCSS syntax inside the files:

| SCSS Feature         | CSS Equivalent                       |
| -------------------- | ------------------------------------ |
| Nesting              | Flatten it                           |
| Variables (`$color`) | Convert to CSS variables or hardcode |
| Mixins/Includes      | Replace with actual styles           |
| `@extend`, `@mixin`  | Remove or rewrite                    |

---



# Common Tasks

### Remove spec files

```
find ./apps -type f -name "*.spec.ts" -exec rm -f {} +
find ./libs -type f -name "*.spec.ts" -exec rm -f {} +
```

### Prepare git hooks

Run `npm run prepare` which will create `.husky/precommit` file. Open the file and write `npm run pre-commit`.

## Start the app

To start the development server run `nx serve tailwind-test`. Open your browser and navigate to http://localhost:4200/. Happy coding!

## Generate code

If you happen to use Nx plugins, you can leverage code generators that might come with it.

Run `nx list` to get a list of available plugins and whether they have generators. Then run `nx list <plugin-name>` to see what generators are available.

Learn more about [Nx generators on the docs](https://nx.dev/features/generate-code).

## Running tasks

To execute tasks with Nx use the following syntax:

```
nx <target> <project> <...options>
```

You can also run multiple targets:

```
nx run-many -t <target1> <target2>
```

..or add `-p` to filter specific projects

```
nx run-many -t <target1> <target2> -p <proj1> <proj2>
```

Targets can be defined in the `package.json` or `projects.json`. Learn more [in the docs](https://nx.dev/features/run-tasks).

## Want better Editor Integration?

Have a look at the [Nx Console extensions](https://nx.dev/nx-console). It provides autocomplete support, a UI for exploring and running tasks & generators, and more! Available for VSCode, IntelliJ and comes with a LSP for Vim users.

## Ready to deploy?

Just run `nx build demoapp` to build the application. The build artifacts will be stored in the `dist/` directory, ready to be deployed.

## Set up CI!

Nx comes with local caching already built-in (check your `nx.json`). On CI you might want to go a step further.

- [Set up remote caching](https://nx.dev/features/share-your-cache)
- [Set up task distribution across multiple machines](https://nx.dev/nx-cloud/features/distribute-task-execution)
- [Learn more how to setup CI](https://nx.dev/recipes/ci)

## Explore the Project Graph

Run `nx graph` to show the graph of the workspace.
It will show tasks that you can run with Nx.

- [Learn more about Exploring the Project Graph](https://nx.dev/core-features/explore-graph)

