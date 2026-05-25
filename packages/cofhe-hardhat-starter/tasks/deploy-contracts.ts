import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { saveDeployment } from './utils'

// Task to deploy the ConfidentialPayment contract
task('deploy-confidential payment', 'Deploy the ConfidentialPayment contract to the selected network').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
	const { ethers, network } = hre

	console.log(`Deploying ConfidentialPayment to ${network.name}...`)

	// Get the deployer account
	const [deployer] = await ethers.getSigners()
	console.log(`Deploying with account: ${deployer.address}`)

	// Deploy the contract
	const ConfidentialPayment = await ethers.getContractFactory('ConfidentialPayment')
	const confidentialPayment = await ConfidentialPayment.deploy()
	await confidentialPayment.waitForDeployment()

	const ConfidentialPaymentAddress = await confidentialPayment.getAddress()
	console.log(`ConfidentialPayment deployed to: ${ConfidentialPaymentAddress}`)

	// Save the deployment
	saveDeployment(network.name, 'ConfidentialPayment', ConfidentialPaymentAddress)

	return ConfidentialPaymentAddress
})

task('deploy-SealedBidAuction ', 'Deploy the SealedBidAuction contract to the selected network').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
	const { ethers, network } = hre

	console.log(`Deploying SealedBidAuction to ${network.name}...`)

	// Get the deployer account
	const [deployer] = await ethers.getSigners()
	console.log(`Deploying with account: ${deployer.address}`)

	// Deploy the contract
	const SealedBidAuction = await ethers.getContractFactory('SealedBidAuction')
	const sealedBidAuction = await SealedBidAuction.deploy()
	await sealedBidAuction.waitForDeployment()

	const SealedBidAuctionAddress = await sealedBidAuction.getAddress()
	console.log(`SealedBidAuction deployed to: ${SealedBidAuctionAddress}`)

	// Save the deployment
	saveDeployment(network.name, 'SealedBidAuction', SealedBidAuctionAddress)

	return SealedBidAuctionAddress
})

task('deploy-blind-review', 'Deploy the BlindReview contract to the selected network').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
	const { ethers, network } = hre

	console.log(`Deploying BlindReview to ${network.name}...`)

	// Get the deployer account
	const [deployer] = await ethers.getSigners()
	console.log(`Deploying with account: ${deployer.address}`)

	// Deploy the contract
	const BlindReview = await ethers.getContractFactory('BlindReview')
	const blindReview = await BlindReview.deploy()
	await blindReview.waitForDeployment()

	const BlindReviewAddress = await blindReview.getAddress()
	console.log(`BlindReview deployed to: ${BlindReviewAddress}`)

	// Save the deployment
	saveDeployment(network.name, 'BlindReview', BlindReviewAddress)

	return BlindReviewAddress
})

task('deploy-identity-gate', 'Deploy the IdentityGate contract to the selected network').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
	const { ethers, network } = hre
	const MIN_AGE = 18n;

	console.log(`Deploying IdentityGate to ${network.name}...`)

	// Get the deployer account
	const [deployer] = await ethers.getSigners()
	console.log(`Deploying with account: ${deployer.address}`)

	// Deploy the contract
	const IdentityGate = await ethers.getContractFactory('IdentityGate')
	const identityGate = await IdentityGate.deploy(MIN_AGE)
	await identityGate.waitForDeployment()

	const IdentityGateAddress = await identityGate.getAddress()
	console.log(`IdentityGate deployed to: ${IdentityGateAddress}`)

	// Save the deployment
	saveDeployment(network.name, 'IdentityGate', IdentityGateAddress)

	return IdentityGateAddress
})

task('deploy-sealed-vote', 'Deploy the SealedVote contract to the selected network').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
	const { ethers, network } = hre

	console.log(`Deploying SealedVote to ${network.name}...`)

	const [deployer] = await ethers.getSigners()
	console.log(`Deploying with account: ${deployer.address}`)

	const SealedVote = await ethers.getContractFactory('SealedVote')
	const sealedVote = await SealedVote.deploy()
	await sealedVote.waitForDeployment()

	const address = await sealedVote.getAddress()
	console.log(`SealedVote deployed to: ${address}`)
	console.log(`\n=== Add to packages/frontend/.env.local ===`)
	console.log(`NEXT_PUBLIC_VOTE_CONTRACT=${address}`)
	saveDeployment(network.name, 'SealedVote', address)

	return address
})

task('deploy-confidential-payroll', 'Deploy the ConfidentialPayroll contract to the selected network').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
	const { ethers, network } = hre

	console.log(`Deploying ConfidentialPayroll to ${network.name}...`)

	const [deployer] = await ethers.getSigners()
	console.log(`Deploying with account: ${deployer.address}`)

	const ConfidentialPayroll = await ethers.getContractFactory('ConfidentialPayroll')
	const confidentialPayroll = await ConfidentialPayroll.deploy()
	await confidentialPayroll.waitForDeployment()

	const address = await confidentialPayroll.getAddress()
	console.log(`ConfidentialPayroll deployed to: ${address}`)
	console.log(`\n=== Add to packages/frontend/.env.local ===`)
	console.log(`NEXT_PUBLIC_PAYROLL_CONTRACT=${address}`)
	saveDeployment(network.name, 'ConfidentialPayroll', address)

	return address
})
