import { defineEventHandler, createError } from 'h3';
import type { ApiResponse, MuluSeat } from '../../../../shared/types';

let muluCache: { data: MuluSeat[]; ts: number } | null = null;
const MULU_TTL = 5 * 60 * 1000; // 5 minutes

export default defineEventHandler(async (): Promise<ApiResponse<MuluSeat[]>> => {
  if (muluCache && Date.now() - muluCache.ts < MULU_TTL) {
    console.log('✅ Cache hit for MULU seats');
    return { success: true, data: muluCache.data, timestamp: new Date().toISOString() };
  }

  try {
    console.log('🔄 Fetching MULU seat availability...');

    const response = await fetch(
      'https://mulu.visitate.net/service/web/infofeed/public/tourAvasShort?guided_tour_id=34'
    );

    if (!response.ok) {
      throw new Error(`MULU API returned status ${response.status}`);
    }

    const data = await response.json() as MuluSeat[];

    console.log(`✅ Fetched ${data.length} MULU seat records`);
    muluCache = { data, ts: Date.now() };

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Failed to fetch MULU seats:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch seat availability',
    });
  }
});
