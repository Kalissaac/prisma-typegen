@kalissaac/prisma-typegen
=========================

Generates full types (including relations) for TypeScript from a Prisma schema

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@kalissaac/prisma-typegen.svg)](https://npmjs.org/package/@kalissaac/prisma-typegen)
[![Downloads/week](https://img.shields.io/npm/dw/@kalissaac/prisma-typegen.svg)](https://npmjs.org/package/@kalissaac/prisma-typegen)
[![License](https://img.shields.io/npm/l/@kalissaac/prisma-typegen.svg)](https://github.com/Kalissaac/prisma-typegen/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npx @kalissaac/prisma-typegen <output folder> <prisma schema file>
$ npx @kalissaac/prisma-typegen ./interfaces ./schema.prisma
```
<!-- usagestop -->

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

### Generated `index.d.ts`
```typescript
export enum Role {
    USER,
    ADMIN,
}


export interface User {
    id: number,
    createdAt: Date,
    email: string,
    name: string,
    role: Role,
    posts: Post,
}

export interface Post {
    id: number,
    createdAt: Date,
    updatedAt: Date,
    published: boolean,
    title: string,
    author: User,
    authorId: number,
}
```
