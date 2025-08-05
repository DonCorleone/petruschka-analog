import { defineEventHandler } from 'h3';
import fs from 'fs';
import path from 'path';
import type { Press } from '../../../../shared/types';

export default defineEventHandler(async (event) => {
  try {
    // Read the static data from the JSON file
    const dataPath = path.join(process.cwd(), 'src/assets/input-data/staticDb.press.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const pressData = JSON.parse(rawData) as Array<{
      _id: { $oid: string };
      nr: string;
      desc: string;
      source: string;
      date: { $date: string };
      author: string;
      fileExtension: string;
      link?: string;
      quote?: string;
    }>;

    // Transform the data to match our Press interface
    const transformedData: Press[] = pressData.map(item => ({
      id: item._id.$oid,
      nr: item.nr,
      desc: item.desc,
      source: item.source,
      date: item.date.$date,
      author: item.author,
      fileExtension: item.fileExtension,
      link: item.link,
      quote: item.quote
    }));

    // Sort by date (newest first)
    transformedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      success: true,
      data: transformedData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error loading press data:', error);
    return {
      success: false,
      data: [],
      timestamp: new Date().toISOString()
    };
  }
});
