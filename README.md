# umair-auth

Multi-tenant authentication API with OTP, password reset, JWT & PostgreSQL support. Built with Prisma.

## Features

- Dynamic tenant DB connection
- OTP-based signup/login
- Password reset
- JWT authentication
- Prisma & PostgreSQL

## Usage

```js
import { registerUser, loginUser } from 'umair-auth';

await registerUser({ name, email, password }, projectId);
