import { defineEventHandler, readBody } from 'h3';
import { getUserProfile } from '../utils/users';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const x402Details = event.context.x402;

  // Retrieve latest profiles
  const clientProfile = x402Details ? getUserProfile(x402Details.clientAddress) : null;
  const freelancerProfile = x402Details ? getUserProfile(x402Details.freelancerAddress) : null;

  const linesOfCode = body.linesOfCode || 10;
  const actionType = body.actionType || 'push_commit';
  const description = body.description || 'Modify index.css to add custom visual theme';

  return {
    success: true,
    action: actionType,
    linesProcessed: linesOfCode,
    description: description,
    billing: {
      status: 'Paid',
      billedAmount: x402Details ? x402Details.amount : 0.0,
      clientAddress: x402Details ? x402Details.clientAddress : null,
      freelancerAddress: x402Details ? x402Details.freelancerAddress : null,
      clientRemainingGatewayBalance: clientProfile ? clientProfile.gatewayBalance : 0.0,
      freelancerAccumulatedEarnings: freelancerProfile ? freelancerProfile.accumulatedMicropayments : 0.0
    }
  };
});
