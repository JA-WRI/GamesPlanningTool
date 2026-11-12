// AI contribution: 100% AI-generated
import { describe, expect, it, vi } from 'vitest';
import {
  hasUniqueRowIds,
  replaceCollection,
  runDraftSave,
} from '@/lib/db-helpers';

describe('hasUniqueRowIds', () => {
  it('accepts rows with distinct non-empty string IDs', () => {
    expect(hasUniqueRowIds([{ id: 'one' }, { id: 'two' }])).toBe(true);
  });

  it.each([
    null,
    {},
    [{ id: '' }],
    [{ id: 2 }],
    [{ id: 'same' }, { id: 'same' }],
  ])('rejects malformed or duplicate row IDs: %j', (value) => {
    expect(hasUniqueRowIds(value)).toBe(false);
  });
});

describe('runDraftSave', () => {
  it('authorizes and validates before mapping and persisting', async () => {
    const order: string[] = [];
    const outcome = await runDraftSave('draft', {
      authorize: () => {
        order.push('authorize');
        return true;
      },
      validate: () => {
        order.push('validate');
        return true;
      },
      map: (input) => {
        order.push('map');
        return input.toUpperCase();
      },
      persist: async (mapped) => {
        order.push('persist');
        return mapped;
      },
    });

    expect(outcome).toEqual({ ok: true, value: 'DRAFT' });
    expect(order).toEqual(['authorize', 'validate', 'map', 'persist']);
  });

  it('does not map or persist when authorization is denied', async () => {
    const map = vi.fn();
    const persist = vi.fn();
    const outcome = await runDraftSave('draft', {
      authorize: () => false,
      validate: () => true,
      map,
      persist,
    });

    expect(outcome).toEqual({ ok: false });
    expect(map).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });

  it('does not map or persist when validation fails', async () => {
    const map = vi.fn();
    const persist = vi.fn();
    const outcome = await runDraftSave('draft', {
      validate: () => false,
      map,
      persist,
    });

    expect(outcome).toEqual({ ok: false });
    expect(map).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });

  it('awaits asynchronous authorization before validating', async () => {
    const calls: string[] = [];
    const result = await runDraftSave('draft', {
      authorize: async () => {
        await Promise.resolve();
        calls.push('authorize');
        return true;
      },
      validate: () => {
        calls.push('validate');
        return true;
      },
      map: (input) => input,
      persist: async (mapped) => {
        calls.push('persist');
        return mapped;
      },
    });

    expect(result).toEqual({ ok: true, value: 'draft' });
    expect(calls).toEqual(['authorize', 'validate', 'persist']);
  });

  it('propagates persistence failures to the caller', async () => {
    const persist = vi
      .fn()
      .mockRejectedValue(new Error('database unavailable'));

    await expect(
      runDraftSave('draft', {
        validate: () => true,
        map: (input) => input,
        persist,
      }),
    ).rejects.toThrow('database unavailable');
  });
});

describe('replaceCollection', () => {
  it('replaces only rows in the requested scope within a transaction', async () => {
    const delegate = {
      findMany: vi.fn().mockResolvedValue([{ id: 'keep' }, { id: 'remove' }]),
      deleteMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    };
    const tx = { items: delegate };
    const transaction = vi.fn(
      async (operation: (client: typeof tx) => Promise<void>) => operation(tx),
    );

    await replaceCollection<
      typeof tx,
      { id: string; calculatorId: number; label: string },
      { calculatorId: number }
    >(transaction, (client) => client.items, { calculatorId: 7 }, [
      { id: 'keep', calculatorId: 7, label: 'Updated' },
      { id: 'new', calculatorId: 7, label: 'Added' },
    ]);

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(delegate.findMany).toHaveBeenCalledWith({
      where: { calculatorId: 7 },
      select: { id: true },
    });
    expect(delegate.deleteMany).toHaveBeenCalledWith({
      where: { calculatorId: 7, id: { notIn: ['keep', 'new'] } },
    });
    expect(delegate.update).toHaveBeenCalledWith({
      where: { id: 'keep' },
      data: { calculatorId: 7, label: 'Updated' },
    });
    expect(delegate.create).toHaveBeenCalledWith({
      data: { id: 'new', calculatorId: 7, label: 'Added' },
    });
  });

  it('rejects duplicate IDs before starting a transaction', async () => {
    const transaction = vi.fn();

    await expect(
      replaceCollection(transaction, () => ({}) as never, {}, [
        { id: 'duplicate' },
        { id: 'duplicate' },
      ]),
    ).rejects.toThrow('duplicate row IDs');
    expect(transaction).not.toHaveBeenCalled();
  });

  it('deletes every row in scope when the submitted collection is empty', async () => {
    const delegate = {
      findMany: vi.fn().mockResolvedValue([{ id: 'existing' }]),
      deleteMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    };
    const tx = { items: delegate };
    const transaction = vi.fn(
      async (operation: (client: typeof tx) => Promise<void>) => operation(tx),
    );

    await replaceCollection<
      typeof tx,
      { id: string; calculatorId: number },
      { calculatorId: number }
    >(transaction, (client) => client.items, { calculatorId: 7 }, []);

    expect(delegate.deleteMany).toHaveBeenCalledWith({
      where: { calculatorId: 7, id: { notIn: [] } },
    });
    expect(delegate.update).not.toHaveBeenCalled();
    expect(delegate.create).not.toHaveBeenCalled();
  });

  it('propagates delegate failures so the transaction can roll back', async () => {
    const delegate = {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(),
      create: vi.fn().mockRejectedValue(new Error('insert failed')),
    };
    const tx = { items: delegate };
    const transaction = vi.fn(
      async (operation: (client: typeof tx) => Promise<void>) => operation(tx),
    );

    await expect(
      replaceCollection<
        typeof tx,
        { id: string; calculatorId: number },
        { calculatorId: number }
      >(transaction, (client) => client.items, { calculatorId: 7 }, [
        { id: 'new', calculatorId: 7 },
      ]),
    ).rejects.toThrow('insert failed');
    expect(transaction).toHaveBeenCalledOnce();
  });
});
