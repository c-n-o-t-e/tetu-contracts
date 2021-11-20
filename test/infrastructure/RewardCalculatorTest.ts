import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {TimeUtils} from "../TimeUtils";
import {
  Bookkeeper,
  IStrategy,
  PriceCalculator,
  RewardCalculator,
  SmartVault
} from "../../typechain";
import {DeployerUtils} from "../../scripts/deploy/DeployerUtils";
import {CoreContractsWrapper} from "../CoreContractsWrapper";
import {utils} from "ethers";

const {expect} = chai;
chai.use(chaiAsPromised);

const exclude = new Set<string>([
  'NoopStrategy'
]);

describe("Reward calculator tests", function () {
  let snapshot: string;
  let snapshotForEach: string;
  let signer: SignerWithAddress;
  let core: CoreContractsWrapper;
  let priceCalculator: PriceCalculator;
  let rewardCalculator: RewardCalculator;

  before(async function () {
    snapshot = await TimeUtils.snapshot();
    signer = await DeployerUtils.impersonate();
    core = await DeployerUtils.getCoreAddressesWrapper(signer);

    priceCalculator = (await DeployerUtils.deployPriceCalculatorMatic(signer, core.controller.address))[0] as PriceCalculator;
    rewardCalculator = (await DeployerUtils.deployRewardCalculator(signer, core.controller.address, priceCalculator.address))[0] as RewardCalculator;
  });

  after(async function () {
    await TimeUtils.rollback(snapshot);
  });

  beforeEach(async function () {
    snapshotForEach = await TimeUtils.snapshot();
  });

  afterEach(async function () {
    await TimeUtils.rollback(snapshotForEach);
  });

  it.skip("strategy reward usd SUSHI_WMATIC_WETH", async () => {
    const strategy = '0x3bDbd2Ed1A214Ca4ba4421ddD7236ccA3EF088b6';
    const rewardUsd = +utils.formatUnits(await rewardCalculator.strategyRewardsUsd(strategy, 60 * 60 * 24 * 7));
    console.log('rewardUsd', rewardUsd)
    expect(rewardUsd).is.not.eq(0);
  });

  it.skip("strategy reward usd cafe", async () => {
    const strategy = '0xD45347527c567244CfDca6c296D4F0940F747D98';
    const rewardUsd = +utils.formatUnits(await rewardCalculator.strategyRewardsUsd(strategy, 60 * 60 * 24 * 7));
    console.log('rewardUsd', rewardUsd)
    expect(rewardUsd).is.not.eq(0);
  });

  it.skip("strategy reward QUICK_WMATIC_WETH dual ", async () => {
    const strategy = '0xC6F0Db38F9ce099eEc13A456673d0a771fb1Ff79';
    const rewardUsd = +utils.formatUnits(await rewardCalculator.strategyRewardsUsd(strategy, 60 * 60 * 24 * 7));
    console.log('rewardUsd', rewardUsd)
    expect(rewardUsd).is.not.eq(0);
  });

  it.skip("strategy reward quick usdc-weth", async () => {
    const strategy = '0x5af6a06Ce1444eF7A42B23FCEACdb783CCb265f4';
    const rewardUsd = +utils.formatUnits(await rewardCalculator.strategyRewardsUsd(strategy, 60 * 60 * 24 * 7));
    console.log('rewardUsd', rewardUsd)
    expect(rewardUsd).is.not.eq(0);
  });

  it("strategy reward iron lend usdc", async () => {
    const strategy = '0xc8940050A4ba18cf59f1a0b874a7d0b308F0dE16';
    const rewardUsd = +utils.formatUnits(await rewardCalculator.strategyRewardsUsd(strategy, 60 * 60 * 24));
    console.log('rewardUsd', rewardUsd)
    expect(rewardUsd).is.not.eq(0);
  });

  it.skip("strategy reward TETU_SUSHI_LINK_WETH", async () => {
    const strategy = '0xcfA38e6c2fbD8607509CDC02fC0050e11DDafD60';
    const rewardUsd = +utils.formatUnits(await rewardCalculator.strategyRewardsUsd(strategy, 60 * 60 * 24));
    console.log('rewardUsd', rewardUsd)
    expect(rewardUsd).is.not.eq(0);
  });

  it.skip("strategy KPI TETU_SUSHI_LINK_WETH", async () => {
    const vault = '0xd98320bb02f29d4f714c5f1741a42680dd19461d';
    const rewardUsd = +utils.formatUnits(await rewardCalculator.kpi(vault));
    console.log('rewardUsd', rewardUsd)
    expect(rewardUsd).is.not.eq(0);
  });

  it("USDC vault kpi", async () => {
    const vault = '0xeE3B4Ce32A6229ae15903CDa0A5Da92E739685f7';
    const kpi = +utils.formatUnits(await rewardCalculator.kpi(vault));
    console.log('kpi', kpi)
    expect(kpi).is.not.eq(0);
  });

  it.skip("strategy reward curve atricrypto3", async () => {
    const strategy = '0x93836dE9D1c750d01468027b644508a66C1e3C68';
    const rewardUsd = +utils.formatUnits(await rewardCalculator.strategyRewardsUsd(strategy, 60 * 60 * 24));
    console.log('rewardUsd', rewardUsd)
    expect(rewardUsd).is.not.eq(0);
  });

  it.skip("strategy reward usd for all", async () => {
    const bkAdr = (await DeployerUtils.getCoreAddresses()).bookkeeper;
    const bookkeeper = await DeployerUtils.connectInterface(signer, 'Bookkeeper', bkAdr) as Bookkeeper;
    const vaults = await bookkeeper.vaults();
    let sum = 0;
    for (const vault of vaults) {
      const vaultCtr = await DeployerUtils.connectInterface(signer, 'SmartVault', vault) as SmartVault;
      if (!(await vaultCtr.active())) {
        continue;
      }
      const strategy = await vaultCtr.strategy();
      const strCtr = await DeployerUtils.connectInterface(signer, 'IStrategy', strategy) as IStrategy;
      const name = await strCtr.STRATEGY_NAME();
      if (exclude.has(name)) {
        continue;
      }
      const rewardUsd = +utils.formatUnits(await rewardCalculator.strategyRewardsUsd(strategy, 60 * 60 * 24));
      sum += rewardUsd;
      // console.log('strategy', strategy, name, await vaultCtr.name(), '===>', rewardUsd, ' sum: ', sum);
      console.log(await strCtr.platform(), rewardUsd);
      // expect(rewardUsd).is.not.eq(0);
    }
  });


});
