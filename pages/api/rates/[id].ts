import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import admin from '../../../lib/firebase';
import { baseAPI, fetchWithAccessToken } from '../../../lib/spotify';
import { Song } from '../../../types/rate';
import { SessionWithToken } from '../../../types/session';
import { CreatePlaylistResponse } from '../../../types/spotify';
import { shuffle } from '../../../util/shuffle';

async function getSpotifyID(session: SessionWithToken) {
  const url = `${baseAPI}/me`;
  const response = await fetchWithAccessToken(session.token.accessToken, url);
  return await response.json();
}

async function createSpotifyPlaylist(
  session: SessionWithToken,
  userID: string,
  name: string,
): Promise<[boolean, CreatePlaylistResponse]> {
  const url = `${baseAPI}/users/${userID}/playlists`;
  const response = await fetchWithAccessToken(session.token.accessToken, url, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description: `Playlist automatically created for the rate called ${name}.`,
    }),
  });

  return [response.ok, await response.json()];
}

async function addSongsToPlaylist(
  session: SessionWithToken,
  playlistID: string,
  songs: Song[],
): Promise<[boolean, any]> {
  const url = `${baseAPI}/playlists/${playlistID}/tracks`;
  const response = await fetchWithAccessToken(session.token.accessToken, url, {
    method: 'POST',
    body: JSON.stringify({
      uris: songs.map((song) => `spotify:track:${song.link}`),
    }),
  });
  return [response.ok, await response.json()];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log(req)
  const session = (await getSession({ req })) as SessionWithToken;
  const accessToken = session?.token?.accessToken;

  if (!accessToken || !session) {
    res.status(401).json({
      error: 'Missing Access Token',
    });
    return;
  }

  const id = req.query?.id as string;
  if (!id) {
    res.status(500).json({
      error: 'Invalid ID',
      id,
    });
    return;
  }

  const collection = admin.firestore().collection('rates');

  const document = await collection.doc(id).get();

  if (!document.exists) {
    res.status(404).json({
      error: 'Missing document',
      data: {
        document,
        id,
      },
    });
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      ...document.data(),
      id: document.id,
    });
    return;
  }

  if (req.method === 'POST') {
    const songs = (document.data()?.songs as Song[]) ?? [];
    const title = (document.data()?.title as string) ?? '';

    if (!songs.length) {
      res.status(400).json({
        error: 'no songs',
        ...document.data(),
      });
      return;
    }

    if (!title) {
      res.status(400).json({
        error: 'missing title',
        ...document.data(),
      });
      return;
    }

    const idResponse = (await getSpotifyID(session)) as { id: string };
    console.log(idResponse)
    if (!idResponse?.id) {
      return res.status(400).json({ success: false, result: idResponse });
    }

    const [createOk, createPlaylistResult] = await createSpotifyPlaylist(
      session,
      idResponse.id,
      title,
    );

    if (!createOk) {
      res.status(400).json({
        error: 'create fail',
        result: { title, json: createPlaylistResult },
      });
      return;
    }

    let shuffledSongs = songs;
    for (let i = 0; i < 100; ++i) {
      shuffledSongs = shuffle(shuffledSongs);
    }

    const [addSongsOk, addSongsResult] = await addSongsToPlaylist(
      session,
      createPlaylistResult.id,
      shuffledSongs,
    );

    if (!addSongsOk) {
      res.status(400).json({
        error: 'add songs fail',
        result: { title, id: createPlaylistResult.id, json: addSongsResult },
      });
      return;
    }

    const rates = admin.firestore().collection('rates');

    await rates.doc(id).update({
      playlist: {
        url: createPlaylistResult.external_urls.spotify,
        id: createPlaylistResult.id,
      },
      songs: shuffledSongs,
    });

    res.status(201).json({
      playlist: {
        url: createPlaylistResult.external_urls.spotify,
        id: createPlaylistResult.id,
      },
    });
  }

  res.status(405).json({ error: 'Use GET' });
}
