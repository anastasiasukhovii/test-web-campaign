import { useRouter } from 'next/router';
import {
  Dispatch,
  SetStateAction,
  SVGAttributes,
  useEffect,
  useState,
} from 'react';
import api from './api';
import { PCType } from './types';

export enum ButtonState {
  INACTIVE,
  LOADING,
  ACTIVE,
}

export const iconProps: SVGAttributes<SVGElement>[] = [
  { fill: 'transparent', stroke: '#000000' },
  { fill: 'transparent', stroke: 'gray' },
  { fill: '#6a00ff', stroke: '#6a00ff' },
];

export const usePCActionState = (
  actionType: 'bookmark' | 'like',
  isActive?: boolean,
  PCType?: PCType
): [
  ButtonState,
  Dispatch<SetStateAction<ButtonState>>,
  (id: string, typeId: string, PCType?: PCType) => void
] => {
  const [state, setState] = useState(ButtonState.LOADING);
  useEffect(
    () => setState(isActive ? ButtonState.ACTIVE : ButtonState.INACTIVE),
    [isActive]
  );
  const router = useRouter();

  if (actionType === 'bookmark') {
    return [
      state,
      setState,
      (email, typeId, PCType) => {
        if (state === ButtonState.LOADING) return;
        if (state === ButtonState.INACTIVE) {
          api.user.post('/bookmark/add', {
            email,
            proposalBookmarks: PCType === 'Proposal' ? [typeId] : [],
            campaignBookmarks: PCType === 'Campaign' ? [typeId] : [],
          });
          setState(ButtonState.LOADING);
          setTimeout(() => setState(ButtonState.ACTIVE), 1000);
        } else {
          api.user.post('/bookmark/delete', {
            email,
            proposalBookmarks: PCType === 'Proposal' ? [typeId] : [],
            campaignBookmarks: PCType === 'Campaign' ? [typeId] : [],
          });
          setState(ButtonState.LOADING);
          setTimeout(() => setState(ButtonState.INACTIVE), 1000);
        }
      },
    ];
  } else {
    return [
      state,
      setState,
      (username, typeId) => {
        if (state === ButtonState.LOADING) return;
        const pcType =
          router.pathname.split('/')[1] === 'campaigns'
            ? 'Campaign'
            : 'Proposal';

        api.proposal.post(`/like?type=${PCType ?? pcType}`, {
          username,
          typeId,
          isAdd: state === ButtonState.INACTIVE,
        });
        setTimeout(
          state !== ButtonState.ACTIVE
            ? () => setState(ButtonState.ACTIVE)
            : () => setState(ButtonState.INACTIVE),
          1000
        );
        setState(ButtonState.LOADING);
      },
    ];
  }
};
