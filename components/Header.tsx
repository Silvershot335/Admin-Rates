import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { useSession } from '../hooks/session';
import { Session } from '../types/session';
import Button, { ButtonType } from './Button';

const SessionHeader: FC<{ session: Session; signOut: () => void }> = ({
  session,
  signOut,
  children,
}) => {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-full">
      <div className="px-3 border-b">
        <div className="flex justify-between">
          <Link href={'/'}>
            <a>
              <Button buttonType={ButtonType.Primary} label="Admin for Rates" />
            </a>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Signed in as {session.user?.name}</h2>
          <Button
            buttonType={ButtonType.Primary}
            label="Sign Out"
            onClick={() => {
              signOut();
              router.replace('/');
            }}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

const LogInPage: FC<{ signIn: () => void }> = ({ signIn }) => {
  return (
    <main className="dark:text-white dark:bg-black flex flex-col items-center justify-center w-full h-full text-black bg-white">
      <h2 className="my-3 text-xl">Not signed in</h2>
      <div>
        <Button
          buttonType={ButtonType.Primary}
          onClick={signIn}
          label="Sign in"
        />
      </div>
    </main>
  );
};
const Header: FC = ({ children }) => {
  const [session, _, signIn, signOut] = useSession();
  if (session) {
    return (
      <SessionHeader session={session} signOut={signOut}>
        {children}
      </SessionHeader>
    );
  }
  return <LogInPage signIn={signIn} />;
};
export default Header;
