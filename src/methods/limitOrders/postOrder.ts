import { API_URL } from '../../constants';
import type { ConstructFetchInput } from '../../types';
import { constructBaseFetchUrlGetter, PostOrderURLs } from './helpers/misc';
import type {
  LimitOrderApiResponse,
  LimitOrderToSend,
  OpenLimitOrder,
  LimitOrderType,
} from './helpers/types';

type PostLimitOrder = (
  limitOrderWithSignatureAndPermit: LimitOrderToSend,
  signal?: AbortSignal
) => Promise<OpenLimitOrder>;

export type PostLimitOrderFunctions = {
  postLimitOrder: PostLimitOrder;
  postP2POrder: PostLimitOrder;
};

export const constructPostLimitOrder = ({
  apiURL = API_URL,
  chainId,
  // network, @TODO would it make more sense to post by network?
  fetcher,
}: ConstructFetchInput): PostLimitOrderFunctions => {
  const getBaseFetchURLByOrderType = constructBaseFetchUrlGetter({
    apiURL,
    chainId,
  });

  const postTypedOrder = async (
    limitOrderWithSignatureAndPermit: LimitOrderToSend,
    type: LimitOrderType,
    signal?: AbortSignal
  ): Promise<OpenLimitOrder> => {
    const fetchURL = getBaseFetchURLByOrderType(type);

    // @TODO check API return matches
    const { order: newOrder } = await fetcher<
      LimitOrderApiResponse,
      PostOrderURLs
    >({
      url: fetchURL,
      method: 'POST',
      data: limitOrderWithSignatureAndPermit,
      signal,
    });
    console.log('🚀 ~ file: postOrder.ts ~ created newOrder', newOrder);

    return { ...newOrder, status: 'open', amountFilled: '0' };
  };

  const postLimitOrder: PostLimitOrder = (
    limitOrderWithSignatureAndPermit,
    signal
  ) => {
    return postTypedOrder(limitOrderWithSignatureAndPermit, 'LIMIT', signal);
  };

  const postP2POrder: PostLimitOrder = (
    limitOrderWithSignatureAndPermit,
    signal
  ) => {
    return postTypedOrder(limitOrderWithSignatureAndPermit, 'P2P', signal);
  };

  return { postLimitOrder, postP2POrder };
};
