import prisma from '../../../lib/prisma';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: String(params?.id),
      },
    });
    return {
      props: {
        user: user || null,
      },
    };
  };
