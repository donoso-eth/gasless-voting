// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { writeFileSync,readFileSync } from "fs";
import {copySync, ensureDir,existsSync } from 'fs-extra'
import { ethers,hardhatArguments } from "hardhat";
import config from "../hardhat.config";
import { join } from "path";
import { createHardhatAndFundPrivKeysFiles } from "../helpers/localAccounts";
import * as hre from 'hardhat';
import { initEnv, waitForTx } from "../helpers/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { GaslessProposing__factory, GaslessVoting__factory } from "../typechain-types";


interface ICONTRACT_DEPLOY {
  artifactsPath:string,
  name:string,
  ctor?:any,
  jsonName:string
}

const contract_path_relative = '../src/assets/contracts/';
const processDir = process.cwd()
const contract_path = join(processDir,contract_path_relative)
ensureDir(contract_path)

async function main() {

let proposingAddress;
let deployer: SignerWithAddress;
let user1: SignerWithAddress;
let network = hardhatArguments.network;
if (network == undefined) {
  network = config.defaultNetwork;
}

[deployer, user1] = await initEnv(hre);

  const contract_config = JSON.parse(readFileSync( join(processDir,'contract.config.json'),'utf-8')) as {[key:string]: ICONTRACT_DEPLOY}
  
  const deployContracts=["gaslessProposing","gaslessVoting"]
 
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  
  //// DEPLOY POOL IMPL
  let toDeployContract;
  let ops = "0xc1C6805B857Bef1f412519C4A842522431aFed39"

  let nonce = await deployer.getTransactionCount();
 
  const gasLessProposing = await new GaslessProposing__factory(deployer).deploy(ops,{ gasLimit: 10000000, nonce: nonce });

  const gasLessVoting = await new GaslessVoting__factory(deployer).deploy(gasLessProposing.address,{ gasLimit: 10000000, nonce: nonce +1 });

  await waitForTx(gasLessProposing.setVotingContract(gasLessVoting.address,{ gasLimit: 10000000, nonce: nonce +2 }));

  let initialPoolEth = hre.ethers.utils.parseEther('0.5');

  await deployer.sendTransaction({ to: gasLessProposing.address, value: initialPoolEth, gasLimit: 10000000, nonce: nonce + 3 });
  //await deployer.sendTransaction({ to: gasLessVoting.address, value: initialPoolEth, gasLimit: 10000000, nonce: nonce + 4 });

  toDeployContract = contract_config[deployContracts[0]];
  writeFileSync(
    `${contract_path}/${toDeployContract.jsonName}_metadata.json`,
    JSON.stringify({
      abi: GaslessProposing__factory.abi,
      name: toDeployContract.name,
      address: gasLessProposing.address,
      network: network,
    })
  );

  console.log(toDeployContract.name + ' Contract Deployed to:', gasLessProposing.address);

  ///// copy Interfaces and create Metadata address/abi to assets folder
  copySync(`./typechain-types/${toDeployContract.name}.ts`, join(contract_path, 'interfaces', `${toDeployContract.name}.ts`));


  toDeployContract = contract_config[deployContracts[1]];
  writeFileSync(
    `${contract_path}/${toDeployContract.jsonName}_metadata.json`,
    JSON.stringify({
      abi: GaslessVoting__factory.abi,
      name: toDeployContract.name,
      address: gasLessVoting.address,
      network: network,
    })
  );

  console.log(toDeployContract.name + ' Contract Deployed to:', gasLessVoting.address);

  ///// copy Interfaces and create Metadata address/abi to assets folder
  copySync(`./typechain-types/${toDeployContract.name}.ts`, join(contract_path, 'interfaces', `${toDeployContract.name}.ts`));





  ///// create the local accounts file
  if (
    !existsSync(`${contract_path}/local_accouts.json`) &&
    (network == 'localhost' || network == 'hardhat')
  ) {
    const accounts_keys = await createHardhatAndFundPrivKeysFiles(
      hre,
      contract_path
    );
    writeFileSync(
      `${contract_path}/local_accouts.json`,
      JSON.stringify(accounts_keys)
    );
  }

 
  ///// copy addressess files
  if (!existsSync(`${contract_path}/interfaces/common.ts`)) {
    copySync(
      './typechain-types/common.ts',
      join(contract_path, 'interfaces', 'common.ts')
    );
  }


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
