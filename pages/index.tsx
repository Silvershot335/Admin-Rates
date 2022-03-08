import useSWR from 'swr';
import Link from 'next/link';
import { HomePageRate } from '../types/rate';

export default function Index() {
  const { data } = useSWR<HomePageRate[]>('/api/rates', (url) =>
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json()),
  );

  const rates = data ?? [];

  return (
    <main>
      <div className="flex flex-wrap overflow-y-scroll">
        {rates.map((rate) => {
          const submitDate = new Date(rate.date);
          const rateDate = new Date(rate.deadline!);

          const canSubmit = submitDate.valueOf() > Date.now();
          const canRate = rateDate.valueOf() > Date.now();

          return (
            <Link key={rate.id} href={`/rate/${rate.id}`}>
              <a className="lg:w-1/4 w-full">
                <div
                  className={`${
                    canSubmit
                      ? 'bg-neutral-200 dark:bg-neutral-600'
                      : canRate
                      ? 'bg-neutral-800 text-white'
                      : ''
                  } flex flex-col h-48 p-3 m-3 overflow-y-auto rounded-lg border border-neutral-400 dark:border-neutral-500`}
                >
                  <div className="border-neutral-600 dark:border-neutral-400 flex items-center justify-between px-3 -mx-3 border-b">
                    <h3 className="text-xl">{rate.title}</h3>
                    {rate.playlist?.id ? <div>Playlist Created</div> : null}
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
