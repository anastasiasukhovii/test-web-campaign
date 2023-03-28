import { NextApiRequest, NextApiResponse } from 'next';
import {
  Chain,
  ChainID,
  NodeAPI,
  TokCtrtWithoutSplit,
} from '@virtualeconomy/js-vsys';
import { STARDUST_CTRT_ID, TEST_NET, WEMAKE_CTRT_ID } from './constants';

const getTokenBalance =
  (contractId: typeof STARDUST_CTRT_ID | typeof WEMAKE_CTRT_ID) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const {
      method,
      query: { address },
    } = req;

    switch (method) {
      case 'GET':
        try {
          const nodeApi = NodeAPI.new(TEST_NET);
          const chainId = new ChainID('TEST_NET', ChainID.elems.TEST_NET);
          const chain = new Chain(nodeApi, chainId);
          const contract = new TokCtrtWithoutSplit(contractId, chain);
          const { data, unit } = await contract.getTokBal(address);
          res.status(200).json({ balance: +data / unit });
        } catch (error) {
          res.status(400).json({ error });
        }
        break;
      default:
        res.status(400).json({ error: 'Invalid Operation' });
        break;
    }
  };

export default getTokenBalance;
