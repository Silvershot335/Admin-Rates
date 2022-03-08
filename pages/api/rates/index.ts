import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import admin from '../../../lib/firebase';
import { HomePageRate, Song } from '../../../types/rate';
import { Session, SessionWithToken } from '../../../types/session';

export interface HomePageRate2 {
  date: string;
  deadline: string;
  id: string;
  playlist: {
    id: string;
    url: string;
  };
  title: string;
}

async function getRates(): Promise<HomePageRate[]> {
  const rates = admin.firestore().collection('rates');

  const documents = (await rates.get()).docs;

  return documents
    .filter((document) => {
      return document.data()?.title;
    })
    .map((document): HomePageRate => {
      const { title, date, playlist } = document.data();
      return {
        id: document.id,
        title,
        date: date.toDate().toISOString(),
        deadline:"" ,
        playlist,
      };
    });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = (await getSession({ req })) as SessionWithToken;
  const accessToken = session?.token?.accessToken;

  if (!accessToken || !session) {
    res.status(401).json({
      error: 'Missing Access Token',
    });
    return;
  }

  if (req.method === 'GET') {
    const rates = await getRates();
    res.status(200).json(rates);
    return;
  }

  res.status(405).json({ error: 'Use GET' });
}
