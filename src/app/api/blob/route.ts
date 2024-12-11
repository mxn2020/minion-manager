// app/api/blob/route.ts
import { put, head, del, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

const APP_KEY = 'minionmanagementapp';

// Helper function to handle errors
const handleError = (error: any) => {
  console.error('Blob storage error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const table = searchParams.get('table');
    const dbKey = searchParams.get('dbKey');
    const id = searchParams.get('id');
    const prefix = searchParams.get('prefix');
    const limit = searchParams.get('limit');
    const cursor = searchParams.get('cursor');

    switch (operation) {
      case 'getAll': {
        console.log(`[route] Loading all items from ${dbKey}/${table}`);
        const prefix = `${APP_KEY}/${dbKey}/${table}/`;
        const { blobs, cursor: nextCursor } = await list({
          prefix,
          limit: limit ? parseInt(limit) : undefined,
          cursor: cursor || undefined,
          mode: 'expanded'
        });

        const items = await Promise.all(
          blobs.map(async (blob) => {
            const blobData = await head(blob.url);
            return blobData ? await fetch(blobData.url).then(r => r.text()) : null;
          })
        );

        // Filter out null values before parsing JSON
        const validItems = items.filter((item): item is string => item !== null);
        return NextResponse.json({
          items: validItems.map(item => JSON.parse(item)),
          cursor: nextCursor
        });
      }

      case 'getById': {
        const path = `${APP_KEY}/${dbKey}/${table}/${id}.json`;
        const blobData = await head(path);
        if (!blobData) return NextResponse.json(null);
        
        const data = await fetch(blobData.url).then(r => r.text());
        return NextResponse.json(JSON.parse(data));
      }

      case 'listByPrefix': {
        const blobPrefix = `${APP_KEY}/${dbKey}/${table}/${prefix}`;
        const { blobs } = await list({ 
          prefix: blobPrefix,
          mode: 'expanded'
        });

        const items = await Promise.all(
          blobs.map(async (blob) => {
            const blobData = await head(blob.url);
            return blobData ? await fetch(blobData.url).then(r => r.text()) : null;
          })
        );

        // Filter out null values before parsing JSON
        const validItems = items.filter((item): item is string => item !== null);
        return NextResponse.json(validItems.map(item => JSON.parse(item)));
      }

      case 'getDbKeys': {
        const path = `${APP_KEY}/db_keys.json`;
        const blobData = await head(path);
        if (!blobData) return NextResponse.json([]);
        
        const data = await fetch(blobData.url).then(r => r.text());
        return NextResponse.json(JSON.parse(data));
      }

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { operation, table, dbKey, item } = await request.json();

    switch (operation) {
      case 'create':
      case 'update': {
        const path = `${APP_KEY}/${dbKey}/${table}/${item.id}.json`;
        await put(path, JSON.stringify(item), {
          access: 'public',
          contentType: 'application/json',
          addRandomSuffix: false,
          cacheControlMaxAge: 60 * 60
        });
        return NextResponse.json({ success: true });
      }

      case 'saveDbKeys': {
        const path = `${APP_KEY}/db_keys.json`;
        await put(path, JSON.stringify(item), {
          access: 'public',
          contentType: 'application/json',
          addRandomSuffix: false,
          cacheControlMaxAge: 60 * 60
        });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const dbKey = searchParams.get('dbKey');
    const id = searchParams.get('id');

    if (!table || !dbKey || !id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const path = `${APP_KEY}/${dbKey}/${table}/${id}.json`;
    await del(path);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}