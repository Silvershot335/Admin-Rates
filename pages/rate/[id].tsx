import { useRouter } from 'next/router';
import { FC } from 'react';
import useSWR from 'swr';
import Button, { ButtonType } from '../../components/Button';
import { Rate } from '../../types/rate';

const SpecificRate: FC = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const { data } = useSWR<Rate>(`/api/rates/${id}`, (url) =>
    fetch(url).then((res) => res.json()),
  );

  return (
    <div className="flex flex-col items-center flex-grow h-full">
      <div className="flex flex-col items-center w-full border-b">
        <h1 className="text-2xl">{data?.title}</h1>
        <Button
          buttonType={ButtonType.Primary}
          label="Create Playlist"
          onClick={() => {
            if (id) {
              fetch(`/api/rates/${id}`, {
                method: 'POST',
              });
              router.replace('/');
            }
          }}
        />
      </div>
      <div className="mt-4">
        {data?.songs?.map((song) => (
          <div key={`${song.link} by ${song.submittedBy}`}>
            {song.link} by {song.submittedBy}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecificRate;
