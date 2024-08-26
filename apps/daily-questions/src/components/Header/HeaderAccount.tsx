import { auth, signOut } from '@/lib/auth';
import Link from 'next/link';

const HeaderAccount = async () => {
  const session = await auth();
  const user = session?.user;

  const logoutAction = async () => {
    'use server';
    await signOut();
  };

  return (
    <div>
      {!user && (
        <>
          <li>
            <Link href="/register" className="text-ct-dark-600">
              Register
            </Link>
          </li>
          <li>
            <Link href="/login" className="text-ct-dark-600">
              Login
            </Link>
          </li>
        </>
      )}
      {user && (
        <form action={logoutAction} className="flex">
          <li>
            <Link href="/questions" className="text-ct-dark-600">
              Questions
            </Link>
          </li>
          <li className="ml-4">
            <Link href="/profile" className="text-ct-dark-600">
              Profile
            </Link>
          </li>
          <li className="ml-4">
            <button>Logout</button>
          </li>
        </form>
      )}
    </div>
  );
};

export default HeaderAccount;
