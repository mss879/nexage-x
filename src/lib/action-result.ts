/**
 * The shape every admin server action returns, and one place that turns a
 * Postgres / PostgREST error into something a person can act on.
 *
 * Lives outside the "use server" files because those may only export async
 * functions.
 */
export type Failure = { success: false; error: string; missingTable?: boolean };
export type Result<T = object> = ({ success: true } & T) | Failure;

type DbError = { message?: string; code?: string } | null | undefined;

const code = (error: unknown) => (error as DbError)?.code ?? "";

/** The table / view hasn't been created — its migration hasn't been run. */
export const isMissingTable = (error: unknown) => ["42P01", "PGRST205"].includes(code(error));
/** A column the code expects isn't there — a later migration hasn't been run. */
export const isMissingColumn = (error: unknown) => ["42703", "PGRST204"].includes(code(error));
/** A database function (RPC) doesn't exist yet. */
export const isMissingFunction = (error: unknown) => ["42883", "PGRST202"].includes(code(error));

interface FailMessages {
  /** Shown when the feature's migration hasn't been run, e.g. "The clients table doesn't exist yet." */
  missing: string;
  /** Unique violation (23505) */
  duplicate?: string;
  /** Something else still points at this row (23503) */
  inUse?: string;
}

export function makeFail(messages: FailMessages) {
  return (error: unknown): Failure => {
    if (isMissingTable(error) || isMissingColumn(error) || isMissingFunction(error)) {
      return { success: false, error: messages.missing, missingTable: true };
    }
    if (code(error) === "23505" && messages.duplicate) return { success: false, error: messages.duplicate };
    if (code(error) === "23503" && messages.inUse) return { success: false, error: messages.inUse };
    return { success: false, error: (error as DbError)?.message ?? "Something went wrong." };
  };
}
