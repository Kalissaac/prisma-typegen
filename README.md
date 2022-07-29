# @kalissaac/prisma-typegen

Generates full types (including relations) for TypeScript from a Prisma schema

# Usage

```sh-session
$ npx @kalissaac/prisma-typegen <output folder> [prisma schema file] [--onlyDeclarations]
$ npx @kalissaac/prisma-typegen ./interfaces ./schema.prisma
```

### Only output declarations

If using JavaScript instead of TypeScript, pass `--onlyDeclarations` to allow the types to be used with JSDoc.

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
  USER,
  ADMIN
}

export interface User {
  id: number
  createdAt: Date
  email: string
  name: string
  role: Role
  posts: Post
}

export interface Post {
  id: number
  createdAt: Date
  updatedAt: Date
  published: boolean
  title: string
  author: User
  authorId: number
}
```
