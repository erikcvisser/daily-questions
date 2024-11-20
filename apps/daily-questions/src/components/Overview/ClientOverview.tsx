'use client';

import { FilteredOverview } from './FilteredOverview';
import {
  Submission,
  Answer,
  Question,
  SharedOverviewStatus,
} from '@prisma/client';

type SubmissionWithAnswers = Submission & {
  answers: (Answer & {
    question: Question;
  })[];
};

type SharedOverviewWithOwner = {
  id: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
  status: SharedOverviewStatus;
};

interface ClientOverviewProps {
  submissions: SubmissionWithAnswers[];
  personalTarget: number;
  sharedOverviews: SharedOverviewWithOwner[];
  currentViewUserId?: string | null;
}

export function ClientOverview(props: ClientOverviewProps) {
  return <FilteredOverview {...props} />;
}
