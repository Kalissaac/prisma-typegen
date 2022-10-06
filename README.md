# @kalissaac/prisma-typegen

Generates full types (including relations) for TypeScript from a Prisma schema

# Usage

```sh-session
$ npx @kalissaac/prisma-typegen <output path> [prisma schema file] [--onlyDeclarations] [--generateInsertionTypes]
$ npx @kalissaac/prisma-typegen ./interfaces ./schema.prisma
$ npx @kalissaac/prisma-typegen ./interfaces/prismaTypes.ts ./schema.prisma
```

### Only output declarations

If using JavaScript instead of TypeScript, pass `--onlyDeclarations` to allow the types to be used with JSDoc.

### Generate types for data to be inserted

If using this package to generate types that will be assigned to data to be inserted into a database, use the `--generateInsertionTypes` flag. Using this option will result in a few differences:

- Prisma `DateTime` fields are mapped to `Date | string` insead of just `Date`. This is because most database clients support inserting date fields using either the native `Date` type or an ISO 8601 compliant `string`.
- Fields marked with a `@default` value are made optional because they are populated automatically if not provided when inserting a new data row.
- Relation fields (marked with `@relation`) are omitted because they do not exist at the database level and therefore can't be inserted. Read more about this [here](https://www.prisma.io/docs/concepts/components/prisma-schema/relations#relation-fields)

### Use `type` instead of `interface`

By default, types are generated as an `interface`. If your use case requires using `type` instead, use the `--useType` flag.

<!-- prettier-ignore-start -->
# Example

### Input Schema

```prisma
datasource db {
  url      = env("DATABASE_URL")
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean  @default(false)
  title     String   @db.VarChar(255)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}

enum Role {
  USER
  ADMIN
}
```

### Generated `index.ts` (or `index.d.ts`)

```typescript
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number
  createdAt: Date
  email: string
  name?: string
  role: Role
  posts: Post[]
}

export interface Post {
  id: number,
  createdAt: Date,
  updatedAt: Date,
  published: boolean,
  title: string,
  author?: User,
  authorId?: number,
}
```

### Generated `index.ts` (or `index.d.ts`) in insertion mode (with `--generateInsertionTypes`)

```typescript
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id?: number,
  createdAt?: (Date | string),
  email: string,
  name?: string | null,
  role?: Role,
}

export interface Post {
  id?: number,
  createdAt?: (Date | string),
  updatedAt: (Date | string),
  published?: boolean,
  title: string,
  authorId?: number | null,
}
```

### Generated `index.ts` (or `index.d.ts`) with `--useType` option

```typescript
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type User = {
  id: number,
  createdAt: Date,
  email: string,
  name?: string,
  role: Role,
  posts: Post[],
}

export type Post = {
  id: number,
  createdAt: Date,
  updatedAt: Date,
  published: boolean,
  title: string,
  author?: User,
  authorId?: number,
}
```
<!-- prettier-ignore-end -->
