/* eslint-disable node/no-unpublished-import */
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

const deployFunction: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    const TokenLockerOnHarmony = await deploy('TokenLockerOnHarmony', {
        from: deployer,
        args: [],
        proxy: false,
        log: true,
        autoMine: true // speed up deployment on local network (ganache, hardhat), no effect on live networks
    })

    const tokenLockerOnHarmony = await ethers.getContractAt('TokenLockerOnHarmony', TokenLockerOnHarmony.address)

    console.log('TokenLockerOnHarmony deployed to:', tokenLockerOnHarmony.address)
    let tx = await tokenLockerOnHarmony.initialize()
    await ethers.provider.waitForTransaction(tx.hash)

    // get the Ethereum light client
    const EthreumLightClient = await get('EthereumLightClient')
    console.log(`EthreumLightClient.address: ${EthreumLightClient.address}`)
    tx = await tokenLockerOnHarmony.changeLightClient(EthreumLightClient.address)
    await ethers.provider.waitForTransaction(tx.hash)

    console.log(`lightclient   : ${await tokenLockerOnHarmony.lightclient()}`)
    console.log(`owner         : ${await tokenLockerOnHarmony.owner()}`)
}

deployFunction.dependencies = ['EthereumLightClient']
deployFunction.tags = ['TokenLockerOnHarmony', 'Harmony', 'Production']
export default deployFunction
