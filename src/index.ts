import { Option, program } from "commander";
import { createPublicClient, http } from "viem";
import { CtsiStakingPoolBalance } from "./ctsi-staking-pool-balance";

program
  .name("ctsi-staking-pool-balance")
  .description(
    "CLI to compute the balance in CTSI that a user has in a given staking pool contract"
  )
  .addOption(
    new Option(
      "-d --date <string>",
      "date for which to compute the CTSI staking balance"
    ).env("DATE")
  )
  .addOption(
    new Option("-p --pool <address>", "address of the staking pool contract")
      .env("POOL")
      .makeOptionMandatory()
  )
  .addOption(
    new Option("-a --account <address>", "user account address")
      .env("ACCOUNT")
      .makeOptionMandatory()
  )
  .addOption(
    new Option("-r --rpc-url <url>", "URL of an Ethereum JSON-RPC gateway")
      .env("RPC_URL")
      .makeOptionMandatory()
  )
  .action(async (options) => {
    const publicClient = createPublicClient({
      transport: http(options.rpcUrl),
    });
    const stakingBalance = new CtsiStakingPoolBalance(
      options.pool,
      options.account,
      publicClient
    );
    let date;
    if (options.date) {
      date = new Date(options.date);
      if (Number.isNaN(date.valueOf())) {
        console.error(`Invalid date ${options.date}`);
        return;
      }
    }
    stakingBalance.run(date);
  });

program.parse();
