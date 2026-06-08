import fs from 'fs';
import path from 'path';
import { readBody, getMethod, defineEventHandler } from 'h3';
import { createPublicClient, http, encodePacked, keccak256, hashMessage, recoverAddress } from 'viem';
import { arcTestnet } from '../utils/circle';

const AGENTS_DB_PATH = path.resolve('./db/agents.json');
const CONTRACT_ADDRESS_PATH = path.resolve('./db/contract-address.json');

function getAgentRegistryAddress() {
  if (fs.existsSync(CONTRACT_ADDRESS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONTRACT_ADDRESS_PATH, 'utf8'));
      return data.AgentRegistry;
    } catch (e) {
      console.error('Error reading contract address:', e);
    }
  }
  return null;
}

function readAgents() {
  if (!fs.existsSync(AGENTS_DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(AGENTS_DB_PATH, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    console.error('Error reading agents db:', e);
    return [];
  }
}

function writeAgents(agents) {
  try {
    fs.writeFileSync(AGENTS_DB_PATH, JSON.stringify(agents, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing agents db:', e);
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  if (method === 'GET') {
    const agents = readAgents();
    const registryAddress = getAgentRegistryAddress();
    
    // Fetch ABI
    const artifactPath = path.resolve('./artifacts_contract/contracts/AgentRegistry.sol/AgentRegistry.json');
    let abi = [];
    if (fs.existsSync(artifactPath)) {
      try {
        const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        abi = contractJson.abi;
      } catch (e) {
        console.error('Error reading AgentRegistry ABI:', e);
      }
    }

    if (abi.length > 0 && registryAddress) {
      try {
        const publicClient = createPublicClient({
          chain: arcTestnet,
          transport: http(),
        });

        const enrichedAgents = [];
        for (const agent of agents) {
          try {
            // Verify if agent is registered on-chain
            const isRegistered = await publicClient.readContract({
              address: registryAddress,
              abi,
              functionName: 'isRegisteredAgent',
              args: [agent.agentAddress],
            });
            
            agent.verified = isRegistered;

            if (isRegistered) {
              const onChainOwner = await publicClient.readContract({
                address: registryAddress,
                abi,
                functionName: 'getAgentOwner',
                args: [agent.agentAddress],
              });
              agent.ownerAddress = onChainOwner;
            }
          } catch (onChainError) {
            console.error(`Error enriching agent ${agent.agentAddress}:`, onChainError);
            agent.verified = false;
          }
          enrichedAgents.push(agent);
        }
        return enrichedAgents;
      } catch (err) {
        console.error('Error enriching agents from contract:', err);
      }
    }

    return agents;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    if (!body || !body.agentAddress || !body.ownerAddress || !body.agentURI || !body.signature) {
      return { error: 'Missing required agent registration details (agentAddress, ownerAddress, agentURI, signature).' };
    }

    const { agentAddress, ownerAddress, agentURI, signature, name, description, model, repoUrl } = body;

    // Cryptographic Signature Verification
    try {
      // Recreate the packed hash used in Solidity
      const messageHash = keccak256(
        encodePacked(
          ['address', 'string', 'address'],
          [ownerAddress, agentURI, agentAddress]
        )
      );

      // Prepend the Ethereum Signed Message prefix and hash it
      const ethSignedHash = hashMessage({ raw: messageHash });

      // Recover address from signature
      const recoveredSigner = await recoverAddress({
        hash: ethSignedHash,
        signature: signature
      });

      if (recoveredSigner.toLowerCase() !== agentAddress.toLowerCase()) {
        return { 
          error: `Signature verification failed. Expected signer: ${agentAddress}, Recovered: ${recoveredSigner}` 
        };
      }
    } catch (verifyError) {
      console.error('Signature verification exception:', verifyError);
      return { error: `Cryptographic signature verification failed: ${verifyError.message}` };
    }

    // Load agents list, append or update the registration
    const agents = readAgents();
    const agentData = {
      name: name || 'Unnamed AI Bot',
      description: description || 'Autonomous coding assistant',
      model: model || 'Default Model',
      repoUrl: repoUrl || '',
      agentAddress: agentAddress,
      ownerAddress: ownerAddress,
      agentURI: agentURI,
      verified: false, // will be validated on-chain via GET
      registeredAt: new Date().toISOString()
    };

    const index = agents.findIndex(a => a.agentAddress.toLowerCase() === agentAddress.toLowerCase());
    if (index !== -1) {
      agents[index] = { ...agents[index], ...agentData };
    } else {
      agents.push(agentData);
    }

    writeAgents(agents);
    return { success: true, agents };
  }
});
