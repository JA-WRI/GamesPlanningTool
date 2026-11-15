// AI contribution: Below 50% AI-generated

export type SaveOutcome<Result> = { ok: false } | { ok: true; value: Result };

export function hasUniqueRowIds(value: unknown): value is { id: string }[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (row) =>
        typeof row === 'object' &&
        row !== null &&
        'id' in row &&
        typeof row.id === 'string' &&
        row.id.length > 0,
    )
  ) {
    return false;
  }

  const ids = value.map((row) => row.id);
  return new Set(ids).size === ids.length;
}

export async function runDraftSave<Input, Mapped, Result>(
  input: Input,
  steps: {
    authorize?: (input: Input) => boolean | Promise<boolean>;
    validate: (input: Input) => boolean | Promise<boolean>;
    map: (input: Input) => Mapped;
    persist: (mapped: Mapped, input: Input) => Promise<Result>;
  },
): Promise<SaveOutcome<Result>> {
  if (steps.authorize && !(await steps.authorize(input))) return { ok: false };
  if (!(await steps.validate(input))) return { ok: false };

  return { ok: true, value: await steps.persist(steps.map(input), input) };
}

type CollectionDelegate<
  Row extends { id: string },
  Scope extends Record<string, unknown>,
> = {
  findMany: (args: {
    where: Scope;
    select: { id: true };
  }) => Promise<Pick<Row, 'id'>[]>;
  deleteMany: (args: {
    where: Scope & { id: { notIn: string[] } };
  }) => Promise<unknown>;
  update: (args: {
    where: { id: string };
    data: Omit<Row, 'id'>;
  }) => Promise<unknown>;
  create: (args: { data: Row }) => Promise<unknown>;
};

export async function replaceCollection<
  Tx,
  Row extends { id: string },
  Scope extends Record<string, unknown>,
>(
  transaction: (operation: (tx: Tx) => Promise<void>) => Promise<unknown>,
  getDelegate: (tx: Tx) => CollectionDelegate<Row, Scope>,
  scope: Scope,
  rows: Row[],
): Promise<void> {
  const ids = rows.map((row) => row.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('A saved collection cannot contain duplicate row IDs.');
  }

  await transaction(async (tx) => {
    const delegate = getDelegate(tx);
    const existing = await delegate.findMany({
      where: scope,
      select: { id: true },
    });
    const existingIds = new Set(existing.map((row) => row.id));

    await delegate.deleteMany({
      where: { ...scope, id: { notIn: ids } },
    });

    for (const row of rows) {
      const { id, ...data } = row;
      if (existingIds.has(id)) {
        await delegate.update({ where: { id }, data });
      } else {
        await delegate.create({ data: row });
      }
    }
  });
}
