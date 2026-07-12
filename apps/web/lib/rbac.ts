// RBAC is defined once in packages/shared/rbac.json and derived in
// packages/shared/rbac.ts. Re-export so `@/lib/rbac` imports stay valid.
export * from '@transitops/shared';
