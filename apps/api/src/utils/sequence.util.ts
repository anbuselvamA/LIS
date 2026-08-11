import { PrismaService } from '../database/prisma.service';

/**
 * Generates a concurrency-safe, absolute sequential number using PostgreSQL's row-level locking.
 * 
 * @param prisma PrismaService instance
 * @param sequenceId The unique identifier for the sequence (e.g. 'MRN', 'ORD_2026')
 * @param startValue The starting value if the sequence doesn't exist yet (e.g. 1000 for MRNs)
 * @returns The incremented sequence value
 */
export async function getNextSequenceValue(prisma: PrismaService, sequenceId: string, startValue: number = 1): Promise<number> {
  const result = await prisma.sequenceCounter.upsert({
    where: { id: sequenceId },
    update: { value: { increment: 1 } },
    create: { id: sequenceId, value: startValue },
  });
  
  return result.value;
}
