import { Block, Hex, PublicClient, formatUnits, parseAbi } from "viem";

export class CtsiStakingPoolBalance {
  constructor(
    private pool: Hex,
    private account: Hex,
    private publicClient: PublicClient
  ) {}

  async run(date?: Date): Promise<bigint> {
    let block;
    if (date) {
      block = await this.findBlock(date);
    } else {
      block = await this.publicClient.getBlock();
    }

    return await this.computeBalance(block);
  }

  async findBlock(targetDate: Date): Promise<Block> {
    const targetTimestamp = BigInt(targetDate.valueOf());
    console.log(
      `Looking for block at target date ${targetDate.toISOString()}...`
    );
    const blockCurrent = await this.publicClient.getBlock();
    return await this.searchBlock(targetTimestamp, blockCurrent);
  }

  async searchBlock(
    targetTimestamp: bigint,
    block: Block,
    blockPrevious?: Block
  ): Promise<Block> {
    // console.log(
    //   `${block.number} ${block.timestamp} (${new Date(
    //     Number(block.timestamp * 1000n)
    //   ).toISOString()})`
    // );

    // estimate block for desired date
    // - compute diff in ms between current block's timestamp and desired date
    // - use avg block interval of 12s to estimate block number for desired date
    const dateDiff = targetTimestamp - block.timestamp * 1000n;
    let blockEstimateNumber = block.number! + dateDiff / 12000n;

    if (blockEstimateNumber === block.number!) {
      // date diff is so small we are no longer moving
      if (dateDiff >= 0) {
        // if before the target date, return this block
        return block;
      } else {
        // if after the target date, look for previous block
        blockEstimateNumber -= 1n;
      }
    }

    // keep searching using estimated block
    const blockEstimate = await this.publicClient.getBlock({
      blockNumber: blockEstimateNumber,
    });
    if (blockPrevious && blockEstimate.number === blockPrevious.number) {
      // we are running in circles: return the older block
      return block.timestamp < blockPrevious.timestamp ? block : blockPrevious;
    }
    return await this.searchBlock(targetTimestamp, blockEstimate, block);
  }

  async computeBalance(block): Promise<bigint> {
    const blockDate = new Date(Number(block.timestamp) * 1000);
    console.log(
      `Using block ${block.number} at date ${blockDate.toISOString()}`
    );

    const blockNumber = block.number;
    const userBalance = await this.publicClient.readContract({
      address: this.pool,
      abi: parseAbi([
        "function userBalance(address) view returns (uint256,uint256,uint256)",
      ]),
      functionName: "userBalance",
      args: [this.account],
      blockNumber,
    });

    const shares = userBalance[1];
    console.log(`Shares: ${shares}`);

    const amount = await this.publicClient.readContract({
      address: this.pool,
      abi: parseAbi(["function sharesToAmount(uint) view returns (uint256)"]),
      functionName: "sharesToAmount",
      args: [shares],
      blockNumber,
    });
    console.log(`CTSI: ${formatUnits(amount, 18)}`);
    return amount;
  }
}
