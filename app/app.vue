<template>
  <div>
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-brand" @click="activeSection = 'home'" style="cursor: pointer;">
        <div class="logo-icon">
          <svg viewBox="0 0 100 100" width="30" height="30" style="fill: none; stroke: #1A1A1A; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round;">
            <path d="M25 40 C 25 15, 75 15, 75 40 C 75 45, 80 50, 80 60 C 80 75, 20 75, 20 60 C 20 50, 25 45, 25 40 Z" fill="#72A3A8" />
            <path d="M22 25 C 15 25, 15 15, 25 18" fill="#FAF9F6" />
            <path d="M78 25 C 85 25, 85 15, 75 18" fill="#FAF9F6" />
            <ellipse cx="40" cy="38" rx="6" ry="9" fill="#FAF9F6" stroke="#1A1A1A" stroke-width="7" />
            <ellipse cx="60" cy="38" rx="6" ry="9" fill="#FAF9F6" stroke="#1A1A1A" stroke-width="7" />
            <circle cx="40" cy="40" r="3" fill="#1A1A1A" />
            <circle cx="60" cy="40" r="3" fill="#1A1A1A" />
            <ellipse cx="50" cy="56" rx="16" ry="10" fill="#FAF9F6" stroke="#1A1A1A" stroke-width="6" />
            <circle cx="44" cy="56" r="2.5" fill="#1A1A1A" />
            <circle cx="56" cy="56" r="2.5" fill="#1A1A1A" />
          </svg>
        </div>
        <span>GigMarket</span>
      </div>
      <div class="nav-links">
        <span class="nav-link" :class="{ active: activeSection === 'home' }" @click="activeSection = 'home'">Home</span>
        <span class="nav-link" :class="{ active: activeSection === 'app' }" @click="activeSection = 'app'">Launch Portal</span>
        <span class="nav-link" :class="{ active: activeSection === 'docs' }" @click="activeSection = 'docs'">Docs</span>
        <span class="nav-link" :class="{ active: activeSection === 'faq' }" @click="activeSection = 'faq'">FAQ</span>
        <span class="nav-link" :class="{ active: activeSection === 'about' }" @click="activeSection = 'about'">About</span>
        <span class="nav-link" :class="{ active: activeSection === 'contact' }" @click="activeSection = 'contact'">Contact</span>
      </div>
      <div class="nav-actions">
        <button v-if="!userAddress" class="btn btn-accent btn-small" @click="openWalletModal">
          Connect Wallet
        </button>
        <div v-else class="rainbow-connected-pill" @click="openConnectedModal">
          <span class="rainbow-connected-balance">{{ userUsdcBalance }} USDC | {{ userEurcBalance }} EURC</span>
          <div class="rainbow-connected-address-pill">
            <div class="status-dot"></div>
            <span class="rainbow-connected-address">{{ shortAddress(userAddress) }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Container -->
    <main class="app-container">
      
      <!-- ==================== 1. LANDING PAGE SECTION ==================== -->
      <div v-if="activeSection === 'home'" class="landing-section">
        <!-- Hero Section -->
        <section class="hero-grid" style="margin-bottom: 60px;">
          <div>
            <div class="badge" style="background: var(--accent-teal-light); color: var(--accent-teal-dark); margin-bottom: 16px; border: 2px solid var(--border-color); display: inline-block;">
              ⚡ Powered by Circle USDC & Arc Network
            </div>
            <h1 class="hero-title" style="margin-bottom: 16px; font-size: 52px; line-height: 1.1;">Lock Escrows. Merge Code. Get Paid Instantly.</h1>
            <p class="hero-subtitle" style="margin: 0 0 32px 0; font-size: 18px; line-height: 1.6; color: var(--text-secondary);">
              The stablecoins commerce stack protecting freelancers and clients with reputation-weighted staking, automated Git merges payout, and decentralized jury boards.
            </p>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
              <button class="btn btn-primary" style="font-size: 16px; padding: 12px 28px;" @click="activeSection = 'app'">Launch Portal ➔</button>
              <button class="btn btn-secondary" style="font-size: 16px; padding: 12px 28px;" @click="activeSection = 'docs'">Read Documentation</button>
            </div>
          </div>
          <div style="display: flex; justify-content: center; align-items: center; position: relative;">
            <!-- Hippo Graphic Card -->
            <div class="glass-panel" style="width: 100%; max-width: 360px; background: var(--bg-secondary); border-radius: var(--border-radius-lg); transform: rotate(2deg); display: flex; flex-direction: column; align-items: center; padding: 32px; gap: 20px;">
              <svg viewBox="0 0 200 220" width="130" height="150" style="fill: none; stroke: #1A1A1A; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round;">
                <ellipse cx="100" cy="140" rx="60" ry="60" fill="#72A3A8" />
                <ellipse cx="100" cy="140" rx="35" ry="40" fill="#FAF9F6" />
                <path d="M60 85 C 60 40, 140 40, 140 85 C 140 95, 150 100, 150 120 C 150 150, 50 150, 50 120 C 50 100, 60 95, 60 85 Z" fill="#72A3A8" />
                <path d="M55 58 C 45 58, 45 40, 60 45" fill="#FAF9F6" />
                <path d="M145 58 C 155 58, 155 40, 140 45" fill="#FAF9F6" />
                <ellipse cx="85" cy="80" rx="10" ry="14" fill="#FAF9F6" stroke="#1A1A1A" stroke-width="6" />
                <ellipse cx="115" cy="80" rx="10" ry="14" fill="#FAF9F6" stroke="#1A1A1A" stroke-width="6" />
                <circle cx="85" cy="82" r="5" fill="#1A1A1A" />
                <circle cx="115" cy="82" r="5" fill="#1A1A1A" />
                <path d="M60 115 C 60 95, 140 95, 140 115 C 140 142, 60 142, 60 115 Z" fill="#FAF9F6" stroke="#1A1A1A" stroke-width="6" />
                <circle cx="88" cy="115" r="4" fill="#1A1A1A" />
                <circle cx="112" cy="115" r="4" fill="#1A1A1A" />
                <path d="M75 130 Q 100 138 125 130" stroke="#1A1A1A" stroke-width="5" fill="none" />
              </svg>
              <div style="text-align: center;">
                <h4 style="font-family: var(--font-display); font-size: 20px; margin-bottom: 4px;">Smart Escrow Protect</h4>
                <p style="font-size: 13px; color: var(--text-secondary);">Reputation Tier Level: Elite (0% Stake Required)</p>
              </div>
              <span class="badge" style="background: var(--accent-green); color: var(--text-primary); font-weight: 700;">USDC Secured</span>
            </div>
            <!-- Decorative shadow panel -->
            <div style="position: absolute; width: 100%; max-width: 360px; height: 320px; border: 2.5px solid var(--border-color); border-radius: var(--border-radius-lg); background: var(--accent-purple); top: 12px; left: 12px; z-index: -1; transform: rotate(-1deg);"></div>
          </div>
        </section>

        <!-- Problem vs Solution -->
        <section class="portal-grid" style="margin-bottom: 80px; gap: 32px;">
          <div class="glass-panel" style="background: var(--bg-primary); border-color: var(--accent-magenta); box-shadow: 5px 5px 0px var(--accent-magenta);">
            <span style="font-family: var(--font-display); font-size: 12px; font-weight: 700; color: var(--accent-magenta); text-transform: uppercase;">The Pain Point</span>
            <h3 style="font-size: 28px; margin: 12px 0;">The Freelance Trust Gap</h3>
            <ul style="list-style-type: none; display: flex; flex-direction: column; gap: 16px; margin-top: 20px; font-size: 15px; color: var(--text-secondary);">
              <li style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="color: var(--accent-magenta); font-weight: bold;">✕</span> 
                Freelancers spend hours building only to have client payment cycles take weeks or suffer sudden defaults.
              </li>
              <li style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="color: var(--accent-magenta); font-weight: bold;">✕</span> 
                Clients risk paying upfront deposit only to receive incomplete repositories or low-quality codebases.
              </li>
              <li style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="color: var(--accent-magenta); font-weight: bold;">✕</span> 
                Escrow intermediaries charge 5%-15% margins and disputes take up to 30 days to resolve in standard portals.
              </li>
            </ul>
          </div>
          
          <div class="glass-panel" style="border-color: var(--accent-teal-dark); box-shadow: 5px 5px 0px var(--accent-teal-dark);">
            <span style="font-family: var(--font-display); font-size: 12px; font-weight: 700; color: var(--accent-teal-dark); text-transform: uppercase;">Our Remedy</span>
            <h3 style="font-size: 28px; margin: 12px 0;">Automated Alignment Stack</h3>
            <ul style="list-style-type: none; display: flex; flex-direction: column; gap: 16px; margin-top: 20px; font-size: 15px;">
              <li style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="color: var(--accent-teal-dark); font-weight: bold;">✓</span> 
                <strong>Double-Sided Staking:</strong> Both sides lock funds. Freelancer stake is discount-tiered based on reputations.
              </li>
              <li style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="color: var(--accent-teal-dark); font-weight: bold;">✓</span> 
                <strong>Autonomous Git Webhooks:</strong> Merging the Pull Request triggers Circle Developer-Controlled Wallets to execute payouts instantly.
              </li>
              <li style="display: flex; gap: 8px; align-items: flex-start;">
                <span style="color: var(--accent-teal-dark); font-weight: bold;">✓</span> 
                <strong>Decentralized Jury:</strong> Registered board jurors resolve disputes in 24 hours in exchange for 2% reward shares.
              </li>
            </ul>
          </div>
        </section>

        <!-- Bento Grid Core Features -->
        <section style="margin-bottom: 80px;">
          <h2 style="font-size: 38px; text-align: center; margin-bottom: 40px; font-family: var(--font-display);">Next-Gen Stablecoin Infrastructure</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            <!-- Bento Item 1 -->
            <div class="glass-panel" style="background: var(--bg-secondary); border-color: var(--border-color); display: flex; flex-direction: column; gap: 14px;">
              <div style="width: 44px; height: 44px; border-radius: var(--border-radius-sm); background: var(--accent-teal-light); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center;">
                🔑
              </div>
              <h4 style="font-size: 20px; font-family: var(--font-display);">Reputation-Weighted Staking</h4>
              <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
                Client funds the budget. Freelancers stake collateral dynamically based on on-chain reputation. High-scoring experts get 0% stake requirements.
              </p>
            </div>
            <!-- Bento Item 2 -->
            <div class="glass-panel" style="background: var(--bg-secondary); border-color: var(--border-color); display: flex; flex-direction: column; gap: 14px;">
              <div style="width: 44px; height: 44px; border-radius: var(--border-radius-sm); background: var(--accent-purple); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; color: white;">
                🤖
              </div>
              <h4 style="font-size: 20px; font-family: var(--font-display);">Circle Dev-Controlled Wallets</h4>
              <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
                No manual invoice approvals. Code merge events automatically call API routes, utilizing Circle Developer-Controlled Wallets to execute payout releases.
              </p>
            </div>
            <!-- Bento Item 3 -->
            <div class="glass-panel" style="background: var(--bg-secondary); border-color: var(--border-color); display: flex; flex-direction: column; gap: 14px;">
              <div style="width: 44px; height: 44px; border-radius: var(--border-radius-sm); background: var(--accent-magenta); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center;">
                ⚖️
              </div>
              <h4 style="font-size: 20px; font-family: var(--font-display);">Peer-to-Peer Jury Board</h4>
              <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
                Arbitration is handled by community jurors. Majority vote clears disputes, distributing locked funds and slashing deposits while earning jurors a 2% cut.
              </p>
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
        <section class="glass-panel" style="margin-bottom: 80px; padding: 48px; border-color: var(--border-color); box-shadow: var(--shadow-main); background: var(--bg-secondary);">
          <h2 style="font-size: 32px; font-family: var(--font-display); margin-bottom: 32px; text-align: center;">How It Works in 3 Simple Steps</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px; position: relative;">
            <div style="display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center;">
              <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent-teal); border: 2.5px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 20px; font-weight: 800; box-shadow: 2px 2px 0px var(--border-color);">1</div>
              <h4 style="font-family: var(--font-display); font-size: 18px; margin-top: 8px;">Create & Fund Escrow</h4>
              <p style="font-size: 14px; color: var(--text-secondary);">Client binds their GitHub Repo, designs milestones, and deposits stablecoin budget.</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center;">
              <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent-orange); border: 2.5px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 20px; font-weight: 800; box-shadow: 2px 2px 0px var(--border-color);">2</div>
              <h4 style="font-family: var(--font-display); font-size: 18px; margin-top: 8px;">Join & Stake Collateral</h4>
              <p style="font-size: 14px; color: var(--text-secondary);">Freelancer joins by deposing collateral stake, dynamically modified based on their past reputation points.</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center;">
              <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent-green); border: 2.5px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 20px; font-weight: 800; box-shadow: 2px 2px 0px var(--border-color);">3</div>
              <h4 style="font-family: var(--font-display); font-size: 18px; margin-top: 8px;">Merge or Arbitrate</h4>
              <p style="font-size: 14px; color: var(--text-secondary);">GitHub PR Merge automatically releases funds via Developer-Controlled Webhooks. Disputes unlock Juror review boards.</p>
            </div>
          </div>
          <div style="margin-top: 40px; text-align: center;">
            <button class="btn btn-accent" style="font-size: 16px; padding: 12px 32px;" @click="activeSection = 'app'">Launch Interactive Portal</button>
          </div>
        </section>
      </div>

      <!-- ==================== 2. PLATFORM WORKSPACE ==================== -->
      <div v-else-if="activeSection === 'app'">
        <!-- System Status Banner -->
        <div class="glass-panel system-status-banner" style="margin-bottom: 24px;">
          <div class="status-indicator">
            <div class="status-dot" :class="{ loading: isSystemLoading }"></div>
            <span>
              <strong>System Engine Mode:</strong> 
              <span style="color: var(--accent-teal-dark); font-weight: 700;">{{ systemStatus.mode || 'Detecting...' }}</span>
            </span>
          </div>
          <div style="font-size: 13px; color: var(--text-secondary);">
            <strong>Escrow Contract:</strong> 
            <span style="font-family: monospace; color: var(--text-primary); font-weight: 700;">{{ systemStatus.contractAddress }}</span>
          </div>
          <div style="font-size: 13px; color: var(--text-secondary);">
            <strong>DCW Payout Agent:</strong> 
            <span style="font-family: monospace; color: var(--text-primary); font-weight: 700;">{{ shortAddress(systemStatus.walletAddress || '') }}</span> 
            (Bal: <span style="color: var(--accent-teal-dark); font-weight: 800;">{{ systemStatus.balances?.usdc || '0.00' }} USDC</span>)
          </div>
        </div>

        <!-- Gasless Sponsored Metrics Dashboard -->
        <div class="glass-panel" style="margin-bottom: 24px; border-color: var(--accent-teal); box-shadow: 4px 4px 0px var(--accent-teal); background: var(--bg-secondary); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 20px;">
          <div>
            <div style="font-size: 11px; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; color: var(--accent-teal-dark); margin-bottom: 4px;">⚡ Gasless Transactions</div>
            <div style="font-size: 28px; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">{{ sponsoredTxCount }}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Sponsored by Paymaster</div>
          </div>
          <div>
            <div style="font-size: 11px; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; color: var(--accent-green); margin-bottom: 4px;">💸 Gas Fees Saved</div>
            <div style="font-size: 28px; font-family: var(--font-display); font-weight: 800; color: var(--accent-green);">{{ sponsoredGasSaved.toFixed(4) }} USDC</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Aggregate savings on Arc</div>
          </div>
          <div>
            <div style="font-size: 11px; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; color: var(--accent-purple); margin-bottom: 4px;">🛡️ Paymaster Account</div>
            <div style="font-size: 13px; font-family: monospace; font-weight: 700; color: var(--text-primary); margin-top: 6px; word-break: break-all;">
              {{ systemStatus.circleStatus?.paymasterAddress || '0x0000000071727E5C77c03C68673752c289654e53' }}
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">ERC-4337 Smart Paymaster</div>
          </div>
          <div>
            <div style="font-size: 11px; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; color: var(--accent-orange); margin-bottom: 4px;">📜 Gas Station Policy</div>
            <div style="font-size: 13px; font-family: monospace; font-weight: 700; color: var(--text-primary); margin-top: 6px; word-break: break-all;">
              {{ systemStatus.circleStatus?.paymasterPolicyId?.slice(0, 16) + '...' }}
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Active Sponsorship Policy</div>
          </div>
        </div>

        <!-- StableFX Exchange Desk & Wallet Balances -->
        <div class="glass-panel" style="margin-bottom: 24px; border-color: var(--accent-purple); box-shadow: 4px 4px 0px var(--accent-purple); background: var(--bg-secondary); display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; padding: 20px;">
          <div>
            <div style="font-size: 11px; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; color: var(--accent-purple); margin-bottom: 4px;">💱 StableFX Exchange Rate</div>
            <div style="font-size: 24px; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">
              1 USDC = {{ liveQuoteRate ? liveQuoteRate.toFixed(4) : '0.9200' }} EURC
            </div>
            <div style="font-size: 12px; color: var(--text-secondary);">
              Circle FX engine quote rate
              <span v-if="quoteExpiresInSeconds > 0" style="color: var(--accent-orange); font-weight: 700;"> (Expires in {{ quoteExpiresInSeconds }}s)</span>
            </div>
          </div>
          <div>
            <div style="font-size: 11px; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; color: var(--accent-teal); margin-bottom: 4px;">💵 USDC Balance</div>
            <div style="font-size: 24px; font-family: var(--font-display); font-weight: 800; color: var(--accent-teal);">{{ userUsdcBalance }} USDC</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Available on Arc Testnet</div>
          </div>
          <div>
            <div style="font-size: 11px; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; color: var(--accent-green); margin-bottom: 4px;">💶 EURC Balance</div>
            <div style="font-size: 24px; font-family: var(--font-display); font-weight: 800; color: var(--accent-green);">{{ userEurcBalance }} EURC</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Available on Arc Testnet</div>
          </div>
          <div style="display: flex; flex-direction: column; justify-content: center;">
            <button class="btn btn-accent btn-small" style="margin: 0; padding: 10px 14px;" @click="refreshFxQuote" :disabled="isRefreshingQuote">
              <span v-if="isRefreshingQuote">Fetching Quote...</span>
              <span v-else>🔄 Refresh FX Quote</span>
            </button>
          </div>
        </div>

        <!-- Sub Tab Navigation links inside the Portal view -->
        <div class="nav-links" style="display: inline-flex; gap: 8px; margin-bottom: 24px; padding: 4px; border: var(--border-width) solid var(--border-color); border-radius: var(--border-radius-sm);">
          <span class="nav-link" :class="{ active: currentTab === 'client' }" @click="currentTab = 'client'">Client Portal</span>
          <span class="nav-link" :class="{ active: currentTab === 'freelancer' }" @click="currentTab = 'freelancer'">Freelancer Portal</span>
          <span class="nav-link" :class="{ active: currentTab === 'jury' }" @click="currentTab = 'jury'">Jury Board</span>
          <span class="nav-link" :class="{ active: currentTab === 'appkit' }" @click="currentTab = 'appkit'">App Kit Center</span>
          <span class="nav-link" :class="{ active: currentTab === 'agentic' }" @click="currentTab = 'agentic'">🤖 AI Agent Escrow (ERC-8183)</span>
          <span class="nav-link" :class="{ active: currentTab === 'nanopay' }" @click="currentTab = 'nanopay'">⚡ Gateway Nanopayments (x402)</span>
        </div>


        <!-- Main Dashboard Tab Content -->
        <div v-if="currentTab === 'client'" class="tab-content">
        <div class="portal-grid">
          <!-- Left: Post Gig Form -->
          <div class="glass-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary);">Post a New Gig</h3>
            <form @submit.prevent="createGig">
              <div class="form-group">
                <label class="form-label">Job Title</label>
                <input v-model="newJob.title" type="text" class="form-input" placeholder="e.g., Build Next.js Dashboard" required />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="newJob.description" class="form-input" style="height: 80px; resize: none;" placeholder="Project requirements and scope..." required></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">GitHub Repository URL (owner/repo)</label>
                <input v-model="newJob.repoUrl" type="text" class="form-input" placeholder="e.g., circlefin/arc-escrow" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Total Budget (USDC)</label>
                  <input v-model.number="newJob.budget" type="number" class="form-input" min="1" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Milestones Count</label>
                  <input v-model.number="newJob.milestonesCount" type="number" class="form-input" min="1" max="5" @change="updateMilestonesTemplate" required />
                </div>
              </div>

              <!-- Funding Method Selection -->
              <div class="form-group" style="margin-top: 15px;">
                <label class="form-label">Funding Method</label>
                <div style="display: flex; gap: 16px; margin-top: 4px;">
                  <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; font-weight: 700; color: var(--text-primary);">
                    <input type="radio" v-model="fundingMethod" value="arc" style="accent-color: var(--accent-teal);" />
                    Direct Arc Deposit
                  </label>
                  <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; font-weight: 700; color: var(--text-primary);">
                    <input type="radio" v-model="fundingMethod" value="cross-chain" style="accent-color: var(--accent-teal);" />
                    Pay from External Chain (CCTP)
                  </label>
                </div>
              </div>

              <!-- Source Chain Dropdown Selection -->
              <div v-if="fundingMethod === 'cross-chain'" class="form-group" style="margin-top: 15px; background: var(--bg-secondary); border: 2px solid var(--border-color); padding: 12px; border-radius: var(--border-radius-sm);">
                <label class="form-label" style="color: var(--accent-purple); font-weight: 700;">Select Source Network (Circle CCTP)</label>
                <select v-model="sourceChain" class="form-input" style="width: 100%; margin-top: 6px; padding: 10px;">
                  <option value="Base_Sepolia">Base Sepolia</option>
                  <option value="Ethereum_Sepolia">Ethereum Sepolia</option>
                  <option value="Arbitrum_Sepolia">Arbitrum Sepolia</option>
                </select>
                <p style="font-size: 11px; color: var(--text-secondary); margin-top: 8px; line-height: 1.4;">
                  ⚡ CCTP will burn USDC on the source network, then automatically execute a gasless sponsored mint and escrow deposit on Arc Testnet.
                </p>
              </div>

              <!-- Milestones Input Fields -->
              <div v-if="newJob.milestones.length > 0" style="margin-top: 15px;">
                <h4 style="font-size: 14px; margin-bottom: 10px; color: var(--accent-teal-dark);">Setup Milestones Budgets</h4>
                <div v-for="(m, i) in newJob.milestones" :key="i" class="form-row" style="margin-bottom: 10px;">
                  <input v-model="m.title" type="text" class="form-input" placeholder="Milestone Title" required />
                  <input v-model.number="m.budget" type="number" class="form-input" placeholder="Budget USDC" required />
                </div>
              </div>

              <!-- Team Split Configuration (Feature F) -->
              <div style="margin-top: 15px; border-top: 2px solid var(--border-color); padding-top: 15px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 700; color: var(--text-primary);">
                  <input type="checkbox" v-model="enableSplits" style="accent-color: var(--accent-teal);" />
                  Enable Team Split Payouts
                </label>
                <div v-if="enableSplits" style="margin-top: 12px; background: var(--bg-secondary); border: 2px solid var(--border-color); padding: 12px; border-radius: var(--border-radius-sm);">
                  <h5 style="font-size: 12px; margin-bottom: 8px; color: var(--accent-teal-dark);">Configure Team Splits</h5>
                  <div v-for="(r, idx) in splitRecipients" :key="idx" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
                    <input v-model="r.address" type="text" class="form-input" style="flex: 2; padding: 6px 10px; font-size: 12px;" placeholder="Wallet Address (0x...)" required />
                    <input v-model.number="r.percentage" type="number" class="form-input" style="flex: 1; padding: 6px 10px; font-size: 12px; max-width: 80px;" placeholder="%" min="1" max="100" required />
                    <button type="button" class="btn btn-danger btn-small" style="padding: 4px 8px; margin: 0; min-height: auto;" @click="removeSplitRecipient(idx)" :disabled="splitRecipients.length === 1">×</button>
                  </div>
                  <button type="button" class="btn btn-secondary btn-small" style="margin-top: 6px; padding: 4px 10px;" @click="addSplitRecipient">+ Add Member</button>
                  <p style="font-size: 11px; color: var(--text-secondary); margin-top: 8px;">
                    Ensure total splits equal exactly 100%. All milestone payouts will be automatically routed on-chain to these members.
                  </p>
                </div>
              </div>

              <!-- Confidential Escrow Toggle -->
              <div style="margin-top: 15px; border-top: 2px solid var(--border-color); padding-top: 15px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 700; color: var(--text-primary);">
                  <input type="checkbox" v-model="newJob.isPrivate" style="accent-color: var(--accent-teal);" />
                  🔒 Enable Opt-in Privacy (Confidential Escrow)
                </label>
              </div>

              <div style="margin-top: 24px;">
                <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Funding Escrow...</span>
                  <span v-else>Approve & Post Job</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Right: Posted Gigs List with Yield Tabs -->
          <div class="glass-panel">
            <div class="tabs-header" style="border-bottom: none; margin-bottom: 20px;">
              <button class="tab-btn" :class="{ active: clientSubTab === 'gigs' }" @click="clientSubTab = 'gigs'">Your Posted Gigs</button>
              <button class="tab-btn" :class="{ active: clientSubTab === 'yield' }" @click="clientSubTab = 'yield'">🛡 Yield Vault</button>
            </div>

            <div v-if="clientSubTab === 'gigs'">
              <div v-if="loadingJobs" class="shimmer-bg" style="height: 200px; border-radius: var(--border-radius-md);"></div>
              <div v-else-if="clientJobs.length === 0" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                No jobs posted yet. Create your first freelance gig on Arc Testnet!
              </div>
              <div v-else class="gigs-grid" style="grid-template-columns: 1fr;">
                <div v-for="job in clientJobs" :key="job.id" class="glass-panel" style="background: var(--bg-primary); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                  <div class="gig-card-header">
                    <div>
                      <h4 class="gig-title">
                        <span v-if="job.isPrivate">🔒 </span>
                        {{ job.title }}
                      </h4>
                      <span v-if="!job.isPrivate || job.decrypted" style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Job ID: #{{ job.id }} | Repo: {{ job.repoUrl }}</span>
                      <span v-else style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Job ID: #{{ job.id }} | Repo: 🔒 Confidential</span>
                    </div>
                    <span class="badge" :class="'badge-' + job.status.toLowerCase()">{{ job.status }}</span>
                  </div>
                  <p v-if="!job.isPrivate || job.decrypted" class="gig-desc">{{ job.description }}</p>
                  <p v-else class="gig-desc" style="font-style: italic; color: var(--text-secondary);">This agreement's details are confidential.</p>

                  <!-- Privacy Decryption Box -->
                  <div v-if="job.isPrivate && !job.decrypted" style="margin-top: 15px; padding: 15px; border: 2px solid var(--border-color); background: var(--bg-secondary); border-radius: var(--border-radius-sm); box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-weight: 700; color: var(--accent-magenta); font-size: 13px; display: flex; align-items: center; gap: 6px;">
                      🔒 Confidential Escrow Agreement
                    </div>
                    <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0 12px 0; line-height: 1.4;">
                      This agreement is encrypted on-chain. Enter the 256-bit symmetric Viewer Key to view budget details, description, repository details, and milestones.
                    </p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <input v-model="viewerKeysInput[job.id]" type="text" class="form-input" style="font-family: monospace; font-size: 12px; padding: 6px 10px;" placeholder="Viewer Key (0x...)" />
                      <button class="btn btn-accent btn-small" style="margin: 0; padding: 6px 14px; min-height: auto;" @click="decryptJob(job)">Decrypt</button>
                    </div>
                  </div>

                  <div v-if="!job.isPrivate || job.decrypted" class="gig-meta">
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Total Budget</span>
                      <span class="gig-meta-value">{{ job.budget }} USDC</span>
                    </div>
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Yield Generated</span>
                      <span class="gig-meta-value" style="color: var(--accent-green); font-weight: 700;">
                        +{{ (job.accumulatedYield || 0).toFixed(4) }} USDC
                        <span v-if="job.liveAccruedYield" style="font-size: 11px; font-style: italic; color: var(--accent-teal); font-weight: 500;">
                          (Live: +{{ job.liveAccruedYield.toFixed(4) }})
                        </span>
                      </span>
                    </div>
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Required Stake</span>
                      <span class="gig-meta-value">{{ job.requiredStake }} USDC</span>
                    </div>
                  </div>

                  <!-- Team Split Ratios Display (Feature F) -->
                  <div v-if="(!job.isPrivate || job.decrypted) && job.recipients && job.recipients.length > 0" style="margin-top: 15px; background: var(--bg-secondary); border: 2px solid var(--border-color); padding: 12px; border-radius: var(--border-radius-sm); box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-purple); margin-bottom: 6px;">👥 Team Split Ratios</div>
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-family: monospace;">
                      <div v-for="(recip, idx) in job.recipients" :key="idx" style="display: flex; justify-content: space-between;">
                        <span>{{ recip.toLowerCase() === userAddress.toLowerCase() ? 'You' : shortAddress(recip) }}</span>
                        <span style="font-weight: 700; color: var(--accent-teal-dark);">{{ job.splits[idx] }}%</span>
                      </div>
                    </div>
                  </div>

                  <!-- CCTP Bridged Escrow Details -->
                  <div v-if="(!job.isPrivate || job.decrypted) && job.fundingMethod === 'cross-chain'" style="margin-top: 15px; display: flex; flex-direction: column; gap: 4px; font-size: 11px; font-family: monospace; background: var(--accent-teal-light); border: 2.5px solid var(--border-color); padding: 10px; border-radius: var(--border-radius-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 700; color: var(--accent-teal-dark);">🔀 CCTP Bridged (from {{ job.sourceChain ? job.sourceChain.replace('_', ' ') : 'Base Sepolia' }})</span>
                      <span v-if="job.bridgeVerified" style="color: var(--accent-green); font-weight: 700;">✓ Verified</span>
                      <span v-else style="color: var(--accent-orange); font-weight: 700;">⚠ Verification Pending</span>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px;">
                      <a v-if="job.burnTxHash" :href="getTxExplorerUrl(job.sourceChain, job.burnTxHash)" target="_blank" style="color: var(--text-primary); text-decoration: underline; font-weight: 700;">Burn Tx ↗</a>
                      <a v-if="job.mintTxHash" :href="getTxExplorerUrl('Arc_Testnet', job.mintTxHash)" target="_blank" style="color: var(--text-primary); text-decoration: underline; font-weight: 700;">Mint Tx ↗</a>
                    </div>
                  </div>

                  <!-- Milestones checklist -->
                  <div v-if="!job.isPrivate || job.decrypted" style="margin-top: 15px;">
                    <h5 style="font-size: 13px; margin-bottom: 8px; color: var(--accent-teal-dark);">Milestones Details</h5>
                    <div v-for="(m, idx) in job.milestones" :key="idx" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-secondary); border: 1.5px solid var(--border-color); margin-bottom: 6px; border-radius: 8px;">
                      <div style="display: flex; flex-direction: column; align-items: flex-start;">
                        <span style="font-size: 14px; font-weight: 600;">{{ idx + 1 }}. {{ m.title }}</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">
                          Budget: {{ m.budget }} USDC
                          <span v-if="job.payoutCurrency === 'EURC'" style="color: var(--accent-purple); font-weight: 700;">
                            (Est. {{ (m.budget * liveQuoteRate).toFixed(2) }} EURC)
                          </span>
                        </span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span v-if="m.approved" class="badge badge-completed" style="font-size: 10px; padding: 2px 8px;">Paid</span>
                        <button v-else-if="job.status === 'Active' && job.currentMilestone == idx" class="btn btn-primary btn-small" style="padding: 4px 10px; border-radius: 6px;" @click="payoutMilestone(job.id, idx)">
                          Release Payout
                        </button>
                        <span v-else style="font-size: 12px; color: var(--text-secondary);">Locked</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="(!job.isPrivate || job.decrypted) && job.status === 'Active'" style="margin-top: 15px; display: flex; justify-content: flex-end;">
                    <button class="btn btn-danger btn-small" @click="raiseDispute(job.id)">Raise Dispute</button>
                  </div>

                  <!-- Dispute Appeal Panel for Client -->
                  <div v-if="job.status === 'AppealPending'" style="margin-top: 15px; padding: 12px; background: var(--bg-secondary); border-radius: var(--border-radius-sm); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-size: 13px; font-weight: 700; color: var(--accent-teal-dark); margin-bottom: 6px;">
                      ⚖️ Dispute Appeal Window Open
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">
                      Current Ruling: <strong>{{ getRulingLabel(job.dispute?.ruling) }}</strong> (Tier {{ job.dispute?.appealTier }})
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                      <span v-if="!isAppealWindowClosed(job) && job.dispute?.appealTier < 2" style="font-size: 11px; color: var(--text-secondary);">
                        Fee: {{ job.dispute?.appealTier === 0 ? '100' : '200' }} USDC
                      </span>
                      <button v-if="!isAppealWindowClosed(job) && job.dispute?.appealTier < 2" class="btn btn-accent btn-small" @click="openAppealModal(job.id)" :disabled="isSubmitting">
                        Appeal Ruling
                      </button>
                      <button v-if="isAppealWindowClosed(job)" class="btn btn-accent btn-small" @click="executeRuling(job.id)" :disabled="isSubmitting">
                        Execute Ruling
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SubTab: Yield Vault (Client) -->
            <div v-if="clientSubTab === 'yield'">
              <div class="glass-panel" style="background: var(--bg-secondary); border: 2.5px solid var(--border-color); border-radius: var(--border-radius-md); padding: 20px; margin-bottom: 20px;">
                <h4 style="color: var(--accent-teal-dark); margin-bottom: 12px; font-size: 16px;">🌾 Client Escrow Yield Vault</h4>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
                  Your funded escrows are wrapped in <strong>USYC</strong> tokens to generate interest. Upon milestone releases or resolution, accrued interest is split: <strong>30% Client Cash-back</strong>, <strong>50% Freelancer Incentive</strong>, and <strong>20% Platform Fee</strong>.
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div style="background: var(--bg-primary); border: 2px solid var(--border-color); padding: 16px; border-radius: 8px; box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-size: 12px; color: var(--text-secondary);">Your Cash-Back Received</div>
                    <div style="font-size: 24px; font-weight: 800; color: var(--accent-green); margin-top: 6px;">
                      +{{ totalClientYieldReceived.toFixed(4) }} USDC
                    </div>
                  </div>
                  <div style="background: var(--bg-primary); border: 2px solid var(--border-color); padding: 16px; border-radius: 8px; box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-size: 12px; color: var(--text-secondary);">Your Pending Cash-Back (Live)</div>
                    <div style="font-size: 24px; font-weight: 800; color: var(--accent-teal); margin-top: 6px;">
                      +{{ totalClientYieldAccruing.toFixed(4) }} USDC
                    </div>
                  </div>
                  <div style="background: var(--bg-primary); border: 2px solid var(--border-color); padding: 16px; border-radius: 8px; box-shadow: 2px 2px 0px var(--border-color); grid-column: span 2; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 12px; color: var(--text-secondary);">Platform Treasury Yield Collected</div>
                      <div style="font-size: 20px; font-weight: 800; color: var(--accent-purple); margin-top: 4px;">
                        +{{ totalPlatformYieldRevenue.toFixed(4) }} USDC
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 12px; color: var(--text-secondary);">Live Pending Platform Treasury</div>
                      <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary); margin-top: 4px;">
                        +{{ (jobsList.reduce((sum, j) => sum + (j.liveAccruedYield || 0) * 0.2, 0)).toFixed(4) }} USDC
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h4 style="font-size: 15px; margin-bottom: 12px; color: var(--text-primary);">Your Gigs Yield Activity</h4>
              <div v-if="clientJobs.length === 0" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                No posted gigs generating yield.
              </div>
              <div class="gigs-grid" style="grid-template-columns: 1fr; gap: 12px;">
                <div v-for="job in clientJobs" :key="job.id" class="glass-panel" style="background: var(--bg-primary); border: 2.5px solid var(--border-color); padding: 15px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700;">{{ job.title }}</span>
                    <span class="badge" :class="'badge-' + job.status.toLowerCase()">{{ job.status }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 10px; color: var(--text-secondary);">
                    <span>Accrued Yield: <strong style="color: var(--accent-green);">+{{ (job.accumulatedYield || 0).toFixed(4) }} USDC</strong></span>
                    <span>Live Accruing: <strong style="color: var(--accent-teal);">+{{ (job.liveAccruedYield || 0).toFixed(4) }} USDC</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'freelancer'" class="tab-content">
        <div class="portal-grid">
          <!-- Left: Reputation Score -->
          <div class="glass-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary);">Your Reputation Profile</h3>
            <div style="text-align: center; padding: 20px 0;">
              <div style="font-size: 64px; font-weight: 800; line-height: 1; color: var(--accent-teal); text-shadow: 2px 2px 0px var(--border-color);">
                {{ freelancerReputation }}
              </div>
              <div style="font-size: 14px; color: var(--text-secondary); margin-top: 10px;">Reputation Points</div>
            </div>
            <div style="border-top: 2px solid var(--border-color); padding-top: 20px;">
              <h4 style="font-size: 15px; margin-bottom: 12px;">Dynamic Staking Rates (Feature D)</h4>
              <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; padding: 8px; border-radius: 8px;" :style="freelancerReputation < 3 ? 'background: var(--accent-teal-light); border: 2px solid var(--border-color); font-weight: 700;' : 'border: 2px solid transparent;'">
                  <span>0 - 2 Points (Standard)</span>
                  <span style="font-weight: 800; color: var(--accent-magenta);">10% Stake</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; border-radius: 8px;" :style="freelancerReputation >= 3 && freelancerReputation < 5 ? 'background: var(--accent-teal-light); border: 2px solid var(--border-color); font-weight: 700;' : 'border: 2px solid transparent;'">
                  <span>3 - 4 Points (Experienced)</span>
                  <span style="font-weight: 800; color: var(--accent-orange);">5% Stake</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px; border-radius: 8px;" :style="freelancerReputation >= 5 ? 'background: var(--accent-teal-light); border: 2px solid var(--border-color); font-weight: 700;' : 'border: 2px solid transparent;'">
                  <span>5+ Points (Elite)</span>

                  <span style="font-weight: 800; color: var(--accent-teal-dark);">0% Stake</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Freelancer Board -->
          <div class="glass-panel">
            <div class="tabs-header" style="border-bottom: none; margin-bottom: 20px;">
              <button class="tab-btn" :class="{ active: freelancerSubTab === 'browse' }" @click="freelancerSubTab = 'browse'">Browse Gigs</button>
              <button class="tab-btn" :class="{ active: freelancerSubTab === 'mygigs' }" @click="freelancerSubTab = 'mygigs'">My Joined Gigs</button>
              <button class="tab-btn" :class="{ active: freelancerSubTab === 'yield' }" @click="freelancerSubTab = 'yield'">🛡 Yield Vault</button>
            </div>

            <!-- SubTab: Browse Open Gigs -->
            <div v-if="freelancerSubTab === 'browse'">
              <div v-if="loadingJobs" class="shimmer-bg" style="height: 200px; border-radius: var(--border-radius-md);"></div>
              <div v-else-if="openJobs.length === 0" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                No open gigs available right now. Check back soon or switch wallets!
              </div>
              <div v-else class="gigs-grid" style="grid-template-columns: 1fr;">
                <div v-for="job in openJobs" :key="job.id" class="glass-panel" style="background: var(--bg-primary); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                  <div class="gig-card-header">
                    <div>
                      <h4 class="gig-title">
                        <span v-if="job.isPrivate">🔒 </span>
                        {{ job.title }}
                      </h4>
                      <span v-if="!job.isPrivate || job.decrypted" style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Repo: {{ job.repoUrl }}</span>
                      <span v-else style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Repo: 🔒 Confidential</span>
                    </div>
                    <span class="badge badge-created">Open</span>
                  </div>
                  <p v-if="!job.isPrivate || job.decrypted" class="gig-desc">{{ job.description }}</p>
                  <p v-else class="gig-desc" style="font-style: italic; color: var(--text-secondary);">This agreement's details are confidential.</p>

                  <!-- Privacy Decryption Box -->
                  <div v-if="job.isPrivate && !job.decrypted" style="margin-top: 15px; padding: 15px; border: 2px solid var(--border-color); background: var(--bg-secondary); border-radius: var(--border-radius-sm); box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-weight: 700; color: var(--accent-magenta); font-size: 13px; display: flex; align-items: center; gap: 6px;">
                      🔒 Confidential Escrow Agreement
                    </div>
                    <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0 12px 0; line-height: 1.4;">
                      This agreement is encrypted on-chain. Enter the 256-bit symmetric Viewer Key to view budget details, description, repository details, and milestones.
                    </p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <input v-model="viewerKeysInput[job.id]" type="text" class="form-input" style="font-family: monospace; font-size: 12px; padding: 6px 10px;" placeholder="Viewer Key (0x...)" />
                      <button class="btn btn-accent btn-small" style="margin: 0; padding: 6px 14px; min-height: auto;" @click="decryptJob(job)">Decrypt</button>
                    </div>
                  </div>

                  <div v-if="!job.isPrivate || job.decrypted" class="gig-meta">
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Budget</span>
                      <span class="gig-meta-value" style="color: var(--accent-teal-dark);">
                        {{ job.budget }} USDC
                        <span style="font-size: 11px; color: var(--accent-purple); font-weight: 700;">
                          (Est. {{ (job.budget * liveQuoteRate).toFixed(2) }} EURC)
                        </span>
                      </span>
                    </div>
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Yield Generated</span>
                      <span class="gig-meta-value" style="color: var(--accent-green); font-weight: 700;">
                        +{{ (job.accumulatedYield || 0).toFixed(4) }} USDC
                        <span v-if="job.liveAccruedYield" style="font-size: 11px; font-style: italic; color: var(--accent-teal); font-weight: 500;">
                          (Live: +{{ job.liveAccruedYield.toFixed(4) }})
                        </span>
                      </span>
                    </div>
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Your Required Stake</span>
                      <span class="gig-meta-value" style="color: var(--accent-magenta);">{{ calculateJobRequiredStake(job.budget) }} USDC</span>
                    </div>
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Discount Tier</span>
                      <span class="gig-meta-value" style="color: var(--accent-purple);">{{ freelancerReputation >= 5 ? 'Elite (0%)' : (freelancerReputation >= 3 ? 'Exp (5%)' : 'Std (10%)') }}</span>
                    </div>
                  </div>

                  <!-- Team Split Ratios Display (Feature F) -->
                  <div v-if="(!job.isPrivate || job.decrypted) && job.recipients && job.recipients.length > 0" style="margin-top: 15px; background: var(--bg-secondary); border: 2px solid var(--border-color); padding: 12px; border-radius: var(--border-radius-sm); box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-purple); margin-bottom: 6px;">👥 Team Split Ratios</div>
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-family: monospace;">
                      <div v-for="(recip, idx) in job.recipients" :key="idx" style="display: flex; justify-content: space-between;">
                        <span>{{ recip.toLowerCase() === userAddress.toLowerCase() ? 'You' : shortAddress(recip) }}</span>
                        <span style="font-weight: 700; color: var(--accent-teal-dark);">{{ job.splits[idx] }}%</span>
                      </div>
                    </div>
                  </div>

                  <!-- CCTP Bridged Escrow Details -->
                  <div v-if="(!job.isPrivate || job.decrypted) && job.fundingMethod === 'cross-chain'" style="margin-top: 15px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 4px; font-size: 11px; font-family: monospace; background: var(--accent-teal-light); border: 2.5px solid var(--border-color); padding: 10px; border-radius: var(--border-radius-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 700; color: var(--accent-teal-dark);">🔀 CCTP Bridged (from {{ job.sourceChain ? job.sourceChain.replace('_', ' ') : 'Base Sepolia' }})</span>
                      <span v-if="job.bridgeVerified" style="color: var(--accent-green); font-weight: 700;">✓ Verified</span>
                      <span v-else style="color: var(--accent-orange); font-weight: 700;">⚠ Verification Pending</span>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px;">
                      <a v-if="job.burnTxHash" :href="getTxExplorerUrl(job.sourceChain, job.burnTxHash)" target="_blank" style="color: var(--text-primary); text-decoration: underline; font-weight: 700;">Burn Tx ↗</a>
                      <a v-if="job.mintTxHash" :href="getTxExplorerUrl('Arc_Testnet', job.mintTxHash)" target="_blank" style="color: var(--text-primary); text-decoration: underline; font-weight: 700;">Mint Tx ↗</a>
                    </div>
                  </div>

                  <!-- Apply/Join with Team Split Configuration (Feature F) -->
                  <div v-if="!job.isPrivate || job.decrypted" style="margin-top: 12px; border-top: 1.5px solid var(--border-color); padding-top: 12px; margin-bottom: 12px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; font-weight: 700; color: var(--text-primary);">
                      <input type="checkbox" v-model="getJoinSplitConfig(job.id).enable" style="accent-color: var(--accent-teal);" />
                      Apply/Join with Team Split Payouts
                    </label>
                    <div v-if="getJoinSplitConfig(job.id).enable" style="margin-top: 8px; background: var(--bg-secondary); border: 1.5px solid var(--border-color); padding: 10px; border-radius: var(--border-radius-sm);">
                      <div v-for="(r, idx) in getJoinSplitConfig(job.id).recipients" :key="idx" style="display: flex; gap: 6px; margin-bottom: 6px; align-items: center;">
                        <input v-model="r.address" type="text" class="form-input" style="flex: 2; padding: 6px 8px; font-size: 11px;" placeholder="Wallet Address (0x...)" required />
                        <input v-model.number="r.percentage" type="number" class="form-input" style="flex: 1; padding: 6px 8px; font-size: 11px; max-width: 60px;" placeholder="%" min="1" max="100" required />
                        <button type="button" class="btn btn-danger btn-small" style="padding: 2px 6px; margin: 0; min-height: auto; font-size: 11px;" @click="removeJoinSplitRecipient(job.id, idx)" :disabled="getJoinSplitConfig(job.id).recipients.length === 1">×</button>
                      </div>
                      <button type="button" class="btn btn-secondary btn-small" style="margin-top: 4px; padding: 2px 8px; font-size: 11px;" @click="addJoinSplitRecipient(job.id)">+ Add Member</button>
                      <p style="font-size: 10px; color: var(--text-secondary); margin-top: 6px;">
                        Set coworker addresses and split ratios. Total splits must sum to exactly 100%.
                      </p>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary btn-small" @click="joinGig(job)" :disabled="isSubmitting || (job.isPrivate && !job.decrypted)">
                      Approve & Stake to Join
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- SubTab: My Joined Gigs -->
            <div v-if="freelancerSubTab === 'mygigs'">
              <div v-if="loadingJobs" class="shimmer-bg" style="height: 200px; border-radius: var(--border-radius-md);"></div>
              <div v-else-if="joinedJobs.length === 0" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                You haven't joined any gigs yet. Stake and join open gigs above!
              </div>
              <div v-else class="gigs-grid" style="grid-template-columns: 1fr;">
                <div v-for="job in joinedJobs" :key="job.id" class="glass-panel" style="background: var(--bg-primary); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                  <div class="gig-card-header">
                    <div>
                      <h4 class="gig-title">
                        <span v-if="job.isPrivate">🔒 </span>
                        {{ job.title }}
                      </h4>
                      <span v-if="!job.isPrivate || job.decrypted" style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Repo: {{ job.repoUrl }}</span>
                      <span v-else style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Repo: 🔒 Confidential</span>
                    </div>
                    <span class="badge" :class="'badge-' + job.status.toLowerCase()">{{ job.status }}</span>
                  </div>
                  <p v-if="!job.isPrivate || job.decrypted" class="gig-desc">{{ job.description }}</p>
                  <p v-else class="gig-desc" style="font-style: italic; color: var(--text-secondary);">This agreement's details are confidential.</p>

                  <!-- Privacy Decryption Box -->
                  <div v-if="job.isPrivate && !job.decrypted" style="margin-top: 15px; padding: 15px; border: 2px solid var(--border-color); background: var(--bg-secondary); border-radius: var(--border-radius-sm); box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-weight: 700; color: var(--accent-magenta); font-size: 13px; display: flex; align-items: center; gap: 6px;">
                      🔒 Confidential Escrow Agreement
                    </div>
                    <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0 12px 0; line-height: 1.4;">
                      This agreement is encrypted on-chain. Enter the 256-bit symmetric Viewer Key to view budget details, description, repository details, and milestones.
                    </p>
                    <div style="display: flex; gap: 8px; align-items: center;">
                      <input v-model="viewerKeysInput[job.id]" type="text" class="form-input" style="font-family: monospace; font-size: 12px; padding: 6px 10px;" placeholder="Viewer Key (0x...)" />
                      <button class="btn btn-accent btn-small" style="margin: 0; padding: 6px 14px; min-height: auto;" @click="decryptJob(job)">Decrypt</button>
                    </div>
                  </div>

                  <div v-if="!job.isPrivate || job.decrypted" class="gig-meta">
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Project Budget</span>
                      <span class="gig-meta-value">{{ job.budget }} USDC</span>
                    </div>
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Yield Generated</span>
                      <span class="gig-meta-value" style="color: var(--accent-green); font-weight: 700;">
                        +{{ (job.accumulatedYield || 0).toFixed(4) }} USDC
                        <span v-if="job.liveAccruedYield" style="font-size: 11px; font-style: italic; color: var(--accent-teal); font-weight: 500;">
                          (Live: +{{ job.liveAccruedYield.toFixed(4) }})
                        </span>
                      </span>
                    </div>
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Your Stake Balance</span>
                      <span class="gig-meta-value" style="color: var(--accent-magenta);">{{ job.freelancerStake }} USDC</span>
                    </div>
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Current Milestone</span>
                      <span class="gig-meta-value" style="color: var(--accent-teal-dark);">{{ job.currentMilestone + 1 }} / {{ job.milestones.length }}</span>
                    </div>
                  </div>

                  <!-- Team Split Ratios Display (Feature F) -->
                  <div v-if="(!job.isPrivate || job.decrypted) && job.recipients && job.recipients.length > 0" style="margin-top: 15px; background: var(--bg-secondary); border: 2px solid var(--border-color); padding: 12px; border-radius: var(--border-radius-sm); box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-purple); margin-bottom: 6px;">👥 Team Split Ratios</div>
                    <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-family: monospace;">
                      <div v-for="(recip, idx) in job.recipients" :key="idx" style="display: flex; justify-content: space-between;">
                        <span>{{ recip.toLowerCase() === userAddress.toLowerCase() ? 'You' : shortAddress(recip) }}</span>
                        <span style="font-weight: 700; color: var(--accent-teal-dark);">{{ job.splits[idx] }}%</span>
                      </div>
                    </div>
                  </div>

                  <!-- CCTP Bridged Escrow Details -->
                  <div v-if="(!job.isPrivate || job.decrypted) && job.fundingMethod === 'cross-chain'" style="margin-top: 15px; display: flex; flex-direction: column; gap: 4px; font-size: 11px; font-family: monospace; background: var(--accent-teal-light); border: 2.5px solid var(--border-color); padding: 10px; border-radius: var(--border-radius-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 700; color: var(--accent-teal-dark);">🔀 CCTP Bridged (from {{ job.sourceChain ? job.sourceChain.replace('_', ' ') : 'Base Sepolia' }})</span>
                      <span v-if="job.bridgeVerified" style="color: var(--accent-green); font-weight: 700;">✓ Verified</span>
                      <span v-else style="color: var(--accent-orange); font-weight: 700;">⚠ Verification Pending</span>
                    </div>
                    <div style="display: flex; gap: 12px; margin-top: 4px;">
                      <a v-if="job.burnTxHash" :href="getTxExplorerUrl(job.sourceChain, job.burnTxHash)" target="_blank" style="color: var(--text-primary); text-decoration: underline; font-weight: 700;">Burn Tx ↗</a>
                      <a v-if="job.mintTxHash" :href="getTxExplorerUrl('Arc_Testnet', job.mintTxHash)" target="_blank" style="color: var(--text-primary); text-decoration: underline; font-weight: 700;">Mint Tx ↗</a>
                    </div>
                  </div>

                  <!-- Preferred Payout Currency Preference Selector -->
                  <div v-if="!job.isPrivate || job.decrypted" style="margin-top: 15px; border-top: 2.5px solid var(--border-color); padding-top: 15px; margin-bottom: 15px;">
                    <label class="form-label" style="font-weight: 700;">Preferred Payout Currency</label>
                    <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px;">
                      <select v-model="job.payoutCurrency" class="form-input" style="padding: 8px 12px; font-size: 13px; width: 150px;" @change="updatePayoutCurrencyPreference(job)">
                        <option value="USDC">USDC (default)</option>
                        <option value="EURC">EURC (StableFX Swap)</option>
                      </select>
                      <span style="font-size: 12px; color: var(--text-secondary);">
                        Currently Settling: <strong>{{ job.payoutCurrency || 'USDC' }}</strong>
                      </span>
                    </div>
                  </div>

                  <!-- Simulate PR merge (Feature B) -->
                  <div v-if="(!job.isPrivate || job.decrypted) && job.status === 'Active'" style="border: 2px dashed var(--border-color); border-radius: var(--border-radius-sm); padding: 16px; background: var(--bg-secondary); margin-top: 15px; box-shadow: 3px 3px 0px var(--border-color);">
                    <h5 style="font-size: 14px; margin-bottom: 8px; color: var(--accent-teal-dark);">Simulate GitHub Merge Auto-Payout (Feature B)</h5>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
                      Simulates merging a pull request into the repo branch. This fires our server webhook, which uses the 
                      <strong>Circle Developer-Controlled Wallet</strong> to automatically release the payout on-chain!
                    </p>
                    <div style="display: flex; gap: 10px; align-items: center;">
                      <select v-model="simulatedMilestoneIndex[job.id]" class="form-input" style="padding: 8px 12px; font-size: 13px; width: 180px;">
                        <option v-for="(m, idx) in job.milestones" :key="idx" :value="idx" :disabled="m.approved">
                          Milestone {{ idx + 1 }}: {{ m.title }}
                        </option>
                      </select>
                      <button class="btn btn-accent btn-small" @click="simulatePrMerge(job.id)" :disabled="isSimulating[job.id]">
                        <span v-if="isSimulating[job.id]">Processing Webhook...</span>
                        <span v-else>🚀 Simulate Merge</span>
                      </button>
                    </div>
                  </div>

                  <div v-if="(!job.isPrivate || job.decrypted) && job.status === 'Active'" style="margin-top: 15px; display: flex; justify-content: flex-end;">
                    <button class="btn btn-danger btn-small" @click="raiseDispute(job.id)">Raise Dispute</button>
                  </div>

                  <!-- Dispute Appeal Panel for Freelancer -->
                  <div v-if="job.status === 'AppealPending'" style="margin-top: 15px; padding: 12px; background: var(--bg-secondary); border-radius: var(--border-radius-sm); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-size: 13px; font-weight: 700; color: var(--accent-teal-dark); margin-bottom: 6px;">
                      ⚖️ Dispute Appeal Window Open
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 10px;">
                      Current Ruling: <strong>{{ getRulingLabel(job.dispute?.ruling) }}</strong> (Tier {{ job.dispute?.appealTier }})
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                      <span v-if="!isAppealWindowClosed(job) && job.dispute?.appealTier < 2" style="font-size: 11px; color: var(--text-secondary);">
                        Fee: {{ job.dispute?.appealTier === 0 ? '100' : '200' }} USDC
                      </span>
                      <button v-if="!isAppealWindowClosed(job) && job.dispute?.appealTier < 2" class="btn btn-accent btn-small" @click="openAppealModal(job.id)" :disabled="isSubmitting">
                        Appeal Ruling
                      </button>
                      <button v-if="isAppealWindowClosed(job)" class="btn btn-accent btn-small" @click="executeRuling(job.id)" :disabled="isSubmitting">
                        Execute Ruling
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SubTab: Yield Vault (Freelancer) -->
            <div v-if="freelancerSubTab === 'yield'">
              <div class="glass-panel" style="background: var(--bg-secondary); border: 2.5px solid var(--border-color); border-radius: var(--border-radius-md); padding: 20px; margin-bottom: 20px;">
                <h4 style="color: var(--accent-teal-dark); margin-bottom: 12px; font-size: 16px;">🌾 Freelancer Escrow Yield Vault</h4>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
                  Active escrows are programmatically wrapped in <strong>USYC (USD Yield Coin)</strong>, earning passive interest. Upon milestone payout, accrued yield is distributed: <strong>50% to Freelancer</strong>, <strong>30% to Client</strong>, and <strong>20% to the Platform</strong>.
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div style="background: var(--bg-primary); border: 2px solid var(--border-color); padding: 16px; border-radius: 8px; box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-size: 12px; color: var(--text-secondary);">Your Distributed Yield</div>
                    <div style="font-size: 24px; font-weight: 800; color: var(--accent-green); margin-top: 6px;">
                      +{{ totalFreelancerYieldDistributed.toFixed(4) }} USDC
                    </div>
                  </div>
                  <div style="background: var(--bg-primary); border: 2px solid var(--border-color); padding: 16px; border-radius: 8px; box-shadow: 2px 2px 0px var(--border-color);">
                    <div style="font-size: 12px; color: var(--text-secondary);">Your Pending Accruing Yield (Live)</div>
                    <div style="font-size: 24px; font-weight: 800; color: var(--accent-teal); margin-top: 6px;">
                      +{{ totalFreelancerYieldAccruing.toFixed(4) }} USDC
                    </div>
                  </div>
                  <div style="background: var(--bg-primary); border: 2px solid var(--border-color); padding: 16px; border-radius: 8px; box-shadow: 2px 2px 0px var(--border-color); grid-column: span 2; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 12px; color: var(--text-secondary);">Platform Treasury Yield Collected</div>
                      <div style="font-size: 20px; font-weight: 800; color: var(--accent-purple); margin-top: 4px;">
                        +{{ totalPlatformYieldRevenue.toFixed(4) }} USDC
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 12px; color: var(--text-secondary);">Live Pending Platform Treasury</div>
                      <div style="font-size: 15px; font-weight: 700; color: var(--text-secondary); margin-top: 4px;">
                        +{{ (jobsList.reduce((sum, j) => sum + (j.liveAccruedYield || 0) * 0.2, 0)).toFixed(4) }} USDC
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h4 style="font-size: 15px; margin-bottom: 12px; color: var(--text-primary);">Your Gigs Yield Activity</h4>
              <div v-if="joinedJobs.length === 0" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                No active gigs generating yield.
              </div>
              <div v-else class="gigs-grid" style="grid-template-columns: 1fr; gap: 12px;">
                <div v-for="job in joinedJobs" :key="job.id" class="glass-panel" style="background: var(--bg-primary); border: 2.5px solid var(--border-color); padding: 15px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700;">{{ job.title }}</span>
                    <span class="badge" :class="'badge-' + job.status.toLowerCase()">{{ job.status }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 10px; color: var(--text-secondary);">
                    <span>Accrued Yield: <strong style="color: var(--accent-green);">+{{ (job.accumulatedYield || 0).toFixed(4) }} USDC</strong></span>
                    <span>Live Accruing: <strong style="color: var(--accent-teal);">+{{ (job.liveAccruedYield || 0).toFixed(4) }} USDC</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'jury'" class="tab-content">
        <div class="portal-grid">
          <!-- Left: Juror Registration -->
          <div class="glass-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary);">Become a Juror</h3>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">
              Join the GigMarket Decentralized Jury Pool. Jurors review disputed freelance work, vote on fair distribution, and earn 
              <strong>2% of the escrow budget</strong> as arbitration rewards for their service.
            </p>
            <div style="text-align: center;">
              <div v-if="userIsJuror" style="background: var(--accent-teal-light); border: 2px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 16px; margin-bottom: 20px; box-shadow: 3px 3px 0px var(--border-color);">
                <span style="font-weight: 700; color: var(--accent-teal-dark); font-size: 15px;">✓ You are an Active Juror</span>
              </div>
              <button v-else class="btn btn-accent" style="width: 100%;" @click="registerJuror" :disabled="isSubmitting">
                Register as Juror On-Chain
              </button>

              <!-- Juror Profile Metrics Dashboard -->
              <div v-if="userIsJuror" style="margin-top: 24px; border-top: 2px dashed var(--border-color); padding-top: 20px; text-align: left;">
                <h4 style="margin-bottom: 15px; color: var(--text-primary); font-size: 16px;">Juror Dashboard</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                  <div style="background: var(--bg-secondary); border: 1.5px solid var(--border-color); padding: 10px; border-radius: 8px;">
                    <div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Reputation</div>
                    <div style="font-size: 18px; font-weight: 800; color: var(--accent-teal-dark);">{{ jurorReputationScore }}</div>
                  </div>
                  <div style="background: var(--bg-secondary); border: 1.5px solid var(--border-color); padding: 10px; border-radius: 8px;">
                    <div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Active Stake</div>
                    <div style="font-size: 18px; font-weight: 800; color: var(--accent-magenta);">{{ jurorActiveStake }} USDC</div>
                  </div>
                </div>

                <h5 style="margin-bottom: 10px; font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Voting History</h5>
                <div v-if="jurorHistory.length === 0" style="font-size: 13px; color: var(--text-secondary); font-style: italic;">
                  No vote history found.
                </div>
                <div v-else style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding-right: 4px;">
                  <div v-for="h in jurorHistory" :key="h.jobId" style="background: var(--bg-secondary); border: 1.5px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <span style="font-weight: 600;">Job #{{ h.jobId }}</span>
                      <span style="color: var(--text-secondary); margin-left: 6px;">Voted: {{ getRulingLabel(h.vote) }}</span>
                    </div>
                    <div>
                      <span v-if="h.wasMajority === true" class="badge" style="background: var(--accent-teal-light); color: var(--accent-teal-dark);">+{{ h.rewardEarned || 10 }} Rep</span>
                      <span v-else-if="h.wasMajority === false" class="badge" style="background: var(--accent-orange-light); color: var(--accent-orange-dark);">-{{ h.stakeSlashed || 50 }} USDC</span>
                      <span v-else class="badge" style="background: var(--bg-primary); color: var(--text-secondary);">Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Dispute Resolution Center -->
          <div class="glass-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary);">Active Disputes Room</h3>
            <div v-if="disputedJobs.length === 0" style="text-align: center; padding: 40px; color: var(--text-secondary);">
              No active disputes. The GigMarket ecosystem is currently fully aligned!
            </div>
            <div v-else class="gigs-grid" style="grid-template-columns: 1fr;">
              <div v-for="job in disputedJobs" :key="job.id" class="glass-panel" style="background: var(--bg-primary); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                <div class="gig-card-header">
                  <div>
                    <h4 class="gig-title">{{ job.title }}</h4>
                    <span style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Job ID: #{{ job.id }} | Repository: {{ job.repoUrl }}</span>
                  </div>
                  <span class="badge badge-disputed">Disputed</span>
                </div>
                <p class="gig-desc">{{ job.description }}</p>

                <!-- Escrow Breakdown -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; border-top: 2px solid var(--border-color); padding-top: 15px;">
                  <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Remaining Budget</div>
                    <div style="font-size: 16px; font-weight: 800; color: var(--text-primary);">{{ job.budget }} USDC</div>
                  </div>
                  <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Freelancer Stake</div>
                    <div style="font-size: 16px; font-weight: 800; color: var(--accent-magenta);">{{ job.freelancerStake }} USDC</div>
                  </div>
                  <div>
                    <div style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Juror Pool (2%)</div>
                    <div style="font-size: 16px; font-weight: 800; color: var(--accent-teal-dark);">{{ (parseFloat(job.budget || 0) + parseFloat(job.freelancerStake || 0)) * 0.02 }} USDC</div>
                  </div>
                </div>

                <!-- Jury Voting System -->
                <div v-if="job.status === 'Disputed'" style="margin-top: 20px; padding: 16px; background: var(--bg-secondary); border-radius: var(--border-radius-sm); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                  <h5 style="font-size: 14px; margin-bottom: 12px;">Jury Vote Cast (Current Standings) - Tier {{ job.dispute?.appealTier || 0 }}</h5>
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; text-align: center;">
                    <div style="background: var(--accent-teal-light); border: 1.5px solid var(--border-color); padding: 10px; border-radius: 8px;">
                      <div style="font-size: 18px; font-weight: 800; color: var(--accent-teal-dark);">{{ disputeVotes[job.id]?.clientVotes || 0 }}</div>
                      <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Client Wins</div>
                    </div>
                    <div style="background: var(--bg-primary); border: 1.5px solid var(--border-color); padding: 10px; border-radius: 8px;">
                      <div style="font-size: 18px; font-weight: 800; color: var(--text-primary);">{{ disputeVotes[job.id]?.freelancerVotes || 0 }}</div>
                      <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600;">Freelancer Wins</div>
                    </div>
                    <div style="background: var(--accent-orange); opacity: 0.9; border: 1.5px solid var(--border-color); padding: 10px; border-radius: 8px;">
                      <div style="font-size: 18px; font-weight: 800; color: var(--text-primary);">{{ disputeVotes[job.id]?.splitVotes || 0 }}</div>
                      <div style="font-size: 11px; color: var(--text-primary); font-weight: 600;">Split 50/50</div>
                    </div>
                  </div>

                  <!-- Voter controls -->
                  <div v-if="userIsJuror" style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                    <button class="btn btn-secondary btn-small" style="padding: 6px 12px;" @click="voteDispute(job.id, 1)" :disabled="isSubmitting">Vote Client</button>
                    <button class="btn btn-secondary btn-small" style="padding: 6px 12px;" @click="voteDispute(job.id, 2)" :disabled="isSubmitting">Vote Freelancer</button>
                    <button class="btn btn-secondary btn-small" style="padding: 6px 12px;" @click="voteDispute(job.id, 3)" :disabled="isSubmitting">Vote Split</button>
                  </div>
                  <div v-else style="text-align: center; color: var(--text-secondary); font-size: 13px;">
                    Become a juror on the left panel to participate in this dispute resolution.
                  </div>
                </div>

                <!-- Appeal Pending details -->
                <div v-else-if="job.status === 'AppealPending'" style="margin-top: 20px; padding: 16px; background: var(--bg-secondary); border-radius: var(--border-radius-sm); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                  <h5 style="font-size: 14px; margin-bottom: 8px; color: var(--accent-teal-dark);">⚖️ Temporary Ruling Decided</h5>
                  <div style="font-size: 14px; color: var(--text-primary); margin-bottom: 15px;">
                    Ruling: <strong>{{ getRulingLabel(job.dispute?.ruling) }}</strong>
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; margin-bottom: 15px;">
                    <div style="background: var(--bg-primary); padding: 10px; border-radius: 6px; border: 1.5px solid var(--border-color);">
                      <span style="color: var(--text-secondary); display: block; font-size: 10px; text-transform: uppercase;">Current Tier</span>
                      <strong>Tier {{ job.dispute?.appealTier }}</strong>
                    </div>
                    <div style="background: var(--bg-primary); padding: 10px; border-radius: 6px; border: 1.5px solid var(--border-color);">
                      <span style="color: var(--text-secondary); display: block; font-size: 10px; text-transform: uppercase;">Appeal Pot</span>
                      <strong>{{ job.dispute?.totalAppealPot }} USDC</strong>
                    </div>
                  </div>
                  <div style="font-size: 12px; color: var(--text-secondary);">
                    Appeal deadline: <strong style="color: var(--text-primary);">{{ formatDeadline(job.dispute?.appealDeadline) }}</strong>
                  </div>
                </div>

                <!-- Executable Actions -->
                <div style="margin-top: 15px; display: flex; justify-content: flex-end; align-items: center; gap: 10px;">
                  <!-- Resolve Tier 0/1 dispute (move to AppealPending) -->
                  <div v-if="job.status === 'Disputed'" style="display: flex; justify-content: flex-end; align-items: center; width: 100%;">
                    <span style="font-size: 11px; color: var(--text-secondary); margin-right: 10px;">
                      {{ job.dispute?.appealTier === 1 ? 'Tier 1: Requires 3+ votes' : 'Tier 0: Requires 1+ vote' }}
                    </span>
                    <button class="btn btn-accent btn-small" @click="resolveDispute(job.id)" :disabled="isSubmitting">
                      Resolve & Distribute Escrow
                    </button>
                  </div>

                  <!-- Appeal/Execution buttons when AppealPending -->
                  <div v-else-if="job.status === 'AppealPending'" style="display: flex; gap: 10px; align-items: center; width: 100%;">
                    <!-- Owner Supreme Court Panel (if Tier 2 and open) -->
                    <div v-if="job.dispute?.appealTier === 2 && !isAppealWindowClosed(job) && isOwner" style="width: 100%; border-top: 1px dashed var(--border-color); padding-top: 15px; margin-top: 10px;">
                      <div style="font-size: 12px; font-weight: 700; color: var(--accent-magenta); margin-bottom: 10px; text-transform: uppercase;">
                        🏛️ Supreme Court Action Required (Platform Owner Only)
                      </div>
                      <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="btn btn-secondary btn-small" @click="resolveFinalAppeal(job.id, 1)" :disabled="isSubmitting">Rule Client</button>
                        <button class="btn btn-secondary btn-small" @click="resolveFinalAppeal(job.id, 2)" :disabled="isSubmitting">Rule Freelancer</button>
                        <button class="btn btn-secondary btn-small" @click="resolveFinalAppeal(job.id, 3)" :disabled="isSubmitting">Rule Split</button>
                      </div>
                    </div>
                    <!-- Standard Client/Freelancer Appeal -->
                    <div v-else style="display: flex; justify-content: flex-end; width: 100%; gap: 10px; align-items: center;">
                      <span v-if="!isAppealWindowClosed(job) && job.dispute?.appealTier < 2" style="font-size: 11px; color: var(--text-secondary);">
                        Fee: {{ job.dispute?.appealTier === 0 ? '100' : '200' }} USDC
                      </span>
                      <button v-if="!isAppealWindowClosed(job) && job.dispute?.appealTier < 2" class="btn btn-accent btn-small" @click="openAppealModal(job.id)" :disabled="isSubmitting">
                        Appeal Ruling
                      </button>
                      <button v-if="isAppealWindowClosed(job)" class="btn btn-accent btn-small" @click="executeRuling(job.id)" :disabled="isSubmitting">
                        Execute Ruling Settlement
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'appkit'" class="tab-content">
        <div class="appkit-grid">
          <!-- Left: App Kit SDK Swap Details -->
          <div class="glass-panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="color: var(--text-primary);">App Kit FX Swap</h3>
              <span class="badge" style="background: var(--accent-teal-light); color: var(--accent-teal-dark);">Circle App Kit SDK</span>
            </div>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">
              Swap Circle stablecoins USDC and EURC programmatically using the `@circle-fin/app-kit` same-chain swap router.
            </p>
            <form @submit.prevent="executeAppKitSwap">
              <div class="form-group">
                <label class="form-label">Sell Amount (USDC)</label>
                <input v-model.number="swapForm.amountIn" type="number" class="form-input" min="0.1" step="0.1" required />
              </div>
              <div class="form-group">
                <label class="form-label">Receive (Estimate)</label>
                <input :value="(swapForm.amountIn * 0.92).toFixed(2) + ' EURC'" type="text" class="form-input" disabled />
              </div>
              <div style="margin-top: 24px;">
                <button type="submit" class="btn btn-accent" style="width: 100%;" :disabled="isSubmitting">
                  Execute Swap via App Kit
                </button>
              </div>
            </form>
          </div>

          <!-- Right: App Kit SDK Send Details -->
          <div class="glass-panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="color: var(--text-primary);">App Kit Send</h3>
              <span class="badge" style="background: var(--accent-teal-light); color: var(--accent-teal-dark);">Circle App Kit SDK</span>
            </div>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">
              Send USDC on-chain to any wallet on Arc Testnet. This routes natively through Circle's payment rails.
            </p>
            <form @submit.prevent="executeAppKitSend">
              <div class="form-group">
                <label class="form-label">Recipient Address</label>
                <input v-model="sendForm.recipient" type="text" class="form-input" placeholder="0x..." required />
              </div>
              <div class="form-group">
                <label class="form-label">Amount (USDC)</label>
                <input v-model.number="sendForm.amount" type="number" class="form-input" min="0.1" step="0.1" required />
              </div>
              <div style="margin-top: 24px;">
                <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="isSubmitting">
                  Send USDC via App Kit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div> <!-- Closes currentTab === 'appkit' -->

      <!-- AI Agent Escrow (ERC-8183) Tab -->
      <div v-else-if="currentTab === 'agentic'" class="tab-content">
        <div style="margin-bottom: 24px; text-align: center;">
          <span class="badge" style="background-color: var(--accent-purple); color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 20px;">Standard Protocol</span>
          <h2 style="font-family: var(--font-display); font-size: 32px; color: var(--text-primary); margin-top: 8px; margin-bottom: 8px;">ERC-8183 Agentic Commerce Escrow</h2>
          <p style="color: var(--text-secondary); max-width: 700px; margin: 0 auto; font-size: 14px;">
            Enforce automated signature handshakes, 10% collateral staking, and testing suite oracle verification for machine-to-machine remote contracts.
          </p>
        </div>

        <div class="portal-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Left: Create & Fund Agentic Job -->
          <div class="glass-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>📝 Launch AI Task Escrow</span>
            </h3>
            
            <form @submit.prevent="createAgentJob">
              <div class="form-group">
                <label class="form-label">AI Agent Provider Address</label>
                <input v-model="newAgentJob.provider" type="text" class="form-input" placeholder="0x..." required />
                <span style="font-size: 11px; color: var(--text-secondary);">
                  Simulated agent address (defaults to backend wallet to automate execution loops)
                </span>
              </div>

              <div class="form-group">
                <label class="form-label">Evaluator/Oracle Address</label>
                <input v-model="newAgentJob.evaluator" type="text" class="form-input" placeholder="0x..." required />
                <span style="font-size: 11px; color: var(--text-secondary);">
                  System verification oracle that signs off-chain attestation
                </span>
              </div>

              <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                  <label class="form-label">Amount (USDC)</label>
                  <input v-model.number="newAgentJob.amount" type="number" class="form-input" min="1" required />
                </div>
                <div>
                  <label class="form-label">Expiry (Days)</label>
                  <input v-model.number="newAgentJob.expiryDays" type="number" class="form-input" min="1" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">GitHub Repository / Agent Package</label>
                <input v-model="newAgentJob.repoUrl" type="text" class="form-input" placeholder="github.com/org/repo" required />
              </div>

              <div class="form-group">
                <label class="form-label">Deliverable Code Mock URL</label>
                <input v-model="newAgentJob.codeUrl" type="text" class="form-input" placeholder="https://..." required />
                <span style="font-size: 11px; color: var(--text-secondary);">
                  Include word <strong style="color: var(--accent-red);">"fail"</strong> in URL to simulate failed automated test suites.
                </span>
              </div>

              <div style="margin-top: 24px;">
                <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="isProcessingAgentJob">
                  <span v-if="isProcessingAgentJob">Processing Escrow...</span>
                  <span v-else>🔒 Create & Fund ERC-8183 Job</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Right: Active Agentic Gigs & Simulation Pipeline -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div class="glass-panel" style="flex: 1;">
              <h3 style="margin-bottom: 16px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                🤖 Active Agentic Gigs ({{ agenticJobs.length }})
              </h3>

              <div v-if="agenticJobs.length === 0" style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
                No active agentic escrows found. Post an AI task on the left to start.
              </div>

              <div v-else style="display: flex; flex-direction: column; gap: 16px; max-height: 480px; overflow-y: auto; padding-right: 4px;">
                <div v-for="job in agenticJobs" :key="job.id" class="card" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; background: rgba(255, 255, 255, 0.02);">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                      <h4 style="margin: 0; font-family: var(--font-display); font-size: 16px; color: var(--text-primary);">Job #{{ job.id }}</h4>
                      <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">{{ job.repoUrl }}</div>
                    </div>
                    <span class="badge" :style="{
                      backgroundColor: job.status === 'Completed' ? 'var(--accent-green)' : job.status === 'Rejected' ? 'var(--accent-red)' : 'var(--accent-purple)',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }">{{ job.status }}</span>
                  </div>

                  <div style="font-size: 13px; color: var(--text-secondary); display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <div>💰 Budget: <strong>{{ job.amount }} USDC</strong></div>
                    <div>🔒 Staked Collateral: <strong>{{ (job.amount / 10).toFixed(2) }} USDC (10%)</strong></div>
                    <div style="grid-column: span 2; font-family: monospace; word-break: break-all; font-size: 11px;">
                      🤖 Provider: {{ job.freelancer }}
                    </div>
                  </div>

                  <!-- Steps Simulation -->
                  <div style="border-top: 1px dashed var(--border-color); padding-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <!-- Step 1: Commit -->
                    <button 
                      @click="triggerAgentCommit(job.id)"
                      class="btn btn-accent btn-small"
                      style="padding: 6px 12px; font-size: 12px;"
                      :disabled="job.status !== 'Funded' || isProcessingAgentJob"
                    >
                      Step 1: Sign & Commit (10% Stake)
                    </button>

                    <!-- Step 2: Submit work -->
                    <button 
                      @click="triggerAgentSubmit(job.id)"
                      class="btn btn-accent btn-small"
                      style="padding: 6px 12px; font-size: 12px;"
                      :disabled="job.status !== 'Funded' || isProcessingAgentJob"
                    >
                      Step 2: Submit Work
                    </button>

                    <!-- Step 3: Trigger Oracle Verification -->
                    <button 
                      @click="triggerOracleVerification(job)"
                      class="btn btn-primary btn-small"
                      style="padding: 6px 12px; font-size: 12px;"
                      :disabled="(job.status !== 'Submitted' && job.status !== 'Funded') || isVerifyingDeliverable"
                    >
                      Step 3: Run Oracle Tests
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom: Negotiation and Oracle logs console -->
        <div class="glass-panel" style="margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div>
            <h4 style="margin-bottom: 12px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              <span>💬 Agent Negotiation Console</span>
            </h4>
            <div style="background: #000; font-family: monospace; font-size: 12px; color: var(--accent-green); padding: 16px; border-radius: 6px; height: 180px; overflow-y: auto; border: 1px solid var(--border-color);">
              <div v-for="(log, i) in agentNegotiationLogs" :key="i" style="margin-bottom: 6px;">
                <span style="color: var(--text-secondary);">[{{ log.time }}]</span> {{ log.text }}
              </div>
            </div>
          </div>

          <div>
            <h4 style="margin-bottom: 12px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              <span>🔍 Oracle Testing Unit Output</span>
            </h4>
            <div style="background: #000; font-family: monospace; font-size: 12px; color: #00ffcc; padding: 16px; border-radius: 6px; height: 180px; overflow-y: auto; border: 1px solid var(--border-color);">
              <div v-if="oracleVerificationLogs.length === 0" style="color: var(--text-secondary); text-align: center; padding-top: 50px;">
                Execute step 3 on an active job to trigger testing and linter evaluations.
              </div>
              <div v-else>
                <div v-for="(log, i) in oracleVerificationLogs" :key="i" style="margin-bottom: 4px;">
                  <span :style="{ color: log.startsWith('FAIL') || log.startsWith('Error') ? 'var(--accent-red)' : 'inherit' }">
                    {{ log }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gateway Nanopayments (x402) Tab -->
      <div v-else-if="currentTab === 'nanopay'" class="tab-content">
        <div style="margin-bottom: 24px; text-align: center;">
          <span class="badge" style="background-color: var(--accent-teal-dark); color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 20px;">Sub-Cent Streaming</span>
          <h2 style="font-family: var(--font-display); font-size: 32px; color: var(--text-primary); margin-top: 8px; margin-bottom: 8px;">Gateway Nanopayments & x402 Protocol</h2>
          <p style="color: var(--text-secondary); max-width: 700px; margin: 0 auto; font-size: 14px;">
            Establish low-latency payment channels with Circle Gateway, authorizing sub-cent micropayments ($0.000001 resolution) for git events with zero gas overhead using HTTP-native 402 handshakes.
          </p>
        </div>

        <div class="portal-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Left: Client Channel Manager & Deposit -->
          <div class="glass-panel" style="display: flex; flex-direction: column; gap: 20px;">
            <h3 style="color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>💳 Client Gateway Balance Channel</span>
            </h3>
            
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 20px; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center;">
              <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">Unified Gateway Balance (Client)</span>
              <div style="font-size: 40px; font-family: var(--font-display); font-weight: 800; color: var(--accent-teal);">
                {{ gatewayBalance.toFixed(6) }} USDC
              </div>
              <span style="font-size: 11px; color: var(--text-secondary);">USDC deposited into Circle Gateway channel on Arc Testnet</span>
            </div>

            <form @submit.prevent="depositToGateway">
              <div class="form-group">
                <label class="form-label">Deposit Amount (USDC)</label>
                <div style="display: flex; gap: 10px;">
                  <input v-model.number="gatewayDepositAmount" type="number" step="1" min="1" class="form-input" required />
                  <button type="submit" class="btn btn-primary" style="margin: 0; min-width: 150px;" :disabled="isProcessingGatewayDeposit">
                    <span v-if="isProcessingGatewayDeposit">Depositing...</span>
                    <span v-else>Deposit USDC</span>
                  </button>
                </div>
                <span style="font-size: 11px; color: var(--text-secondary); margin-top: 6px; display: block;">
                  Locks USDC tokens into the Gateway Wallet contract on-chain to back your off-chain sub-cent payments.
                </span>
              </div>
            </form>
          </div>

          <!-- Right: Freelancer Earnings Stream & Settlement -->
          <div class="glass-panel" style="display: flex; flex-direction: column; gap: 20px;">
            <h3 style="color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>💸 Freelancer Micropayments Streamer</span>
            </h3>
            
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 20px; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center; position: relative; overflow: hidden;">
              <div v-if="isStreamingEarningsActive" class="streaming-glow-effect"></div>
              
              <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                <span v-if="isStreamingEarningsActive" class="pulsing-live-dot"></span>
                <span>Accumulated Micro-Earnings (Freelancer)</span>
              </span>
              
              <!-- Realtime Counter -->
              <div style="font-size: 40px; font-family: var(--font-display); font-weight: 800; color: var(--accent-green);">
                {{ realtimeStreamingEarnings.toFixed(6) }} USDC
              </div>
              <span style="font-size: 11px; color: var(--text-secondary);">USDC accumulated instantly from continuous deliverables / Git actions</span>
            </div>

            <div>
              <button @click="withdrawMicropayments" class="btn btn-accent" style="width: 100%;" :disabled="isProcessingGatewayWithdrawal || accumulatedMicropayments <= 0">
                <span v-if="isProcessingGatewayWithdrawal">Withdrawing on Arc...</span>
                <span v-else-if="accumulatedMicropayments <= 0">No Earnings to Settle</span>
                <span v-else>Settle & Withdraw {{ accumulatedMicropayments.toFixed(6) }} USDC to Wallet</span>
              </button>
              <span style="font-size: 11px; color: var(--text-secondary); margin-top: 8px; display: block; text-align: center;">
                Executes an instant, gasless on-chain mint/transfer from the Gateway to your main connected address.
              </span>
            </div>
          </div>
        </div>

        <!-- Bottom section: x402 Challenge-Response Interactive Playground -->
        <div class="glass-panel" style="margin-top: 24px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;">
          <div>
            <h3 style="margin-bottom: 16px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
              ⚡ HTTP-Native x402 Billing Simulator
            </h3>
            
            <form @submit.prevent="runGitActionSimulation">
              <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 16px; margin-bottom: 16px;">
                <div class="form-group">
                  <label class="form-label">Action Type</label>
                  <select v-model="x402PlaygroundState.actionType" class="form-input">
                    <option value="push_commit">Push Lines Commit</option>
                    <option value="api_query">Continuous Linter Review</option>
                    <option value="unit_test">Verify API Endpoint</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Units/Lines of Code</label>
                  <input v-model.number="x402PlaygroundState.linesOfCode" type="number" min="1" max="100" class="form-input" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Deliverable / Code Summary</label>
                <input v-model="x402PlaygroundState.description" type="text" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Recipient Freelancer Address</label>
                <input v-model="x402PlaygroundState.freelancerAddress" type="text" class="form-input" placeholder="0x..." required />
                <span style="font-size: 11px; color: var(--text-secondary);">
                  Micropayments will automatically route to this freelancer's profile.
                </span>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;" :disabled="isSimulatingGitAction || gatewayBalance < 0.05">
                <span v-if="isSimulatingGitAction">Verifying Payment signature...</span>
                <span v-else-if="gatewayBalance < 0.05">Insufficient Gateway Balance (Min 0.05 USDC)</span>
                <span v-else>Submit Billed Git Action (0.05 USDC)</span>
              </button>
            </form>
          </div>

          <div>
            <h3 style="margin-bottom: 16px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>🌐 Web Server Console Log</span>
            </h3>
            <div style="background: #000; font-family: monospace; font-size: 12px; color: var(--accent-green); padding: 16px; border-radius: 6px; height: 320px; overflow-y: auto; border: 1px solid var(--border-color);">
              <div v-for="(log, i) in x402PlaygroundLogs" :key="i" style="margin-bottom: 6px; line-height: 1.4;">
                <span style="color: var(--text-secondary);">[{{ log.time }}]</span> {{ log.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div> <!-- Closes activeSection === 'app' -->


      <!-- ==================== 3. DOCUMENTATION SECTION ==================== -->
      <div v-else-if="activeSection === 'docs'" class="docs-container" style="display: grid; grid-template-columns: 240px 1fr; gap: 32px; align-items: start; margin-bottom: 60px;">
        <!-- Left Sidebar -->
        <aside class="glass-panel" style="padding: 20px; position: sticky; top: 100px;">
          <h4 style="font-family: var(--font-display); font-size: 16px; margin-bottom: 16px; color: var(--accent-teal-dark); border-bottom: 2px solid var(--border-color); padding-bottom: 8px;">Documentation</h4>
          <ul style="list-style-type: none; display: flex; flex-direction: column; gap: 8px; font-size: 14px; font-weight: 600;">
            <li class="nav-link" :class="{ active: selectedDoc === 'intro' }" @click="selectedDoc = 'intro'" style="padding: 8px 12px; border-radius: 6px; cursor: pointer;">
              🚀 Introduction
            </li>
            <li class="nav-link" :class="{ active: selectedDoc === 'quickstart' }" @click="selectedDoc = 'quickstart'" style="padding: 8px 12px; border-radius: 6px; cursor: pointer;">
              ⚡ Quick Start
            </li>
            <li class="nav-link" :class="{ active: selectedDoc === 'staking' }" @click="selectedDoc = 'staking'" style="padding: 8px 12px; border-radius: 6px; cursor: pointer;">
              🛡️ Escrow Staking
            </li>
            <li class="nav-link" :class="{ active: selectedDoc === 'webhook' }" @click="selectedDoc = 'webhook'" style="padding: 8px 12px; border-radius: 6px; cursor: pointer;">
              🤖 Git Automations
            </li>
            <li class="nav-link" :class="{ active: selectedDoc === 'jury' }" @click="selectedDoc = 'jury'" style="padding: 8px 12px; border-radius: 6px; cursor: pointer;">
              ⚖️ Jury Board
            </li>
          </ul>
        </aside>

        <!-- Right Content Area -->
        <article class="glass-panel" style="padding: 40px; min-height: 480px; background: var(--bg-secondary);">
          <!-- Doc: Introduction -->
          <div v-if="selectedDoc === 'intro'">
            <h2 style="font-family: var(--font-display); font-size: 32px; margin-bottom: 16px;">Introduction</h2>
            <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
              GigMarket is a next-generation decentralized freelancing middleware stack designed to enforce security, timing, and payouts in remote working arrangements. By combining Circle stablecoins and EVM smart contracts, we eliminate the need for centralized payment escrows.
            </p>
            <h4 style="margin: 24px 0 12px 0; font-family: var(--font-display); font-size: 18px;">Why Stablecoin Escrows?</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
              Credit cards and cross-border bank channels charge 3%-8% and take several days to settle. With USDC on Arc Network, transfers settle with sub-second finality and predictable gas fees paid directly in USDC.
            </p>
            <div style="background: var(--bg-primary); border: 2.5px solid var(--border-color); padding: 16px; border-radius: var(--border-radius-sm); margin-top: 24px;">
              <h5 style="font-family: var(--font-display); margin-bottom: 8px;">Key Innovations:</h5>
              <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
                <li><strong>Reputation modifiers:</strong> Trusted freelancers avoid staking requirements entirely.</li>
                <li><strong>Git-driven automation:</strong> Merging pull requests directly releases milestones on-chain.</li>
                <li><strong>Decentralized resolution:</strong> Dispute payouts governed by peer jurors.</li>
              </ul>
            </div>
          </div>

          <!-- Doc: Quick Start -->
          <div v-if="selectedDoc === 'quickstart'">
            <h2 style="font-family: var(--font-display); font-size: 32px; margin-bottom: 16px;">Quick Start Guide</h2>
            <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px;">
              Follow these simple steps to set up and run a smart-escrow on Arc Testnet in under 2 minutes.
            </p>

            <h4 style="font-family: var(--font-display); font-size: 18px; margin-bottom: 10px;">1. Connect your EVM Wallet</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
              Click "Connect Wallet" at the top right of the page. Select Metamask or any supported wallet connected to <strong>Arc Testnet</strong>. You will automatically receive mock USDC gas credits to begin.
            </p>

            <h4 style="font-family: var(--font-display); font-size: 18px; margin-bottom: 10px;">2. Draft a Gig Escrow (Client)</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
              Go to the <strong>Client Portal</strong> inside the Launch Portal. Enter your project title, description, GitHub repository path (e.g., <code>your-username/your-repo</code>), total budget in USDC, and milestone amounts. Click <strong>Post Job</strong> and approve the transaction.
            </p>

            <h4 style="font-family: var(--font-display); font-size: 18px; margin-bottom: 10px;">3. Stake & Join (Freelancer)</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
              Switch accounts in your wallet, go to the <strong>Freelancer Portal</strong> under Open Gigs, click <strong>Stake to Join</strong>, and lock your collateral to begin the active milestones!
            </p>
          </div>

          <!-- Doc: Escrow Staking -->
          <div v-if="selectedDoc === 'staking'">
            <h2 style="font-family: var(--font-display); font-size: 32px; margin-bottom: 16px;">Staking Protection</h2>
            <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
              Traditional escrows only protect freelancers by holding client funds. GigMarket introduces double-sided alignment to protect clients from developer default.
            </p>
            <h4 style="margin: 20px 0 10px 0; font-family: var(--font-display); font-size: 18px;">Dynamic Reputation Tiers</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
              Each user address maintains an on-chain Reputation point score. Succeeding in projects adds +1 reputation; defaulting or losing disputes subtracts -2 points.
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px;">
              <div style="padding: 16px; background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: var(--border-radius-sm);">
                <strong style="color: var(--accent-magenta);">Tier 1: Standard</strong>
                <p style="font-size: 12px; margin-top: 4px; color: var(--text-secondary);">0-2 Points. Requires 10% milestone staking as trust collateral.</p>
              </div>
              <div style="padding: 16px; background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: var(--border-radius-sm);">
                <strong style="color: var(--accent-teal-dark);">Tier 3: Elite</strong>
                <p style="font-size: 12px; margin-top: 4px; color: var(--text-secondary);">5+ Points. Requires 0% staking. Maximum discount tier enabled.</p>
              </div>
            </div>
          </div>

          <!-- Doc: Git Automations -->
          <div v-if="selectedDoc === 'webhook'">
            <h2 style="font-family: var(--font-display); font-size: 32px; margin-bottom: 16px;">Git Webhook Automation</h2>
            <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
              Escrows are integrated with development operations. Merging code releases payouts autonomously.
            </p>
            <h4 style="margin: 20px 0 10px 0; font-family: var(--font-display); font-size: 18px;">How the Webhook routes payments:</h4>
            <ol style="padding-left: 20px; font-size: 14px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px;">
              <li>Client registers repository hook details upon gig setup.</li>
              <li>GitHub fires a <code>pull_request.merged</code> callback containing the pull request status.</li>
              <li>The API verification router validates cryptographic headers and matches the project ID.</li>
              <li>The Circle Developer-Controlled Wallet executes <code>approveMilestone</code> on the contract on-chain.</li>
            </ol>
            <div style="background: var(--bg-primary); border: 2.5px solid var(--border-color); font-family: monospace; font-size: 12px; padding: 16px; border-radius: var(--border-radius-sm); overflow-x: auto;">
              POST /api/github-webhook<br>
              Headers: X-Hub-Signature-256<br>
              Body: { "action": "closed", "pull_request": { "merged": true } }
            </div>
          </div>

          <!-- Doc: Jury Board -->
          <div v-if="selectedDoc === 'jury'">
            <h2 style="font-family: var(--font-display); font-size: 32px; margin-bottom: 16px;">Jury Arbitration</h2>
            <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">
              When clients or freelancers disagree on deliverable quality, either party may initiate a dispute. The locked stablecoins are frozen and peer jurors are summoned.
            </p>
            <h4 style="margin: 20px 0 10px 0; font-family: var(--font-display); font-size: 18px;">Dispute Voting Panels</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
              Registered jurors cast secure votes. The majority outcome resolves the contract. An arbitration fee of 3% is charged: 2% is divided among voters and 1% goes to network maintenance.
            </p>
          </div>
        </article>
      </div>

      <!-- ==================== 4. FAQ SECTION ==================== -->
      <div v-else-if="activeSection === 'faq'" class="faq-section" style="max-width: 800px; margin: 0 auto 60px auto;">
        <h2 style="font-size: 36px; font-family: var(--font-display); text-align: center; margin-bottom: 24px;">Frequently Asked Questions</h2>
        
        <!-- Search bar -->
        <div class="form-group" style="margin-bottom: 32px;">
          <input v-model="faqSearch" type="text" class="form-input" placeholder="Search questions or keywords..." style="height: 52px; font-size: 15px;" />
        </div>

        <!-- Accordions -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div v-for="(item, idx) in filteredFaqs" :key="idx" class="glass-panel" style="padding: 0; background: var(--bg-secondary); overflow: hidden;">
            <div style="padding: 20px 24px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 16px; font-family: var(--font-display);" @click="toggleFaq(idx)">
              <span>{{ item.q }}</span>
              <span style="font-size: 20px; font-weight: 800; transform: rotate(0deg); transition: var(--transition-smooth);" :style="faqOpen[idx] ? 'transform: rotate(45deg);' : ''">+</span>
            </div>
            <div v-if="faqOpen[idx]" style="padding: 0 24px 20px 24px; font-size: 14px; color: var(--text-secondary); line-height: 1.6; border-top: 1.5px solid var(--border-color); padding-top: 16px; white-space: pre-wrap;">
              {{ item.a }}
            </div>
          </div>
          <div v-if="filteredFaqs.length === 0" style="text-align: center; padding: 40px; color: var(--text-secondary);">
            No matches found for your search term.
          </div>
        </div>
      </div>

      <!-- ==================== 5. ABOUT TEAM SECTION ==================== -->
      <div v-else-if="activeSection === 'about'" class="about-section" style="max-width: 900px; margin: 0 auto 60px auto;">
        <h2 style="font-size: 36px; font-family: var(--font-display); text-align: center; margin-bottom: 16px;">About GigMarket</h2>
        <p style="font-size: 16px; text-align: center; color: var(--text-secondary); max-width: 600px; margin: 0 auto 40px auto; line-height: 1.6;">
          Re-imagining the global freelance commercial infrastructure through automated payments, staking alignment, and community governance.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 48px;">
          <div class="glass-panel">
            <h4 style="font-family: var(--font-display); font-size: 20px; margin-bottom: 12px; color: var(--accent-teal-dark);">Our Mission</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
              To make remote gig agreements trustless, secure, and zero-friction. By utilizing stablecoin rails, we offer rapid settlement speeds and bypass high banking card transaction limits.
            </p>
          </div>
          <div class="glass-panel">
            <h4 style="font-family: var(--font-display); font-size: 20px; margin-bottom: 12px; color: var(--accent-orange);">Hackathon Origin</h4>
            <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
              Created during the Stablecoins Commerce Stack Challenge to integrate Circle's programmatic developer wallets, Web3 App Kit swaps, and Arc Network speed finalities.
            </p>
          </div>
        </div>

        <h3 style="font-size: 28px; font-family: var(--font-display); text-align: center; margin-bottom: 24px;">Creative Core Team</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;">
          <div class="glass-panel" style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--accent-teal); border: 2.5px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 28px;">🦛</div>
            <div>
              <h5 style="font-family: var(--font-display); font-size: 16px;">Chaaya</h5>
              <p style="font-size: 12px; color: var(--text-secondary);">Lead Architect / Smart Contracts</p>
            </div>
          </div>
          <div class="glass-panel" style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--accent-purple); border: 2.5px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 28px;">🦁</div>
            <div>
              <h5 style="font-family: var(--font-display); font-size: 16px;">Alex</h5>
              <p style="font-size: 12px; color: var(--text-secondary);">Frontend Developer / Web3 UI UX</p>
            </div>
          </div>
          <div class="glass-panel" style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--accent-magenta); border: 2.5px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 28px;">🦊</div>
            <div>
              <h5 style="font-family: var(--font-display); font-size: 16px;">Devon</h5>
              <p style="font-size: 12px; color: var(--text-secondary);">Backend / Circle Integration</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 6. CONTACT SECTION ==================== -->
      <div v-else-if="activeSection === 'contact'" class="contact-section" style="max-width: 600px; margin: 0 auto 60px auto;">
        <div class="glass-panel">
          <h2 style="font-size: 32px; font-family: var(--font-display); margin-bottom: 12px; text-align: center;">Get In Touch</h2>
          <p style="font-size: 14px; color: var(--text-secondary); text-align: center; margin-bottom: 24px;">
            Have questions, feedback, or need support? Fill out the contact ticket and we will be in touch.
          </p>

          <form @submit.prevent="submitContact">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input v-model="contactForm.email" type="email" class="form-input" placeholder="you@example.com" required />
            </div>
            <div class="form-row" style="margin-bottom: 15px;">
              <div class="form-group">
                <label class="form-label">Subject</label>
                <input v-model="contactForm.subject" type="text" class="form-input" placeholder="Query details" required />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select v-model="contactForm.category" class="form-input">
                  <option value="support">Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Bug Report</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Message Details</label>
              <textarea v-model="contactForm.message" class="form-input" style="height: 120px; resize: none;" placeholder="Details about your inquiry..." required></textarea>
            </div>
            <div style="margin-top: 24px;">
              <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ==================== 7. LEGAL PAGES SECTION ==================== -->
      <div v-else-if="activeSection === 'legal-privacy'" class="legal-section" style="max-width: 800px; margin: 0 auto 60px auto;">
        <article class="glass-panel" style="padding: 40px;">
          <h2 style="font-family: var(--font-display); font-size: 32px; margin-bottom: 16px;">Privacy Policy</h2>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 24px;">Last Updated: May 2026</p>
          <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; display: flex; flex-direction: column; gap: 16px;">
            <p>At GigMarket, we respect your privacy. All smart contract actions, wallets, and escrow balances are maintained publicly on-chain on Arc Testnet. We do not harvest, store, or sell any private credentials or API keys on our servers.</p>
            <h4 style="font-family: var(--font-display); font-size: 18px; color: var(--text-primary);">1. Data Collection</h4>
            <p>We do not store your wallet private keys. All transaction signers use browser providers (e.g. Metamask) which remain local to your browser. Server webhook database records repository links and public addresses solely to match merged code to payment tasks.</p>
            <h4 style="font-family: var(--font-display); font-size: 18px; color: var(--text-primary);">2. Cookie Rules</h4>
            <p>Our website utilizes local storage parameters solely to hold session states (such as active pages or transaction histories). No third-party marketing cookies are utilized.</p>
          </div>
        </article>
      </div>

      <div v-else-if="activeSection === 'legal-terms'" class="legal-section" style="max-width: 800px; margin: 0 auto 60px auto;">
        <article class="glass-panel" style="padding: 40px;">
          <h2 style="font-family: var(--font-display); font-size: 32px; margin-bottom: 16px;">Terms of Service</h2>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 24px;">Last Updated: May 2026</p>
          <div style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; display: flex; flex-direction: column; gap: 16px;">
            <p>Welcome to GigMarket. By using our platform, you acknowledge and agree to the following terms governing escrow smart contracts and Web3 wallets.</p>
            <h4 style="font-family: var(--font-display); font-size: 18px; color: var(--text-primary);">1. Smart Escrow Staking</h4>
            <p>All staking actions are carried out on-chain. Staked stablecoins are bound by smart contract conditions. Lost reputation scores or juror-majority slashed deposits cannot be reversed by the website administrators.</p>
            <h4 style="font-family: var(--font-display); font-size: 18px; color: var(--text-primary);">2. Webhook Automations</h4>
            <p>The webhook simulation API and Circle DCW release engines are hosted on-chain/on-server testbeds. We are not liable for delayed payouts arising from GitHub API outages or Arc Testnet node synchronization issues.</p>
          </div>
        </article>
      </div>

      <!-- ==================== 8. FOOTER ==================== -->
      <footer style="margin-top: 80px; padding-top: 32px; border-top: 2.5px solid var(--border-color); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 24px; font-size: 13px; color: var(--text-secondary); padding-bottom: 40px; width: 100%;">
        <div>
          <strong style="font-family: var(--font-display); color: var(--text-primary); font-size: 15px;">GigMarket</strong>
          <p style="margin-top: 6px;">Secure Decentralized Freelance Commerce Stack.</p>
          <p style="margin-top: 4px;">© 2026. All rights reserved.</p>
        </div>
        <div style="display: flex; gap: 32px; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <strong style="color: var(--text-primary);">Resources</strong>
            <span style="cursor: pointer;" @click="activeSection = 'docs'">Docs</span>
            <span style="cursor: pointer;" @click="activeSection = 'faq'">FAQ</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <strong style="color: var(--text-primary);">Company</strong>
            <span style="cursor: pointer;" @click="activeSection = 'about'">About Team</span>
            <span style="cursor: pointer;" @click="activeSection = 'contact'">Contact Support</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <strong style="color: var(--text-primary);">Legal</strong>
            <span style="cursor: pointer;" @click="activeSection = 'legal-privacy'">Privacy Policy</span>
            <span style="cursor: pointer;" @click="activeSection = 'legal-terms'">Terms of Service</span>
          </div>
        </div>
      </footer>

      <!-- RainbowKit Custom Theme Connection Modal -->
      <div v-if="isWalletModalOpen" class="wallet-modal-overlay" @click.self="closeWalletModal">
        <div class="wallet-modal-container">
          <!-- Header -->
          <div class="wallet-modal-header">
            <span class="wallet-modal-title">Connect a Wallet</span>
            <button class="wallet-modal-close" @click="closeWalletModal">×</button>
          </div>
          <!-- Body -->
          <div class="wallet-modal-body">
            <!-- Sidebar: Wallet list -->
            <div class="wallet-modal-sidebar">
              <button 
                class="wallet-option-btn" 
                :class="{ active: selectedWallet === 'circle' }"
                @click="selectWallet('circle')"
              >
                <div class="wallet-logo-container" style="background: var(--accent-teal); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; width: 20px; height: 20px;">
                  🔑
                </div>
                Email / Social
              </button>
              <button 
                class="wallet-option-btn" 
                :class="{ active: selectedWallet === 'metamask' }"
                @click="selectWallet('metamask')"
              >
                <div class="wallet-logo-container">
                  <svg viewBox="0 0 32 32" width="20" height="20">
                    <path d="M29.5 15.5l-3.2-5.5-2.8-4.8H8.5L5.7 10l-3.2 5.5v.8l3.2 5.5 2.8 4.8h15l2.8-4.8 3.2-5.5v-.8z" fill="#E2761B"/>
                    <path d="M16 26.5l-4-5.5 1.5-.7 2.5 1.8 2.5-1.8 1.5.7-4 5.5z" fill="#E2761B"/>
                    <path d="M7.5 13.5l1.5-3.5 7 1.5 7-1.5 1.5 3.5-8.5 7-8.5-7z" fill="#E2761B"/>
                    <circle cx="11.5" cy="13.5" r="1.5" fill="#FFFFFF"/>
                    <circle cx="20.5" cy="13.5" r="1.5" fill="#FFFFFF"/>
                  </svg>
                </div>
                MetaMask
              </button>
              <button 
                class="wallet-option-btn" 
                :class="{ active: selectedWallet === 'rainbow' }"
                @click="selectWallet('rainbow')"
              >
                <div class="wallet-logo-container">
                  <svg viewBox="0 0 32 32" width="20" height="20">
                    <circle cx="16" cy="16" r="14" fill="#000" />
                    <path d="M16 4a12 12 0 0 1 12 12H16V4z" fill="#FF1E56" />
                    <path d="M16 16h12a12 12 0 0 1-12 12V16z" fill="#FFAC41" />
                    <path d="M16 16v12A12 12 0 0 1 4 16h12z" fill="#3282B8" />
                    <path d="M4 16A12 12 0 0 1 16 4v12H4z" fill="#00E2C6" />
                  </svg>
                </div>
                Rainbow
              </button>
              <button 
                class="wallet-option-btn" 
                :class="{ active: selectedWallet === 'coinbase' }"
                @click="selectWallet('coinbase')"
              >
                <div class="wallet-logo-container">
                  <svg viewBox="0 0 32 32" width="20" height="20">
                    <circle cx="16" cy="16" r="13" fill="#0052FF" />
                    <rect x="9" y="9" width="14" height="14" rx="2" fill="#FFFFFF" />
                  </svg>
                </div>
                Coinbase Wallet
              </button>
              <button 
                class="wallet-option-btn" 
                :class="{ active: selectedWallet === 'walletconnect' }"
                @click="selectWallet('walletconnect')"
              >
                <div class="wallet-logo-container">
                  <svg viewBox="0 0 32 32" width="20" height="20">
                    <path d="M23 10.5c-3.8-3.8-10.2-3.8-14 0L4 15.5c.3.3.8.3 1.1 0l3.8-3.8c3.2-3.2 8.4-3.2 11.6 0l3.8 3.8c.3.3.8.3 1.1 0l-2.4-2.5-2.4-2.5z" fill="#3B99FC"/>
                    <path d="M10.5 17c-3-3-8 3-4.5 6.5l3.8-3.8c.3-.3.8-.3 1.1 0l3.8 3.8c3.5-3.5-1.5-9.5-4.2-6.5z" fill="#3B99FC"/>
                  </svg>
                </div>
                WalletConnect
              </button>
            </div>

            <!-- Detail pane -->
            <div class="wallet-modal-detail">
              <!-- Connecting state -->
              <div v-if="isConnectingWallet" style="display: flex; flex-direction: column; align-items: center;">
                <div class="spinner-circle"></div>
                <h4 class="wallet-status-title">
                  {{ selectedWallet === 'circle' ? 'Authenticating Session' : 'Requesting Connection' }}
                </h4>
                <p class="wallet-status-desc">
                  {{ selectedWallet === 'circle'
                      ? 'Establishing connection to secure enclave, please wait...'
                      : 'Please accept the connection request in your browser extension to proceed.' }}
                </p>
              </div>

              <!-- Error State -->
              <div v-else-if="walletConnectionError" style="display: flex; flex-direction: column; align-items: center;">
                <div style="background: #FFF1F0; border: 2px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 12px; margin-bottom: 16px;">
                  <span style="color: var(--accent-magenta); font-weight: 800; font-size: 24px;">⚠</span>
                </div>
                <h4 class="wallet-status-title">Connection Rejected</h4>
                <p class="wallet-status-desc">{{ walletConnectionError }}</p>
                <button class="btn btn-secondary btn-small" @click="retryWalletConnection">Try Again</button>
              </div>

              <!-- Circle view -->
              <div v-else-if="selectedWallet === 'circle'" style="width: 100%;">
                <!-- PIN Setup Screen -->
                <div v-if="showPinScreen" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                  <div style="background: var(--accent-teal-light); border: 2.5px solid var(--border-color); border-radius: 50%; padding: 16px; margin-bottom: 16px; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 2px 2px 0px var(--border-color);">
                    🔒
                  </div>
                  <h4 class="wallet-status-title">Configure Wallet PIN</h4>
                  <p class="wallet-status-desc">Create your 6-digit secure PIN. This PIN will be required to authorize transfers and smart contract actions.</p>
                  
                  <div style="margin: 20px 0; width: 100%; text-align: center;">
                    <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 12px;">A Circle secure dialog will launch next to prompt for PIN selection.</span>
                    <button class="btn btn-accent" style="width: 100%;" @click="submitPinSetup" :disabled="isInitializingWallet">
                      {{ isInitializingWallet ? 'Initializing...' : 'Launch Secure PIN Setup' }}
                    </button>
                  </div>
                </div>

                <!-- Email / Login Screen -->
                <div v-else style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                  <div style="background: var(--accent-teal-light); border: 2.5px solid var(--border-color); border-radius: 50%; padding: 16px; margin-bottom: 16px; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 2px 2px 0px var(--border-color);">
                    📧
                  </div>
                  <h4 class="wallet-status-title">Circle Web2 Portal</h4>
                  <p class="wallet-status-desc">Sign in securely using your email or social credentials. No browser extension required.</p>
                  
                  <!-- Email input -->
                  <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; margin: 20px 0;">
                    <input 
                      type="email" 
                      v-model="circleEmail" 
                      placeholder="Enter email address" 
                      class="form-input" 
                      style="width: 100%; font-size: 14px; padding: 12px; border-radius: var(--border-radius-sm); border: var(--border-width) solid var(--border-color); text-align: center;"
                      :disabled="isConnectingWallet"
                      @keydown.enter="handleCircleLogin"
                    />
                    <button class="btn btn-primary" style="width: 100%;" @click="handleCircleLogin" :disabled="isConnectingWallet">
                      {{ isConnectingWallet ? 'Authenticating...' : 'Sign In with Email' }}
                    </button>
                  </div>

                  <!-- Divider -->
                  <div style="display: flex; align-items: center; width: 100%; margin: 10px 0;">
                    <div style="flex: 1; height: 2px; background: var(--border-color);"></div>
                    <span style="margin: 0 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em;">or connect with</span>
                    <div style="flex: 1; height: 2px; background: var(--border-color);"></div>
                  </div>

                  <!-- Social Logins -->
                  <div style="display: flex; gap: 12px; width: 100%; margin-top: 12px;">
                    <button class="btn btn-secondary" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 0; font-size: 13px;" @click="circleEmail = 'google-user@gmail.com'; handleCircleLogin()">
                      <span>🌐</span> Google
                    </button>
                    <button class="btn btn-secondary" style="flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 0; font-size: 13px;" @click="circleEmail = 'apple-user@icloud.com'; handleCircleLogin()">
                      <span>🍎</span> Apple
                    </button>
                  </div>
                </div>
              </div>

              <!-- MetaMask view -->
              <div v-else-if="selectedWallet === 'metamask'">
                <div style="width: 80px; height: 80px; margin: 0 auto 16px;">
                  <svg viewBox="0 0 32 32" width="80" height="80">
                    <path d="M29.5 15.5l-3.2-5.5-2.8-4.8H8.5L5.7 10l-3.2 5.5v.8l3.2 5.5 2.8 4.8h15l2.8-4.8 3.2-5.5v-.8z" fill="#E2761B"/>
                    <path d="M16 26.5l-4-5.5 1.5-.7 2.5 1.8 2.5-1.8 1.5.7-4 5.5z" fill="#E2761B"/>
                    <path d="M7.5 13.5l1.5-3.5 7 1.5 7-1.5 1.5 3.5-8.5 7-8.5-7z" fill="#E2761B"/>
                    <circle cx="11.5" cy="13.5" r="1.5" fill="#FFFFFF"/>
                    <circle cx="20.5" cy="13.5" r="1.5" fill="#FFFFFF"/>
                  </svg>
                </div>
                <h4 class="wallet-status-title">Connect with MetaMask</h4>
                <p class="wallet-status-desc">Use the popular browser extension wallet to sign in, deploy smart contracts, and stake USDC.</p>
                <button class="btn btn-primary" @click="triggerBrowserConnection">Connect Extension</button>
              </div>

              <!-- Rainbow Wallet view -->
              <div v-else-if="selectedWallet === 'rainbow'">
                <div style="width: 80px; height: 80px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; background: #000; border-radius: 16px;">
                  <svg viewBox="0 0 32 32" width="56" height="56">
                    <circle cx="16" cy="16" r="14" fill="#000" />
                    <path d="M16 4a12 12 0 0 1 12 12H16V4z" fill="#FF1E56" />
                    <path d="M16 16h12a12 12 0 0 1-12 12V16z" fill="#FFAC41" />
                    <path d="M16 16v12A12 12 0 0 1 4 16h12z" fill="#3282B8" />
                    <path d="M4 16A12 12 0 0 1 16 4v12H4z" fill="#00E2C6" />
                  </svg>
                </div>
                <h4 class="wallet-status-title">Rainbow Wallet</h4>
                <p class="wallet-status-desc">Connect using the Rainbow browser extension or scan a secure QR code using the mobile app.</p>
                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                  <button class="btn btn-primary" style="margin: 0;" @click="triggerBrowserConnection">Connect Extension</button>
                  <button class="btn btn-secondary" style="margin: 0;" @click="triggerWalletConnectConnection">Scan QR / Connect Mobile</button>
                </div>
              </div>

              <!-- Coinbase Wallet view -->
              <div v-else-if="selectedWallet === 'coinbase'">
                <div style="width: 80px; height: 80px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; background: #0052FF; border-radius: 16px;">
                  <svg viewBox="0 0 32 32" width="56" height="56">
                    <circle cx="16" cy="16" r="13" fill="#0052FF" />
                    <rect x="9" y="9" width="14" height="14" rx="2" fill="#FFFFFF" />
                  </svg>
                </div>
                <h4 class="wallet-status-title">Coinbase Wallet</h4>
                <p class="wallet-status-desc">Connect using the Coinbase Wallet browser extension or scan a secure QR code using the mobile app.</p>
                <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
                  <button class="btn btn-primary" style="margin: 0;" @click="triggerBrowserConnection">Connect Extension</button>
                  <button class="btn btn-secondary" style="margin: 0;" @click="triggerWalletConnectConnection">Scan QR / Connect Mobile</button>
                </div>
              </div>

              <!-- WalletConnect view -->
              <div v-else-if="selectedWallet === 'walletconnect'">
                <div style="width: 80px; height: 80px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; background: #3B99FC; border-radius: 16px;">
                  <svg viewBox="0 0 32 32" width="56" height="56">
                    <path d="M23 10.5c-3.8-3.8-10.2-3.8-14 0L4 15.5c.3.3.8.3 1.1 0l3.8-3.8c3.2-3.2 8.4-3.2 11.6 0l3.8 3.8c.3.3.8.3 1.1 0l-2.4-2.5-2.4-2.5z" fill="#FFF"/>
                    <path d="M10.5 17c-3-3-8 3-4.5 6.5l3.8-3.8c.3-.3.8-.3 1.1 0l3.8 3.8c3.5-3.5-1.5-9.5-4.2-6.5z" fill="#FFF"/>
                  </svg>
                </div>
                <h4 class="wallet-status-title">WalletConnect</h4>
                <p class="wallet-status-desc">Connect your secure mobile wallet (MetaMask, Trust, Ledger, etc.) by scanning the QR code.</p>
                <button class="btn btn-primary" @click="triggerWalletConnectConnection">Launch QR Modal</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RainbowKit Custom Theme Connected Wallet Details Modal -->
      <div v-if="isConnectedModalOpen" class="wallet-modal-overlay" @click.self="closeConnectedModal">
        <div class="wallet-modal-container" style="max-width: 440px;">
          <!-- Header -->
          <div class="wallet-modal-header">
            <span class="wallet-modal-title">Account</span>
            <button class="wallet-modal-close" @click="closeConnectedModal">×</button>
          </div>
          <!-- Body -->
          <div class="wallet-modal-detail" style="padding: 24px;">
            <!-- Avatar Placeholder & Profile details -->
            <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
              <div class="hippo-avatar" style="margin-bottom: 12px; background: var(--accent-teal-light); border-radius: 50%; padding: 8px; border: var(--border-width) solid var(--border-color); display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 100 100" width="48" height="48" style="fill: none; stroke: #1A1A1A; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round;">
                  <path d="M25 40 C 25 15, 75 15, 75 40 C 75 45, 80 50, 80 60 C 80 75, 20 75, 20 60 C 20 50, 25 45, 25 40 Z" fill="#9FA1C7" />
                  <ellipse cx="40" cy="38" rx="6" ry="9" fill="#FAF9F6" stroke="#1A1A1A" stroke-width="7" />
                  <ellipse cx="60" cy="38" rx="6" ry="9" fill="#FAF9F6" stroke="#1A1A1A" stroke-width="7" />
                  <circle cx="40" cy="40" r="3" fill="#1A1A1A" />
                  <circle cx="60" cy="40" r="3" fill="#1A1A1A" />
                </svg>
              </div>
              
              <div style="font-family: var(--font-display); font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                <span>{{ shortAddress(userAddress) }}</span>
                <button 
                  class="btn btn-secondary btn-small" 
                  style="padding: 4px 8px; font-size: 11px; margin: 0; min-height: auto;"
                  @click="copyAddressToClipboard"
                >
                  {{ copyStatusText }}
                </button>
              </div>
              
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Connected via {{ circleUserWallet ? 'Circle Web2 Wallet' : 'Browser Extension' }}</p>
            </div>

            <!-- Divider -->
            <div style="width: 100%; height: 2.5px; background: var(--border-color); margin: 20px 0;"></div>

            <!-- Balances Section -->
            <div style="width: 100%; text-align: left;">
              <span style="font-family: var(--font-display); font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">Balances</span>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-weight: 700; color: var(--text-primary);">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; background: var(--accent-teal); border-radius: 50%;"></span>
                  USDC Balance
                </span>
                <span>{{ userUsdcBalance }} USDC</span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-weight: 700; color: var(--text-primary);">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; background: var(--accent-green); border-radius: 50%;"></span>
                  EURC (Stablecoin)
                </span>
                <span>{{ userEurcBalance }} EURC</span>
              </div>
              
              <div v-if="circleUserWallet" style="margin-top: 12px; font-size: 12px; color: var(--accent-teal-dark); font-weight: 700; text-align: center; background: var(--accent-teal-light); padding: 6px; border: 1.5px solid var(--border-color); border-radius: var(--border-radius-sm);">
                ⚡ Gas fees are 100% sponsored by platform paymaster!
              </div>
            </div>

            <!-- Divider -->
            <div style="width: 100%; height: 2.5px; background: var(--border-color); margin: 20px 0;"></div>

            <!-- Action buttons -->
            <div style="display: flex; gap: 12px; width: 100%;">
              <button class="btn btn-secondary" style="flex: 1; padding: 10px;" @click="disconnectWallet">
                Disconnect
              </button>
              <a 
                :href="'https://testnet.arcscan.app/address/' + userAddress" 
                target="_blank" 
                class="btn btn-primary" 
                style="flex: 1; text-align: center; text-decoration: none; padding: 10px 0; font-size: 14px;"
              >
                Explorer ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Appeal Dispute Modal Overlay -->
      <div v-if="showAppealModal" class="wallet-modal-overlay" @click.self="showAppealModal = false">
        <div class="wallet-modal-container" style="max-width: 440px;">
          <div class="wallet-modal-header">
            <span class="wallet-modal-title">Appeal Dispute Ruling</span>
            <button class="wallet-modal-close" @click="showAppealModal = false">×</button>
          </div>
          <div class="wallet-modal-detail" style="padding: 24px; flex-direction: column; align-items: stretch;">
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;">
              Appealing will lock the required appeal fee in the USYC Yield Vault, reopen the dispute for voting by a wider juror pool, and reset previous tier votes.
            </p>
            <div style="background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 15px; margin-bottom: 24px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
                <span>Current Appeal Tier:</span>
                <strong>Tier {{ jobsList.find(j => j.id === appealJobId)?.dispute?.appealTier || 0 }}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
                <span>New Appeal Tier:</span>
                <strong>Tier {{ (jobsList.find(j => j.id === appealJobId)?.dispute?.appealTier || 0) + 1 }}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span>Required Appeal Fee:</span>
                <strong style="color: var(--accent-magenta);">
                  {{ (jobsList.find(j => j.id === appealJobId)?.dispute?.appealTier || 0) === 0 ? '100' : '200' }} USDC
                </strong>
              </div>
            </div>
            <div style="display: flex; gap: 12px; width: 100%;">
              <button class="btn btn-secondary" style="flex: 1;" @click="showAppealModal = false">Cancel</button>
              <button class="btn btn-accent" style="flex: 1;" @click="confirmAppeal" :disabled="isSubmitting">
                Approve & Appeal
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Universal Centralized Modal Overlay -->
      <div v-if="activeModal" class="wallet-modal-overlay" @click.self="handleBackdropClick" style="pointer-events: auto;">
        <div class="wallet-modal-container universal-modal-container" style="max-width: 440px;">
          <!-- Header -->
          <div class="wallet-modal-header universal-modal-header" style="padding: 16px 20px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="modal-variant-icon-badge" :class="activeModal.type">
                <!-- Confirm/Destructive Icon -->
                <svg v-if="activeModal.type === 'confirm'" viewBox="0 0 24 24" width="16" height="16" style="fill: none; stroke: currentColor; stroke-width: 3;">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
                </svg>
                <!-- Success Icon -->
                <svg v-else-if="activeModal.type === 'success'" viewBox="0 0 24 24" width="16" height="16" style="fill: none; stroke: currentColor; stroke-width: 3;">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <!-- Warning Icon -->
                <svg v-else-if="activeModal.type === 'warning'" viewBox="0 0 24 24" width="16" height="16" style="fill: none; stroke: currentColor; stroke-width: 3;">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke-linecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke-linecap="round"/>
                </svg>
                <!-- Error Icon -->
                <svg v-else-if="activeModal.type === 'error'" viewBox="0 0 24 24" width="16" height="16" style="fill: none; stroke: currentColor; stroke-width: 3;">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke-linecap="round"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke-linecap="round"/>
                </svg>
                <!-- Loading Icon -->
                <div v-else-if="activeModal.type === 'loading'" class="modal-mini-spinner"></div>
                <!-- Transaction Icon -->
                <svg v-else-if="activeModal.type === 'tx'" viewBox="0 0 24 24" width="16" height="16" style="fill: none; stroke: currentColor; stroke-width: 3;">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <span class="wallet-modal-title" style="font-size: 18px;">{{ activeModal.title }}</span>
            </div>
            <button v-if="!activeModal.preventClose" class="wallet-modal-close" @click="closeModal">×</button>
          </div>
          <!-- Body -->
          <div class="wallet-modal-detail" style="padding: 24px; text-align: left; align-items: flex-start; justify-content: flex-start; min-height: auto; width: 100%;">
            <p style="font-size: 14px; color: var(--text-primary); font-weight: 600; line-height: 1.5; margin: 0 0 16px 0; width: 100%;">
              {{ activeModal.message }}
            </p>

            <!-- Technical details panel -->
            <div v-if="activeModal.errorDetails" class="modal-details-pane" style="width: 100%; margin-bottom: 12px;">
              <span style="font-family: var(--font-display); font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--accent-magenta);">Technical details</span>
              <pre class="technical-pre">{{ activeModal.errorDetails }}</pre>
            </div>

            <!-- Transaction Hash -->
            <div v-if="activeModal.txHash && activeModal.type === 'tx'" style="display: flex; align-items: center; gap: 8px; width: 100%; margin-bottom: 12px; padding: 12px; background: var(--bg-primary); border: 2.5px solid var(--border-color); border-radius: var(--border-radius-sm);">
              <div class="modal-mini-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
              <span style="font-size: 12px; font-family: monospace; word-break: break-all; font-weight: 700;">Hash: {{ activeModal.txHash.slice(0, 14) + '...' + activeModal.txHash.slice(-10) }}</span>
            </div>

            <!-- Loading Spinner inside detail body -->
            <div v-if="activeModal.type === 'loading'" style="display: flex; justify-content: center; align-items: center; width: 100%; margin: 12px 0;">
              <div class="spinner-circle"></div>
            </div>

            <!-- Action buttons -->
            <div style="display: flex; gap: 12px; width: 100%; justify-content: flex-end; margin-top: 12px;">
              <button 
                v-if="activeModal.secondaryLabel && !activeModal.preventClose" 
                class="btn btn-secondary" 
                style="margin: 0; min-height: auto; padding: 8px 16px; font-size: 13px;"
                @click="handleCancel"
              >
                {{ activeModal.secondaryLabel }}
              </button>
              <button 
                v-if="activeModal.primaryLabel" 
                class="btn" 
                :class="[activeModal.isDestructive ? 'btn-danger' : 'btn-accent']" 
                style="margin: 0; min-height: auto; padding: 8px 20px; font-size: 13px;"
                @click="handleConfirm"
              >
                {{ activeModal.primaryLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CCTP Bridge Progress Modal -->
      <div v-if="isBridging" class="wallet-modal-overlay" style="pointer-events: auto;">
        <div class="wallet-modal-container universal-modal-container" style="max-width: 500px; pointer-events: auto;">
          <div class="wallet-modal-header universal-modal-header" style="padding: 16px 20px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="wallet-modal-title" style="font-size: 18px; display: flex; align-items: center; gap: 8px;">
                🔀 Cross-Chain CCTP Deposit
              </span>
            </div>
            <button v-if="bridgeStep === 5 || bridgeStep === -1" class="wallet-modal-close" @click="isBridging = false">×</button>
          </div>
          
          <div class="wallet-modal-detail" style="padding: 24px; text-align: left; align-items: flex-start; justify-content: flex-start; min-height: auto; width: 100%;">
            <p style="font-size: 14px; color: var(--text-primary); font-weight: 600; line-height: 1.5; margin: 0 0 16px 0;">
              Bridging stablecoin budget from {{ sourceChain ? sourceChain.replace('_', ' ') : '' }} to Arc Testnet. Follow the progress below:
            </p>

            <!-- Steps list -->
            <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; margin-bottom: 20px;">
              <!-- Step 1: Burn -->
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;"
                     :style="bridgeStep > 1 ? 'background: var(--accent-green); color: white; border-color: var(--accent-green);' : (bridgeStep === 1 ? 'background: var(--accent-orange); color: white; border-color: var(--accent-orange);' : 'background: var(--bg-secondary);')">
                  <span v-if="bridgeStep > 1">✓</span>
                  <span v-else>1</span>
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 14px;">Source Burn (CCTP)</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">Burn USDC on {{ sourceChain ? sourceChain.replace('_', ' ') : '' }}</div>
                  <div v-if="bridgeTxHashes.burn" style="font-size: 11px; font-family: monospace; word-break: break-all; margin-top: 4px; color: var(--accent-teal-dark);">
                    Tx: <a :href="getTxExplorerUrl(sourceChain, bridgeTxHashes.burn)" target="_blank" style="text-decoration: underline; font-weight: 700;">{{ bridgeTxHashes.burn.slice(0, 16) }}...</a>
                  </div>
                </div>
              </div>

              <!-- Step 2: Attestation -->
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;"
                     :style="bridgeStep > 2 ? 'background: var(--accent-green); color: white; border-color: var(--accent-green);' : (bridgeStep === 2 ? 'background: var(--accent-orange); color: white; border-color: var(--accent-orange);' : 'background: var(--bg-secondary);')">
                  <span v-if="bridgeStep > 2">✓</span>
                  <span v-else>2</span>
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 14px;">Attestation Generation</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">Retrieve Circle validation signature</div>
                  <div v-if="bridgeTxHashes.attestation" style="font-size: 11px; font-family: monospace; word-break: break-all; margin-top: 4px; color: var(--accent-purple);">
                    Attestation: Signature Secured
                  </div>
                </div>
              </div>

              <!-- Step 3: Arc Mint -->
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;"
                     :style="bridgeStep > 3 ? 'background: var(--accent-green); color: white; border-color: var(--accent-green);' : (bridgeStep === 3 ? 'background: var(--accent-orange); color: white; border-color: var(--accent-orange);' : 'background: var(--bg-secondary);')">
                  <span v-if="bridgeStep > 3">✓</span>
                  <span v-else>3</span>
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 14px;">Arc Mint (Gasless)</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">Mint USDC on Arc Testnet via paymaster</div>
                  <div v-if="bridgeTxHashes.mint" style="font-size: 11px; font-family: monospace; word-break: break-all; margin-top: 4px; color: var(--accent-teal-dark);">
                    Tx: <a :href="getTxExplorerUrl('Arc_Testnet', bridgeTxHashes.mint)" target="_blank" style="text-decoration: underline; font-weight: 700;">{{ bridgeTxHashes.mint.slice(0, 16) }}...</a>
                  </div>
                </div>
              </div>

              <!-- Step 4: Escrow Deposit -->
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;"
                     :style="bridgeStep > 4 ? 'background: var(--accent-green); color: white; border-color: var(--accent-green);' : (bridgeStep === 4 ? 'background: var(--accent-orange); color: white; border-color: var(--accent-orange);' : 'background: var(--bg-secondary);')">
                  <span v-if="bridgeStep > 4">✓</span>
                  <span v-else>4</span>
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 14px;">Escrow Deposit & Create Job</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">Fund smart contract escrow wallet</div>
                  <div v-if="bridgeTxHashes.escrow" style="font-size: 11px; font-family: monospace; word-break: break-all; margin-top: 4px; color: var(--accent-teal-dark);">
                    Tx: <a :href="getTxExplorerUrl('Arc_Testnet', bridgeTxHashes.escrow)" target="_blank" style="text-decoration: underline; font-weight: 700;">{{ bridgeTxHashes.escrow.slice(0, 16) }}...</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Current Status Box -->
            <div style="width: 100%; padding: 12px; background: var(--bg-secondary); border: 2.5px solid var(--border-color); border-radius: var(--border-radius-sm); margin-bottom: 16px;">
              <span style="font-size: 11px; font-family: monospace; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Status</span>
              <p style="font-size: 13px; font-weight: 600; margin: 4px 0 0 0; color: var(--text-primary);">
                {{ bridgeStatusText }}
              </p>
            </div>

            <!-- Action buttons -->
            <div style="display: flex; gap: 12px; width: 100%; justify-content: flex-end;">
              <button v-if="bridgeStep === 5 || bridgeStep === -1" class="btn btn-accent" style="margin: 0;" @click="isBridging = false">
                {{ bridgeStep === 5 ? 'Done' : 'Close' }}
              </button>
              <div v-else class="modal-mini-spinner" style="width: 20px; height: 20px;"></div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';

// --- CIRCLE CORS INTERCEPTOR ---
// Intercept fetch calls to strip X-User-Agent / x-user-agent header which is blocked by Circle API's CORS policy
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.href;
    } else if (input && typeof input === 'object' && 'url' in input) {
      url = input.url;
    }

    if (url.includes('api.circle.com') || url.includes('api-sandbox.circle.com')) {
      console.log('[Fetch Interceptor] Intercepting request to Circle API:', url);
      if (init) {
        if (init.headers) {
          if (init.headers instanceof Headers) {
            if (init.headers.has('x-user-agent')) {
              init.headers.delete('x-user-agent');
              console.log('[Fetch Interceptor] Removed x-user-agent from Headers object');
            }
          } else if (Array.isArray(init.headers)) {
            const index = init.headers.findIndex(h => h[0].toLowerCase() === 'x-user-agent');
            if (index !== -1) {
              init.headers.splice(index, 1);
              console.log('[Fetch Interceptor] Removed x-user-agent from Headers array');
            }
          } else if (typeof init.headers === 'object') {
            for (const key of Object.keys(init.headers)) {
              if (key.toLowerCase() === 'x-user-agent') {
                delete init.headers[key];
                console.log(`[Fetch Interceptor] Removed ${key} from Headers object`);
              }
            }
          }
        }
      } else if (input && typeof input === 'object' && 'headers' in input) {
        const headers = input.headers;
        if (headers instanceof Headers) {
          if (headers.has('x-user-agent')) {
            headers.delete('x-user-agent');
            console.log('[Fetch Interceptor] Removed x-user-agent from Request headers');
          }
        } else if (typeof headers === 'object') {
          for (const key of Object.keys(headers)) {
            if (key.toLowerCase() === 'x-user-agent') {
              delete headers[key];
              console.log(`[Fetch Interceptor] Removed ${key} from Request headers`);
            }
          }
        }
      }
    }
    return originalFetch.apply(this, arguments);
  };
}

import { createPublicClient, createWalletClient, http, custom, parseUnits, formatUnits } from 'viem';
import { 
  GIGMARKET_ESCROW_ABI, 
  AGENT_ESCROW_8183_ABI,
  ERC20_ABI, 
  USDC_TOKEN_ADDRESS, 
  EURC_TOKEN_ADDRESS,
  STABLE_FX_ROUTER_ADDRESS 
} from './utils/contract';
import { activeModal, closeModal, modals, handleError } from './utils/modals';
import {
  generateViewerKey,
  encryptJobDetails,
  decryptJobDetails,
  generateBudgetProof
} from './utils/crypto-privacy';
import {
  circleUserWallet,
  circleSessionToken,
  circleEncryptionKey,
  circleAppId,
  circleUserId,
  isSimulationMode,
  activeWalletProvider,
  initCircleSdk,
  executeChallenge,
  checkPersistedWallet,
  persistWalletState,
  clearWalletState
} from './utils/circle-wallet';
import {
  sponsoredTxCount,
  sponsoredGasSaved,
  executeSponsoredTransaction
} from './utils/modular-wallet';
import {
  initiateBurn,
  pollBridgeAttestation,
  mintOnArc
} from './utils/bridge-kit';

const userAddress = ref('');

function getProvider() {
  return activeWalletProvider.value || (typeof window !== 'undefined' ? window.ethereum : null);
}

const circleEmail = ref('');
const showPinScreen = ref(false);
const pinCode = ref('');
const activeChallengeId = ref('');
const tempSessionData = ref(null);
const isInitializingWallet = ref(false);

const currentTab = ref('client');
const freelancerSubTab = ref('browse');
const clientSubTab = ref('gigs');

// Agentic / ERC-8183 state variables
const newAgentJob = ref({
  provider: '', // Default simulation provider or backend wallet
  evaluator: '', // Evaluator/Oracle wallet address
  amount: 50,
  expiryDays: 2,
  codeUrl: 'https://raw.githubusercontent.com/owner/repo/main/code.js',
  repoUrl: 'github.com/chaayadev1995/gig-market'
});

const activeAgentJobId = ref(null);
const agentNegotiationLogs = ref([
  { time: new Date().toLocaleTimeString(), text: 'System initialized. Ready for ERC-8183 Agentic Escrow flows.' }
]);
const oracleVerificationLogs = ref([]);
const isProcessingAgentJob = ref(false);
const isVerifyingDeliverable = ref(false);

const agenticJobs = computed(() => {
  return jobsList.value.filter(j => j.isAgentic || j.escrowType === 'ERC8183');
});

// Creates a new Agentic job using AgentEscrow8183 contract
async function createAgentJob() {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your EVM wallet first to compile and fund new agentic jobs.');
    return;
  }

  isProcessingAgentJob.value = true;
  try {
    const contractAddress = systemStatus.value.agentEscrowAddress;
    if (!contractAddress) {
      throw new Error('AgentEscrow8183 address is not configured on the server status.');
    }

    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    });

    const usdcUnits = parseUnits(newAgentJob.value.amount.toString(), 6);
    const expiryTimestamp = Math.floor(Date.now() / 1000) + (newAgentJob.value.expiryDays * 24 * 60 * 60);

    let jobId = 0;
    let createHash = '';

    if (circleUserWallet.value) {
      // 1. Approve USDC spend
      modals.loading('Approving USDC', 'Approving USDC budget allocation (Gasless Sponsored Transaction)...');
      await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: USDC_TOKEN_ADDRESS,
        abiFunctionSignature: 'approve(address,uint256)',
        abiParameters: [contractAddress, usdcUnits.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });

      // 2. Create Job
      modals.loading('Creating Job', 'Creating agentic escrow job (Gasless Sponsored Transaction)...');
      const createRes = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: contractAddress,
        abiFunctionSignature: 'createJob(address,address,address,uint256,uint256)',
        abiParameters: [
          newAgentJob.value.provider || systemStatus.value.walletAddress,
          newAgentJob.value.evaluator || systemStatus.value.walletAddress,
          USDC_TOKEN_ADDRESS,
          usdcUnits.toString(),
          expiryTimestamp.toString()
        ],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
      createHash = createRes.txHash || 'Pending';

      // Fetch jobCount
      if (!isSimulationMode.value) {
        const jobCount = await publicClient.readContract({
          address: contractAddress,
          abi: AGENT_ESCROW_8183_ABI,
          functionName: 'jobCount',
        });
        jobId = Number(jobCount);
      } else {
        jobId = jobsList.value.length + 1;
      }

      // 3. Fund Job
      modals.loading('Funding Job', 'Securing budget deposit in agentic escrow (Gasless Sponsored Transaction)...');
      const fundRes = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: contractAddress,
        abiFunctionSignature: 'fundJob(uint256)',
        abiParameters: [jobId.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
    } else {
      const web3Provider = getProvider();
      if (!web3Provider) {
        throw new Error('No web3 provider found (Metamask required for client transactions)');
      }

      const walletClient = createWalletClient({
        account: userAddress.value,
        chain: arcTestnet,
        transport: custom(web3Provider),
      });

      // 1. Approve USDC spend
      modals.info('Approving USDC', 'Please sign the USDC approval transaction in your browser wallet.');
      
      const approveHash = await walletClient.writeContract({
        address: USDC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddress, usdcUnits],
      });
      
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      
      // 2. Create Job
      modals.info('Creating Job', 'Please confirm the job creation transaction.');
      
      createHash = await walletClient.writeContract({
        address: contractAddress,
        abi: AGENT_ESCROW_8183_ABI,
        functionName: 'createJob',
        args: [
          newAgentJob.value.provider || systemStatus.value.walletAddress,
          newAgentJob.value.evaluator || systemStatus.value.walletAddress,
          USDC_TOKEN_ADDRESS,
          usdcUnits,
          BigInt(expiryTimestamp)
        ],
      });

      const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
      console.log('Job created receipt:', createReceipt);

      // Fetch jobCount
      const jobCount = await publicClient.readContract({
        address: contractAddress,
        abi: AGENT_ESCROW_8183_ABI,
        functionName: 'jobCount',
      });
      jobId = Number(jobCount);

      // 3. Fund Job
      modals.info('Funding Job', 'Confirm funding the escrow budget.');

      const fundHash = await walletClient.writeContract({
        address: contractAddress,
        abi: AGENT_ESCROW_8183_ABI,
        functionName: 'fundJob',
        args: [BigInt(jobId)],
      });
      await publicClient.waitForTransactionReceipt({ hash: fundHash });
    }

    // 4. Save to local DB
    const newJobDb = {
      id: jobId.toString(),
      title: `AI Autonomous Task for ${newAgentJob.value.repoUrl}`,
      description: `Staked autonomous execution with deliverable verification on ${newAgentJob.value.repoUrl}`,
      budget: newAgentJob.value.amount,
      repoUrl: newAgentJob.value.repoUrl,
      codeUrl: newAgentJob.value.codeUrl,
      isAgentic: true,
      escrowType: 'ERC8183',
      status: 'Funded',
      freelancer: newAgentJob.value.provider || systemStatus.value.walletAddress,
      client: userAddress.value
    };

    await $fetch('/api/jobs', {
      method: 'POST',
      body: newJobDb,
    });

    agentNegotiationLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      text: `[Client] Created & funded job #${jobId} targeting AI Agent. Escrow is locked.`
    });

    modals.success('Agent Job Created', `Successfully funded and launched ERC-8183 job #${jobId}!`);
    await loadJobsFromLocalDb();
  } catch (error) {
    console.error('Error creating agentic job:', error);
    modals.error('Job Creation Failed', error.message || error);
  } finally {
    isProcessingAgentJob.value = false;
  }
}

// Simulates the agent joining, signing commitment, and staking 10% collateral
async function triggerAgentCommit(jobId) {
  isProcessingAgentJob.value = true;
  try {
    agentNegotiationLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      text: `[Agent] Detected job #${jobId}. Preparing cryptographic commitment...`
    });

    const res = await $fetch('/api/agent-action', {
      method: 'POST',
      body: { jobId, action: 'commit' }
    });

    if (res.error) throw new Error(res.error);

    agentNegotiationLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      text: `[Agent] Successfully signed commitment (Sig: ${res.signature.slice(0, 16)}...) and staked 10% USDC collateral. Tx: ${res.txHash.slice(0, 16)}...`
    });

    modals.success('Agent Committed', `AI Agent committed to Job #${jobId} and staked collateral.`);
    await loadJobsFromLocalDb();
  } catch (error) {
    console.error('Agent commitment failed:', error);
    modals.error('Agent Commitment Failed', error.message || error);
  } finally {
    isProcessingAgentJob.value = false;
  }
}

// Simulates the agent submitting completed work deliverable
async function triggerAgentSubmit(jobId) {
  isProcessingAgentJob.value = true;
  try {
    agentNegotiationLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      text: `[Agent] Submitting completed deliverables...`
    });

    const deliverableHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const res = await $fetch('/api/agent-action', {
      method: 'POST',
      body: { 
        jobId, 
        action: 'submit',
        deliverableHash
      }
    });

    if (res.error) throw new Error(res.error);

    agentNegotiationLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      text: `[Agent] Deliverable hash submitted: ${res.deliverableHash.slice(0, 16)}... on-chain. Tx: ${res.txHash.slice(0, 16)}...`
    });

    modals.success('Deliverable Submitted', `AI Agent submitted deliverables for Job #${jobId}.`);
    await loadJobsFromLocalDb();
  } catch (error) {
    console.error('Agent work submission failed:', error);
    modals.error('Submission Failed', error.message || error);
  } finally {
    isProcessingAgentJob.value = false;
  }
}

// Triggers testing suite oracle verification
async function triggerOracleVerification(job) {
  isVerifyingDeliverable.value = true;
  oracleVerificationLogs.value = [];
  try {
    agentNegotiationLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      text: `[Oracle] Launching automated unit tests for job #${job.id}...`
    });

    const res = await $fetch('/api/verify-deliverable', {
      method: 'POST',
      body: {
        jobId: job.id,
        deliverableHash: job.deliverableHash || '0x' + '12'.repeat(32),
        codeUrl: job.codeUrl || newAgentJob.value.codeUrl
      }
    });

    if (res.error) throw new Error(res.error);

    oracleVerificationLogs.value = res.logs || [];
    
    agentNegotiationLogs.value.unshift({
      time: new Date().toLocaleTimeString(),
      text: `[Oracle] Verification complete. Outcome: ${res.testSuitePassed ? 'PASS' : 'FAIL'}. Payout released. Tx: ${res.txHash.slice(0, 16)}...`
    });

    modals.success('Verification Complete', `Oracle evaluated job #${job.id}: Result ${res.targetStatus}.`);
    await loadJobsFromLocalDb();
  } catch (error) {
    console.error('Oracle verification failed:', error);
    modals.error('Verification Failed', error.message || error);
  } finally {
    isVerifyingDeliverable.value = false;
  }
}

const totalFreelancerYieldDistributed = computed(() => {
  return jobsList.value
    .filter(j => j.freelancer?.toLowerCase() === userAddress.value?.toLowerCase())
    .reduce((sum, j) => sum + (j.yieldDistributed || 0) * 0.5, 0);
});

const totalFreelancerYieldAccruing = computed(() => {
  return jobsList.value
    .filter(j => j.freelancer?.toLowerCase() === userAddress.value?.toLowerCase() && (j.status === 'Active' || j.status === 'Disputed'))
    .reduce((sum, j) => sum + (j.liveAccruedYield || 0) * 0.5, 0);
});

const totalClientYieldReceived = computed(() => {
  return jobsList.value
    .filter(j => j.client?.toLowerCase() === userAddress.value?.toLowerCase())
    .reduce((sum, j) => sum + (j.yieldDistributed || 0) * 0.3, 0);
});

const totalClientYieldAccruing = computed(() => {
  return jobsList.value
    .filter(j => j.client?.toLowerCase() === userAddress.value?.toLowerCase() && (j.status === 'Active' || j.status === 'Disputed'))
    .reduce((sum, j) => sum + (j.liveAccruedYield || 0) * 0.3, 0);
});

const totalPlatformYieldRevenue = computed(() => {
  return jobsList.value.reduce((sum, j) => sum + (j.yieldDistributed || 0) * 0.2, 0);
});

// Phase 9: Gateway Nanopayments & x402 state variables
const gatewayDepositAmount = ref(10.0);
const gatewayBalance = ref(0.0);
const accumulatedMicropayments = ref(0.0);
const realtimeStreamingEarnings = ref(0.0);
const isStreamingEarningsActive = ref(false);
const isProcessingGatewayDeposit = ref(false);
const isProcessingGatewayWithdrawal = ref(false);
const isSimulatingGitAction = ref(false);

const x402PlaygroundState = ref({
  linesOfCode: 20,
  actionType: 'push_commit',
  description: 'Updated landing page visuals with Outfit font and premium gradients',
  freelancerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' // Account 2 or simulated expert
});

const x402PlaygroundLogs = ref([
  { time: new Date().toLocaleTimeString(), text: 'x402 API playground ready. Connect wallet to sign challenge handshakes.' }
]);

function addPlaygroundLog(text) {
  x402PlaygroundLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    text
  });
}

// Watch userAddress to refresh profiles
watch(userAddress, (newVal) => {
  if (newVal) {
    refreshGatewayProfile();
  } else {
    gatewayBalance.value = 0.0;
    accumulatedMicropayments.value = 0.0;
  }
});

async function refreshGatewayProfile() {
  if (!userAddress.value) return;
  try {
    const res = await $fetch('/api/nanopay-settle', {
      method: 'POST',
      body: {
        action: 'get_profile',
        walletAddress: userAddress.value
      }
    });
    if (res.success && res.profile) {
      gatewayBalance.value = res.profile.gatewayBalance || 0.0;
      accumulatedMicropayments.value = res.profile.accumulatedMicropayments || 0.0;
      if (!isStreamingEarningsActive.value) {
        realtimeStreamingEarnings.value = res.profile.accumulatedMicropayments || 0.0;
      }
    }
  } catch (error) {
    console.error('Failed to load gateway profile:', error);
  }
}

async function depositToGateway() {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your wallet first.');
    return;
  }
  isProcessingGatewayDeposit.value = true;
  try {
    const recipient = systemStatus.value?.walletAddress;
    if (!recipient) {
      throw new Error('System platform wallet address not loaded.');
    }

    const usdcUnits = parseUnits(gatewayDepositAmount.value.toString(), 6);
    let txHash = '';
    let confirmed = false;
    let receipt = null;

    if (circleUserWallet.value) {
      closeModal();
      modals.loading('Depositing to Gateway', 'Securing deposit in gateway (Gasless Sponsored Transaction)...');
      const res = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: USDC_TOKEN_ADDRESS,
        abiFunctionSignature: 'transfer(address,uint256)',
        abiParameters: [recipient, usdcUnits.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
      txHash = res.txHash;
      if (isSimulationMode.value) {
        confirmed = true;
        receipt = { status: 'success' };
      }
    } else if (!isSimulationMode.value) {
      const web3Provider = getProvider();
      if (!web3Provider) {
        throw new Error('No compatible EIP-1193 wallet provider found. Please connect your browser wallet.');
      }

      modals.loading('Depositing to Gateway', 'Please sign the USDC transfer transaction in your wallet...');

      const walletClient = createWalletClient({
        account: userAddress.value,
        chain: arcTestnet,
        transport: custom(web3Provider),
      });

      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http('https://rpc.testnet.arc.network'),
      });

      let gasOptions = {};
      try {
        const fees = await publicClient.estimateFeesPerGas();
        if (fees && fees.maxFeePerGas) {
          // Multiply maxFeePerGas and maxPriorityFeePerGas by 1.5x to guarantee instant processing
          gasOptions.maxFeePerGas = (fees.maxFeePerGas * 15n) / 10n;
          if (fees.maxPriorityFeePerGas) {
            gasOptions.maxPriorityFeePerGas = (fees.maxPriorityFeePerGas * 15n) / 10n;
          }
        }
      } catch (gasErr) {
        console.warn('Failed to estimate gas fees, using defaults:', gasErr);
      }

      try {
        const estimatedGas = await publicClient.estimateContractGas({
          address: USDC_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [recipient, usdcUnits],
          account: userAddress.value,
        });
        // Add 20% buffer to gas limit
        gasOptions.gas = (estimatedGas * 12n) / 10n;
      } catch (limitErr) {
        console.warn('Failed to estimate gas limit, using defaults:', limitErr);
      }

      txHash = await walletClient.writeContract({
        address: USDC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient, usdcUnits],
        ...gasOptions,
      });
    }

    if (txHash && !confirmed) {
      closeModal();
      modals.txPending(txHash, 'Waiting for USDC deposit confirmation on-chain...');

      const publicClient = createPublicClient({
        chain: arcTestnet,
        transport: http('https://rpc.testnet.arc.network'),
      });

      // Poll every 2 seconds for a max of 30 times (60 seconds total)
      for (let i = 0; i < 30; i++) {
        try {
          receipt = await publicClient.getTransactionReceipt({ hash: txHash });
          if (receipt) {
            confirmed = true;
            break;
          }
        } catch (e) {
          // ignore indexing errors
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (!confirmed || !receipt) {
        throw new Error('Transaction confirmation timed out. Please check if your balance was deducted and refresh.');
      }
    }

    const res = await $fetch('/api/nanopay-settle', {
      method: 'POST',
      body: {
        action: 'deposit',
        walletAddress: userAddress.value,
        amount: gatewayDepositAmount.value
      }
    });
    
    closeModal();
    if (res.success) {
      modals.success('Deposit Successful', res.message);
      await refreshGatewayProfile();
      await fetchUserBlockchainDetails();
    } else {
      modals.error('Deposit Failed', res.message || 'Failed to settle deposit.');
    }
  } catch (error) {
    closeModal();
    modals.error('Deposit Failed', error.data?.error || error.message);
  } finally {
    isProcessingGatewayDeposit.value = false;
  }
}

async function withdrawMicropayments() {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your wallet first.');
    return;
  }
  isProcessingGatewayWithdrawal.value = true;
  try {
    const res = await $fetch('/api/nanopay-settle', {
      method: 'POST',
      body: {
        action: 'withdraw',
        walletAddress: userAddress.value
      }
    });
    if (res.success) {
      modals.success('Withdrawal Complete', `${res.message}\nTx Hash: ${res.txHash}`);
      await refreshGatewayProfile();
      await fetchUserBlockchainDetails();
    }
  } catch (error) {
    modals.error('Withdrawal Failed', error.data?.error || error.message);
  } finally {
    isProcessingGatewayWithdrawal.value = false;
  }
}

let streamingInterval = null;
function startStreamingVisualizer() {
  if (streamingInterval) clearInterval(streamingInterval);
  isStreamingEarningsActive.value = true;
  
  // Set real-time streaming to accumulated micro-payments and stream up
  realtimeStreamingEarnings.value = accumulatedMicropayments.value;
  
  streamingInterval = setInterval(() => {
    // Increment by a tiny sub-cent decimal (e.g. $0.0001 per tick)
    realtimeStreamingEarnings.value = parseFloat((realtimeStreamingEarnings.value + 0.0001).toFixed(6));
  }, 100);

  // Stop after 8 seconds
  setTimeout(() => {
    if (streamingInterval) {
      clearInterval(streamingInterval);
      streamingInterval = null;
    }
    isStreamingEarningsActive.value = false;
    refreshGatewayProfile();
  }, 8000);
}

async function runGitActionSimulation() {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your wallet first.');
    return;
  }
  
  isSimulatingGitAction.value = true;
  x402PlaygroundLogs.value = []; // Reset logs
  addPlaygroundLog('🚀 Initiating Git push action request...');
  
  try {
    // 1. Initial Request (expected to receive 402 Challenge)
    let response;
    let errorResponse = null;
    
    try {
      response = await $fetch.raw('/api/git-action', {
        method: 'POST',
        body: {
          linesOfCode: x402PlaygroundState.value.linesOfCode,
          actionType: x402PlaygroundState.value.actionType,
          description: x402PlaygroundState.value.description
        },
        query: {
          freelancerAddress: x402PlaygroundState.value.freelancerAddress
        }
      });
    } catch (fetchErr) {
      if (fetchErr.status === 402) {
        errorResponse = fetchErr;
      } else {
        throw fetchErr;
      }
    }
    
    if (!errorResponse) {
      addPlaygroundLog('⚠️ Unexpected HTTP 200: Handshake was already pre-paid.');
      isSimulatingGitAction.value = false;
      return;
    }
    
    // 2. Parse 402 Headers
    const headers = errorResponse.response?.headers;
    if (!headers) {
      throw new Error('No response headers found in HTTP 402 response.');
    }
    const getHeader = (name) => {
      if (typeof headers.get === 'function') {
        return headers.get(name);
      }
      return headers[name] || headers[name.toLowerCase()];
    };
    const challenge = getHeader('x-402-challenge');
    const price = getHeader('x-402-price') || '0.05';
    const recipient = getHeader('x-402-recipient');
    const token = getHeader('x-402-token');
    
    addPlaygroundLog(`🛑 Received HTTP 402: Payment Required.`);
    addPlaygroundLog(`🏷️ Billed Price: ${price} USDC`);
    addPlaygroundLog(`🔗 Challenge: ${challenge}`);
    addPlaygroundLog(`✍️ Requesting cryptographic signature from client wallet...`);
    
    // 3. Cryptographically Sign challenge
    let signature;
    if (circleUserWallet.value) {
      addPlaygroundLog(`[CircleUCW] Generating simulated signature for User-Controlled Smart Wallet...`);
      signature = '0x_mock_sig_' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      const web3Provider = getProvider();
      if (!web3Provider) {
        throw new Error('No compatible EIP-1193 wallet provider found for signing.');
      }
      
      const walletClient = createWalletClient({
        account: userAddress.value,
        chain: arcTestnet,
        transport: custom(web3Provider),
      });
      
      signature = await walletClient.signMessage({
        message: challenge
      });
    }
    
    addPlaygroundLog(`🔑 Signature generated: ${signature.slice(0, 24)}...`);
    addPlaygroundLog(`🔄 Resubmitting request with payment authorization headers...`);
    
    // 4. Submit Resubmission with x402 payment headers
    const successRes = await $fetch('/api/git-action', {
      method: 'POST',
      headers: {
        'x-402-payment-signature': signature,
        'x-402-client-address': userAddress.value,
        'x-402-freelancer-address': x402PlaygroundState.value.freelancerAddress,
        'x-402-challenge': challenge,
        'x-402-amount': price
      },
      body: {
        linesOfCode: x402PlaygroundState.value.linesOfCode,
        actionType: x402PlaygroundState.value.actionType,
        description: x402PlaygroundState.value.description
      }
    });
    
    if (successRes.success) {
      addPlaygroundLog(`🎉 Success! HTTP 200: Billing Authorized.`);
      addPlaygroundLog(`💰 Billed: ${successRes.billing.billedAmount} USDC`);
      addPlaygroundLog(`📉 Client Remaining Gateway Balance: ${successRes.billing.clientRemainingGatewayBalance} USDC`);
      addPlaygroundLog(`📈 Freelancer Accumulated Earnings: ${successRes.billing.freelancerAccumulatedEarnings} USDC`);
      
      gatewayBalance.value = successRes.billing.clientRemainingGatewayBalance;
      accumulatedMicropayments.value = successRes.billing.freelancerAccumulatedEarnings;
      
      // Trigger live streaming animation visual wow
      startStreamingVisualizer();
      modals.success('Nanopayment Success', `Authorized micropayment of ${price} USDC for Git Push action.`);
    }
  } catch (err) {
    console.error('x402 pipeline simulation error:', err);
    addPlaygroundLog(`❌ Error: ${err.data?.message || err.message}`);
    modals.error('x402 Pipeline Error', err.data?.message || err.message);
  } finally {
    isSimulatingGitAction.value = false;
  }
}

// MVP Startup Page Architecture
const activeSection = ref('home');
const selectedDoc = ref('intro');
const faqSearch = ref('');
const faqOpen = ref({});
const contactForm = ref({
  email: '',
  subject: '',
  category: 'support',
  message: ''
});
const isContactSubmitted = ref(false);

const faqs = [
  {
    q: 'What is GigMarket?',
    a: 'GigMarket is a decentralized freelance marketplace integrating automated USDC stablecoin escrows on Arc Testnet. The platform is designed to eliminate payment defaults for freelancers and delivery delays for clients via double-sided escrow staking conditions.'
  },
  {
    q: 'How does the Git-driven payout work?',
    a: 'Each milestone is linked to a specific GitHub repository and Pull Request. When the freelancer completes the codebase and the client merges the PR on GitHub, our webhook detects the merge event and triggers a server-side release. Utilizing Circle\'s Developer-Controlled Wallets, an on-chain transaction executes the payout directly to the freelancer\'s wallet without manual intervention.'
  },
  {
    q: 'What is the Freelancer Stake feature?',
    a: 'To prevent freelancers from claiming gigs and abandoning them, the platform requires freelancers to stake a small USDC deposit (up to 10% of the milestone budget) as collateral. This stake is refunded along with the milestone payment immediately upon successful milestone completion.'
  },
  {
    q: 'How does the Reputation Score affect my required stake?',
    a: 'To incentivize professional alignment, GigMarket utilizes an on-chain Reputation Score:\n- Under 3 points (Standard): Requires a 10% collateral stake.\n- 3 to 4 points (Experienced): Reduces required stake to 5%.\n- 5 points or higher (Elite): Entirely waives the stake requirement (0%).'
  },
  {
    q: 'How does the Jury Board arbitrate disputes?',
    a: 'In case of disagreement, either party can click "Raise Dispute" to lock the milestone funds. Community jurors examine the repository PR, deliverable code, and chat logs, then vote on three outcomes: Client Wins, Freelancer Wins, or Split 50/50. Once the voting threshold is met, the smart contract automatically resolves and distributes the funds according to the majority decision.'
  },
  {
    q: 'What is special about the Arc Testnet in this project?',
    a: 'Arc Testnet uses USDC directly as its native gas token. This means users do not need to hold a separate volatile blockchain token (like ETH or MATIC) just to pay for network transactions. All interactions are paid natively in USDC with sub-second finality.'
  }
];

const filteredFaqs = computed(() => {
  if (!faqSearch.value) return faqs;
  return faqs.filter(f => 
    f.q.toLowerCase().includes(faqSearch.value.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearch.value.toLowerCase())
  );
});

function toggleFaq(idx) {
  faqOpen.value[idx] = !faqOpen.value[idx];
}

function submitContact() {
  isContactSubmitted.value = true;
  modals.success(
    'Message Transmitted!',
    `Thank you for reaching out! We have registered your ${contactForm.value.category} ticket. Our support agents will contact you shortly.`
  );
  contactForm.value = {
    email: '',
    subject: '',
    category: 'support',
    message: ''
  };
}

const viewerKeysInput = ref({});

async function decryptJob(job) {
  const key = viewerKeysInput.value[job.id];
  if (!key || !key.startsWith('0x') || key.length !== 66) {
    modals.warning('Invalid Key', 'Please enter a valid 256-bit hex viewer key starting with 0x.');
    return;
  }
  try {
    const decrypted = await decryptJobDetails(job.encryptedDetails, key);
    job.decrypted = decrypted;
    job.title = decrypted.title;
    job.description = decrypted.description;
    job.repoUrl = decrypted.repoUrl;
    job.budget = decrypted.budget;
    job.milestones = decrypted.milestones;
    
    // Save to local storage
    const storedKeys = JSON.parse(localStorage.getItem('viewer_keys') || '{}');
    storedKeys[job.id] = key;
    localStorage.setItem('viewer_keys', JSON.stringify(storedKeys));

    modals.success('Decryption Successful', 'Job details decrypted successfully using the provided Viewer Key!');
  } catch (e) {
    console.error('Decryption failed:', e);
    modals.error('Decryption Failed', 'Invalid viewer key or corrupted data.');
  }
}

// States
const freelancerReputation = ref(0);
const userIsJuror = ref(false);
const jurorReputationScore = ref(100);
const jurorActiveStake = ref(0);
const jurorHistory = ref([]);
const platformOwner = ref('');
const showAppealModal = ref(false);
const appealJobId = ref(null);
const systemStatus = ref({});
const isSystemLoading = ref(true);
const loadingJobs = ref(true);
const isSubmitting = ref(false);

// Cross-chain CCTP Bridge States
const fundingMethod = ref('arc');
const sourceChain = ref('Base_Sepolia');
const isBridging = ref(false);
const bridgeStep = ref(0);
const bridgeStatusText = ref('');
const bridgeTxHashes = ref({ burn: '', mint: '', attestation: '', escrow: '' });

// StableFX State Variables
const liveQuoteRate = ref(0.92);
const quoteExpiresInSeconds = ref(0);
const isRefreshingQuote = ref(false);
let quoteTimer = null;

// Feature: Multi-Party Splits
const enableSplits = ref(false);
const splitRecipients = ref([{ address: '', percentage: 100 }]);

function addSplitRecipient() {
  splitRecipients.value.push({ address: '', percentage: 0 });
}

function removeSplitRecipient(index) {
  if (splitRecipients.value.length > 1) {
    splitRecipients.value.splice(index, 1);
  }
}

// Join job split states (per jobId)
const joinSplitsConfig = ref({});

function getJoinSplitConfig(jobId) {
  if (!joinSplitsConfig.value[jobId]) {
    joinSplitsConfig.value[jobId] = {
      enable: false,
      recipients: [{ address: '', percentage: 100 }]
    };
  }
  return joinSplitsConfig.value[jobId];
}

function addJoinSplitRecipient(jobId) {
  const config = getJoinSplitConfig(jobId);
  config.recipients.push({ address: '', percentage: 0 });
}

function removeJoinSplitRecipient(jobId, index) {
  const config = getJoinSplitConfig(jobId);
  if (config.recipients.length > 1) {
    config.recipients.splice(index, 1);
  }
}

function validateSplits(members) {
  let total = 0;
  for (const m of members) {
    if (!m.address || !m.address.startsWith('0x') || m.address.length !== 42) {
      return { valid: false, error: `Invalid wallet address: ${m.address || 'empty'}` };
    }
    const pct = parseInt(m.percentage);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      return { valid: false, error: 'Percentages must be positive integers between 1 and 100.' };
    }
    total += pct;
  }
  if (total !== 100) {
    return { valid: false, error: `Total percentage must equal exactly 100% (currently ${total}%).` };
  }
  return { valid: true };
}

function getTxExplorerUrl(chainKey, hash) {
  if (!hash || hash.startsWith('mock_')) return '#';
  if (chainKey === 'Base_Sepolia') return `https://sepolia.basescan.org/tx/${hash}`;
  if (chainKey === 'Ethereum_Sepolia') return `https://sepolia.etherscan.io/tx/${hash}`;
  if (chainKey === 'Arbitrum_Sepolia') return `https://sepolia-rollup.arbitrum.io/tx/${hash}`;
  return `https://testnet.arcscan.app/tx/${hash}`;
}

// RainbowKit custom theme connection states
const isWalletModalOpen = ref(false);
const selectedWallet = ref('metamask');
const isConnectingWallet = ref(false);
const walletConnectionError = ref('');

// RainbowKit custom theme connected wallet states
const isConnectedModalOpen = ref(false);
const userUsdcBalance = ref('0.00');
const userEurcBalance = ref('0.00');
const copyStatusText = ref('Copy');

function openWalletModal() {
  isWalletModalOpen.value = true;
  selectedWallet.value = 'circle';
  walletConnectionError.value = '';
  isConnectingWallet.value = false;
  showPinScreen.value = false;
}

function closeWalletModal() {
  isWalletModalOpen.value = false;
}

function selectWallet(walletKey) {
  selectedWallet.value = walletKey;
  walletConnectionError.value = '';
  isConnectingWallet.value = false;
}

async function handleCircleLogin() {
  if (!circleEmail.value || !circleEmail.value.includes('@')) {
    walletConnectionError.value = 'Please input a valid email address.';
    return;
  }
  isConnectingWallet.value = true;
  walletConnectionError.value = '';
  try {
    console.log('[CircleUCW] Authenticating user:', circleEmail.value);
    const response = await $fetch('/api/circle-wallet-session', {
      method: 'POST',
      body: { userId: circleEmail.value }
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to authenticate user');
    }

    tempSessionData.value = response;

    if (response.status === 'INITIALIZING') {
      activeChallengeId.value = response.challengeId;
      showPinScreen.value = true;
      await initCircleSdk(response.appId, response.userToken, response.encryptionKey);
    } else if (response.status === 'ACTIVE') {
      const wallet = response.wallets[0];
      persistWalletState(
        wallet, 
        response.userToken, 
        response.encryptionKey, 
        response.appId, 
        response.userId,
        response.isSimulation
      );
      userAddress.value = wallet.address;
      
      // Initialize the SDK client for transaction signing
      await initCircleSdk(response.appId, response.userToken, response.encryptionKey);

      closeWalletModal();
      fetchUserBlockchainDetails().catch(e => console.warn('Background check failed:', e));
      modals.success('Welcome Back!', `Successfully authenticated. Wallet: ${shortAddress(wallet.address)}`);
    }
  } catch (e) {
    console.error('Circle login failed:', e);
    walletConnectionError.value = e.message || 'Circle authentication failed.';
  } finally {
    isConnectingWallet.value = false;
  }
}

async function submitPinSetup() {
  isInitializingWallet.value = true;
  modals.loading('Creating Wallet', 'Initializing your secure user-controlled wallet on Arc Testnet. Please wait...');
  try {
    const result = await executeChallenge(activeChallengeId.value);
    console.log('[CircleUCW] Challenge completion result:', result);

    let wallet = null;
    if (tempSessionData.value.isSimulation) {
      wallet = {
        id: 'mock-wallet-id',
        address: tempSessionData.value.mockAddress,
        blockchain: 'ETH-SEPOLIA'
      };
    } else {
      // Poll wallets via session API since wallet creation is asynchronous (IN_PROGRESS)
      console.log('[CircleUCW] Wallet creation is IN_PROGRESS. Polling backend for active wallets...');
      
      const maxAttempts = 15;
      const delayMs = 2000;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`[CircleUCW] Polling attempt ${attempt}/${maxAttempts}...`);
        
        try {
          const response = await $fetch('/api/circle-wallet-session', {
            method: 'POST',
            body: { userId: circleEmail.value, queryOnly: true }
          });
          
          if (response.success && response.wallets && response.wallets.length > 0) {
            wallet = response.wallets[0];
            console.log('[CircleUCW] Wallet found:', wallet);
            break;
          }
        } catch (pollErr) {
          console.warn(`[CircleUCW] Poll attempt ${attempt} failed:`, pollErr);
        }
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      
      if (!wallet) {
        throw new Error('Wallet creation is taking longer than expected. Please close this modal and click "Connect" again in a few seconds to load your wallet.');
      }
    }

    if (wallet) {
      persistWalletState(
        wallet,
        tempSessionData.value.userToken,
        tempSessionData.value.encryptionKey,
        tempSessionData.value.appId,
        tempSessionData.value.userId,
        tempSessionData.value.isSimulation
      );
      userAddress.value = wallet.address;
      await fetchUserBlockchainDetails();
      closeWalletModal();
      modals.success('Wallet Created!', `Your secure user-controlled wallet was successfully generated on Arc Testnet.\nAddress: ${wallet.address}`);
    }
  } catch (e) {
    console.error('PIN setup challenge failed:', e);
    modals.error('Initialization Failed', e.message || 'Failed to complete wallet setup.');
  } finally {
    isInitializingWallet.value = false;
    showPinScreen.value = false;
    tempSessionData.value = null;
    closeModal();
  }
}

function openConnectedModal() {
  isConnectedModalOpen.value = true;
  copyStatusText.value = 'Copy';
}

function closeConnectedModal() {
  isConnectedModalOpen.value = false;
}

async function disconnectWallet() {
  if (activeWalletProvider.value && typeof activeWalletProvider.value.disconnect === 'function') {
    try {
      await activeWalletProvider.value.disconnect();
    } catch (e) {
      console.warn('Error disconnecting provider session:', e);
    }
  }
  userAddress.value = '';
  activeWalletProvider.value = null;
  userUsdcBalance.value = '0.00';
  userEurcBalance.value = '0.00';
  clearWalletState();
  closeConnectedModal();
}

async function copyAddressToClipboard() {
  if (!userAddress.value) return;
  try {
    await navigator.clipboard.writeText(userAddress.value);
    copyStatusText.value = 'Copied!';
    setTimeout(() => {
      copyStatusText.value = 'Copy';
    }, 2000);
  } catch (err) {
    console.error('Clipboard copy failed:', err);
  }
}

const jobsList = ref([]);
const disputeVotes = ref({}); // jobId => votesInfo
const simulatedMilestoneIndex = ref({}); // jobId => selectedIndex
const isSimulating = ref({}); // jobId => boolean

// Form inputs
const newJob = ref({
  title: '',
  description: '',
  repoUrl: '',
  budget: 100,
  milestonesCount: 1,
  milestones: [{ title: 'Milestone 1', budget: 100 }],
  isPrivate: false
});

const swapForm = ref({
  amountIn: 10
});

const sendForm = ref({
  recipient: '',
  amount: 5
});

// Arc testnet definitions
const ARC_CHAIN_ID = 5042002;
const arcTestnet = {
  id: ARC_CHAIN_ID,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: { decimals: 18, name: 'USDC', symbol: 'USDC' },
  rpcUrls: {
    public: { http: ['https://rpc.testnet.arc.network'] },
    default: { http: ['https://rpc.testnet.arc.network'] }
  }
};

// Computed lists
const openJobs = computed(() => jobsList.value.filter(j => j.status === 'Created'));
const clientJobs = computed(() => jobsList.value.filter(j => j.client.toLowerCase() === userAddress.value.toLowerCase()));
const joinedJobs = computed(() => jobsList.value.filter(j => j.freelancer.toLowerCase() === userAddress.value.toLowerCase()));
const disputedJobs = computed(() => jobsList.value.filter(j => j.status === 'Disputed' || j.status === 'AppealPending'));
const isOwner = computed(() => userAddress.value && platformOwner.value && userAddress.value.toLowerCase() === platformOwner.value.toLowerCase());

// On Mount
onMounted(async () => {
  await fetchSystemStatus();
  await loadJobsFromLocalDb();
  await refreshFxQuote();

  // 1. Check for persisted Circle User Wallet first
  checkPersistedWallet();
  if (circleUserWallet.value) {
    userAddress.value = circleUserWallet.value.address;
    await fetchUserBlockchainDetails();
  } else {
    // 2. Fall back to WalletConnect or browser extension auto-connect
    try {
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      const provider = await EthereumProvider.init({
        projectId: '3fcc6bba6f1de962d911bb5b5c3dba68',
        showQrModal: false,
        chains: [5042002]
      });
      if (provider.session) {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          userAddress.value = accounts[0];
          activeWalletProvider.value = provider;
          await fetchUserBlockchainDetails();
        }
      } else if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          userAddress.value = accounts[0];
          activeWalletProvider.value = window.ethereum;
          await fetchUserBlockchainDetails();
        }
      }
    } catch (e) {
      console.warn('WalletConnect/Extension auto-connect failed:', e);
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            userAddress.value = accounts[0];
            activeWalletProvider.value = window.ethereum;
            await fetchUserBlockchainDetails();
          }
        } catch (err) {
          console.error('Extension auto-connect fallback failed:', err);
        }
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

function handleBackdropClick() {
  if (activeModal.value && !activeModal.value.preventClose) {
    closeModal();
  }
}

function handleConfirm() {
  const modal = activeModal.value;
  if (modal.onConfirm) {
    modal.onConfirm();
  } else {
    closeModal();
  }
}

function handleCancel() {
  const modal = activeModal.value;
  if (modal.onCancel) {
    modal.onCancel();
  } else {
    closeModal();
  }
}

async function refreshFxQuote() {
  isRefreshingQuote.value = true;
  try {
    const res = await $fetch('/api/stablefx-quote?amount=1.00');
    if (res && res.success) {
      liveQuoteRate.value = res.rate;
      const exp = new Date(res.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((exp - Date.now()) / 1000));
      quoteExpiresInSeconds.value = diff;
      
      if (quoteTimer) clearInterval(quoteTimer);
      quoteTimer = setInterval(() => {
        if (quoteExpiresInSeconds.value > 0) {
          quoteExpiresInSeconds.value--;
        } else {
          clearInterval(quoteTimer);
        }
      }, 1000);
    }
  } catch (err) {
    console.warn('Failed to fetch StableFX quote:', err);
  } finally {
    isRefreshingQuote.value = false;
  }
}

async function updatePayoutCurrencyPreference(job) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your EVM wallet first to update payout settings.');
    return;
  }
  const contractAddress = systemStatus.value.contractAddress;
  const currency = job.payoutCurrency || 'USDC';

  isSubmitting.value = true;
  modals.loading('Updating Payout Currency', `Setting preferred payout currency to ${currency} for Job #${job.id}...`);

  try {
    if (circleUserWallet.value) {
      await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: contractAddress,
        abiFunctionSignature: 'setPayoutCurrency(uint256,string)',
        abiParameters: [job.id.toString(), currency],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
    } else {
      const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
      const walletClient = createWalletClient({
        account: userAddress.value,
        chain: arcTestnet,
        transport: custom(getProvider())
      });
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'setPayoutCurrency',
        args: [BigInt(job.id), currency]
      });
      closeModal();
      modals.txPending(tx, `Updating payout currency preference on-chain. Please wait...`);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    }

    const updatedJob = { ...job, payoutCurrency: currency };
    await $fetch('/api/jobs', { method: 'POST', body: updatedJob });

    closeModal();
    modals.success('Payout Preference Saved!', `Successfully set payout preference to ${currency} for Job #${job.id}.`);
    await loadJobsFromLocalDb();
  } catch (err) {
    console.error('Failed to update payout currency preference:', err);
    closeModal();
    modals.error('Update Failed', err.message || 'Transaction failed.');
  } finally {
    isSubmitting.value = false;
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && activeModal.value && !activeModal.value.preventClose) {
    closeModal();
  }
}

// Load backend details
async function fetchSystemStatus() {
  isSystemLoading.value = true;
  try {
    const data = await $fetch('/api/circle-status');
    systemStatus.value = data;
    if (data && data.walletAddress) {
      newAgentJob.value.provider = data.walletAddress;
      newAgentJob.value.evaluator = data.walletAddress;
    }
  } catch (e) {
    console.error('Error fetching system status:', e);
  } finally {
    isSystemLoading.value = false;
  }
}

// Read database
async function loadJobsFromLocalDb() {
  loadingJobs.value = true;
  try {
    const jobs = await $fetch('/api/jobs');
    
    const storedKeys = JSON.parse(localStorage.getItem('viewer_keys') || '{}');
    for (const job of jobs) {
      if (job.isPrivate && job.encryptedDetails) {
        const key = storedKeys[job.id];
        if (key) {
          try {
            const decrypted = await decryptJobDetails(job.encryptedDetails, key);
            job.decrypted = decrypted;
            job.title = decrypted.title;
            job.description = decrypted.description;
            job.repoUrl = decrypted.repoUrl;
            job.budget = decrypted.budget;
            job.milestones = decrypted.milestones;
          } catch (e) {
            console.warn(`Failed to auto-decrypt job #${job.id}:`, e);
          }
        }
      }
    }

    jobsList.value = jobs;
    
    // Auto populate simulated milestone selections
    jobs.forEach(job => {
      simulatedMilestoneIndex.value[job.id] = 0;
      isSimulating.value[job.id] = false;
      
      // Load active dispute stands if disputed or appeal pending
      if (job.status === 'Disputed' || job.status === 'AppealPending') {
        fetchDisputeVotesStanding(job.id);
      }
    });
  } catch (e) {
    console.error('Error fetching jobs:', e);
  } finally {
    loadingJobs.value = false;
  }
}

// Sync local database with on-chain jobs
async function fetchUserBlockchainDetails() {
  if (!userAddress.value) return;
  try {
    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http()
    });
    
    const contractAddress = systemStatus.value.contractAddress;
    if (!contractAddress) return;

    // Fetch Reputation
    const rep = await publicClient.readContract({
      address: contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'reputation',
      args: [userAddress.value]
    });
    freelancerReputation.value = parseInt(rep.toString());

    // Fetch Juror Status
    const isJurorVal = await publicClient.readContract({
      address: contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'isJuror',
      args: [userAddress.value]
    });
    userIsJuror.value = isJurorVal;

    // Fetch Juror Reputation
    if (isJurorVal) {
      try {
        const jurorRep = await publicClient.readContract({
          address: contractAddress,
          abi: GIGMARKET_ESCROW_ABI,
          functionName: 'jurorReputation',
          args: [userAddress.value]
        });
        jurorReputationScore.value = Number(jurorRep) === 0 ? 100 : Number(jurorRep);
      } catch (jurorRepErr) {
        console.warn('Failed to read juror reputation:', jurorRepErr);
      }
    }

    // Fetch Contract Owner
    try {
      const ownerVal = await publicClient.readContract({
        address: contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'owner'
      });
      platformOwner.value = ownerVal;
    } catch (ownerErr) {
      console.warn('Failed to read contract owner:', ownerErr);
    }

    // Fetch USDC Balance
    try {
      const usdcBal = await publicClient.readContract({
        address: USDC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress.value]
      });
      userUsdcBalance.value = parseFloat(formatUnits(usdcBal, 6)).toFixed(2);
    } catch (err) {
      console.warn('Failed to read USDC balance:', err);
    }

    // Fetch EURC Balance
    try {
      const eurcBal = await publicClient.readContract({
        address: EURC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress.value]
      });
      userEurcBalance.value = parseFloat(formatUnits(eurcBal, 6)).toFixed(2);
    } catch (err) {
      console.warn('Failed to read EURC balance:', err);
    }

    // Fetch Profile from backend to load juror stakes and history
    try {
      const statusData = await $fetch(`/api/circle-status?walletAddress=${userAddress.value}`);
      if (statusData && statusData.profile) {
        jurorActiveStake.value = statusData.profile.jurorStakes || 0;
        jurorHistory.value = statusData.profile.votingHistory || [];
      }
    } catch (profileErr) {
      console.warn('Failed to load user profile details:', profileErr);
    }
    
    // Fetch Gateway Nanopayment Profile
    await refreshGatewayProfile();
  } catch (e) {
    console.error('Error reading blockchain profile:', e);
  }
}


// Get dispute votes details
async function fetchDisputeVotesStanding(jobId) {
  try {
    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http()
    });
    const info = await publicClient.readContract({
      address: systemStatus.value.contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'getDisputeVotesInfo',
      args: [BigInt(jobId)]
    });
    disputeVotes.value[jobId] = {
      clientVotes: parseInt(info[0].toString()),
      freelancerVotes: parseInt(info[1].toString()),
      splitVotes: parseInt(info[2].toString()),
      totalVoters: parseInt(info[3].toString())
    };
  } catch (e) {
    console.error(`Error loading dispute standing for Job #${jobId}:`, e);
  }
}

// Wallet connection
async function connectWallet() {
  openWalletModal();
}

function getInjectedProvider(walletKey) {
  if (typeof window === 'undefined') return null;
  if (!window.ethereum) return null;
  
  if (walletKey === 'metamask') {
    return window.ethereum.providers?.find(p => p.isMetaMask) || (window.ethereum.isMetaMask ? window.ethereum : window.ethereum);
  }
  if (walletKey === 'coinbase') {
    return window.coinbaseWalletExtension || window.ethereum.providers?.find(p => p.isCoinbaseWallet) || (window.ethereum.isCoinbaseWallet ? window.ethereum : window.ethereum);
  }
  if (walletKey === 'rainbow') {
    return window.rainbowInstance || window.ethereum.providers?.find(p => p.isRainbow) || (window.ethereum.isRainbow ? window.ethereum : window.ethereum);
  }
  return window.ethereum;
}

async function triggerBrowserConnection() {
  const provider = getInjectedProvider(selectedWallet.value);
  if (!provider) {
    walletConnectionError.value = `${selectedWallet.value === 'metamask' ? 'MetaMask' : selectedWallet.value === 'coinbase' ? 'Coinbase Wallet' : 'Rainbow Wallet'} extension not detected.`;
    return;
  }
  isConnectingWallet.value = true;
  walletConnectionError.value = '';
  try {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    userAddress.value = accounts[0];
    activeWalletProvider.value = provider;
    closeWalletModal();
    fetchUserBlockchainDetails().catch(e => console.warn('Background check failed:', e));
  } catch (e) {
    console.error('Wallet connection error:', e);
    walletConnectionError.value = e.message || 'User rejected connection request.';
  } finally {
    isConnectingWallet.value = false;
  }
}

async function triggerWalletConnectConnection() {
  isConnectingWallet.value = true;
  walletConnectionError.value = '';
  try {
    const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
    const provider = await EthereumProvider.init({
      projectId: '3fcc6bba6f1de962d911bb5b5c3dba68',
      showQrModal: true,
      chains: [5042002], // Arc Testnet
      optionalChains: [1, 8453, 42161],
      methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData_v4"],
      events: ["chainChanged", "accountsChanged"]
    });

    await provider.connect();

    const accounts = await provider.request({ method: 'eth_accounts' });
    userAddress.value = accounts[0];
    activeWalletProvider.value = provider;
    closeWalletModal();
    fetchUserBlockchainDetails().catch(e => console.warn('Background check failed:', e));
  } catch (e) {
    console.error('WalletConnect connection error:', e);
    walletConnectionError.value = e.message || 'Connection request was closed or rejected.';
  } finally {
    isConnectingWallet.value = false;
  }
}

async function retryWalletConnection() {
  await triggerBrowserConnection();
}

// Helpers
function shortAddress(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function calculateJobRequiredStake(budget) {
  const rep = freelancerReputation.value;
  let pct = 10;
  if (rep >= 5) pct = 0;
  else if (rep >= 3) pct = 5;
  return ((budget * pct) / 100).toFixed(0);
}

// Milestone arrays dynamic templates
function updateMilestonesTemplate() {
  const count = newJob.value.milestonesCount;
  const currentLen = newJob.value.milestones.length;
  
  if (count > currentLen) {
    for (let i = currentLen; i < count; i++) {
      newJob.value.milestones.push({ title: `Milestone ${i + 1}`, budget: 0 });
    }
  } else if (count < currentLen) {
    newJob.value.milestones = newJob.value.milestones.slice(0, count);
  }

  // Distribute budget evenly
  const evenBudget = Math.floor(newJob.value.budget / count);
  newJob.value.milestones.forEach((m, idx) => {
    m.budget = idx === count - 1 ? newJob.value.budget - (evenBudget * (count - 1)) : evenBudget;
  });
}

// --- BLOCKCHAIN TRANSACTIONS (Feature A) ---

async function createGig() {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your EVM wallet first to compile and fund new escrow jobs.');
    return;
  }

  // Validate Splits if enabled
  let isSplitMode = enableSplits.value;
  let recipients = [];
  let splits = [];
  if (isSplitMode) {
    const val = validateSplits(splitRecipients.value);
    if (!val.valid) {
      modals.warning('Invalid Split Settings', val.error);
      return;
    }
    recipients = splitRecipients.value.map(r => r.address);
    splits = splitRecipients.value.map(r => BigInt(r.percentage));
  }

  const contractAddress = systemStatus.value.contractAddress;
  const isPrivateMode = newJob.value.isPrivate;

  if (isPrivateMode && isSplitMode) {
    modals.warning('Feature Conflict', 'Privacy features and multi-party splits cannot be enabled simultaneously.');
    return;
  }

  if (isPrivateMode && fundingMethod.value === 'cross-chain') {
    modals.warning('Feature Conflict', 'Cross-chain deposits via CCTP do not support confidential private transactions in the current phase.');
    return;
  }

  // --- PRIVATE TRANSACTION GENERATION ---
  if (isPrivateMode) {
    isSubmitting.value = true;
    modals.loading('Preparing Confidential Escrow', 'Generating Viewer Key and compiling Zero-Knowledge Proof payload locally...');

    let viewerKey = '';
    let encryptedDetails = null;
    let commitment = '0x' + '00'.repeat(32);
    let proof = '0x';
    const budgetAmountUnits = parseUnits(newJob.value.budget.toString(), 6);

    try {
      viewerKey = generateViewerKey();
      const sensitivePayload = {
        title: newJob.value.title,
        description: newJob.value.description,
        repoUrl: newJob.value.repoUrl,
        budget: newJob.value.budget,
        milestones: newJob.value.milestones.map(m => ({
          title: m.title,
          budget: m.budget,
          completed: false,
          approved: false
        }))
      };
      encryptedDetails = await encryptJobDetails(sensitivePayload, viewerKey);
      const proofRes = generateBudgetProof(Number(budgetAmountUnits));
      commitment = proofRes.commitment;
      proof = proofRes.proof;
    } catch (err) {
      console.error('Failed to generate privacy parameters:', err);
      closeModal();
      modals.error('ZKP Proof Error', 'Failed to generate confidential keys or range proof.');
      isSubmitting.value = false;
      return;
    }

    try {
      let createTxHash = '';
      if (circleUserWallet.value) {
        closeModal();
        modals.loading('Authorizing USDC Budget', 'Step 1 of 2: Authorizing USDC budget allocation. Processing (Gasless Sponsored Transaction)...');
        await executeSponsoredTransaction({
          walletId: circleUserWallet.value.id,
          contractAddress: USDC_TOKEN_ADDRESS,
          abiFunctionSignature: 'approve(address,uint256)',
          abiParameters: [contractAddress, budgetAmountUnits.toString()],
          userToken: circleSessionToken.value,
          userAddress: userAddress.value,
          isSimulation: isSimulationMode.value,
          executeChallengeFn: executeChallenge
        });

        closeModal();
        modals.loading('Creating Private Job', 'Step 2 of 2: Depositing budget and creating confidential job (Gasless Sponsored Transaction)...');
        const createRes = await executeSponsoredTransaction({
          walletId: circleUserWallet.value.id,
          contractAddress: contractAddress,
          abiFunctionSignature: 'createPrivateJob(bytes32,bytes,string,uint256)',
          abiParameters: [
            commitment,
            proof,
            JSON.stringify(encryptedDetails),
            budgetAmountUnits.toString()
          ],
          userToken: circleSessionToken.value,
          userAddress: userAddress.value,
          isSimulation: isSimulationMode.value,
          executeChallengeFn: executeChallenge
        });
        createTxHash = createRes.txHash || 'Pending';
      } else {
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
        const walletClient = createWalletClient({
          account: userAddress.value,
          chain: arcTestnet,
          transport: custom(getProvider())
        });

        const approveTx = await walletClient.writeContract({
          address: USDC_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [contractAddress, budgetAmountUnits]
        });
        closeModal();
        modals.txPending(approveTx, 'Validating USDC allowance authorization on-chain. Please wait...');
        await publicClient.waitForTransactionReceipt({ hash: approveTx });

        closeModal();
        modals.loading('Creating Private Job', 'Confirm the private job creation signature request in your wallet...');
        const createTx = await walletClient.writeContract({
          address: contractAddress,
          abi: GIGMARKET_ESCROW_ABI,
          functionName: 'createPrivateJob',
          args: [commitment, proof, JSON.stringify(encryptedDetails), budgetAmountUnits]
        });
        closeModal();
        modals.txPending(createTx, 'Publishing confidential escrow and verifying ZKP. Awaiting block receipt...');
        await publicClient.waitForTransactionReceipt({ hash: createTx });
        createTxHash = createTx;
      }

      let jobIdVal = 1;
      if (!isSimulationMode.value) {
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
        const jobCount = await publicClient.readContract({
          address: contractAddress,
          abi: GIGMARKET_ESCROW_ABI,
          functionName: 'jobCount'
        });
        jobIdVal = parseInt(jobCount.toString());
      } else {
        jobIdVal = jobsList.value.length + 1;
      }

      const newJobDb = {
        id: jobIdVal,
        title: 'CONFIDENTIAL',
        description: 'CONFIDENTIAL',
        repoUrl: 'CONFIDENTIAL',
        budget: 0,
        requiredStake: calculateJobRequiredStake(newJob.value.budget),
        freelancerStake: '0',
        client: userAddress.value,
        freelancer: '0x0000000000000000000000000000000000000000',
        status: 'Created',
        currentMilestone: 0,
        fundingMethod: 'arc',
        isPrivate: true,
        encryptedDetails: encryptedDetails,
        milestones: newJob.value.milestones.map(m => ({
          title: 'CONFIDENTIAL',
          budget: 0,
          completed: false,
          approved: false,
          txHash: createTxHash
        }))
      };

      const storedKeys = JSON.parse(localStorage.getItem('viewer_keys') || '{}');
      storedKeys[jobIdVal] = viewerKey;
      localStorage.setItem('viewer_keys', JSON.stringify(storedKeys));

      await $fetch('/api/jobs', { method: 'POST', body: newJobDb });

      closeModal();
      modals.success(
        'Confidential Job Created!',
        `Job #${jobIdVal} is now live.\n\nViewer Key (keep this secure for decryption & auditing):\n${viewerKey}`
      );
      await loadJobsFromLocalDb();

      newJob.value.title = '';
      newJob.value.description = '';
      newJob.value.repoUrl = '';
      newJob.value.isPrivate = false;
      enableSplits.value = false;
    } catch (e) {
      console.error('Confidential job posting failed:', e);
      closeModal();
      modals.error('Job Posting Failed', e.message || 'Transaction failed.');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  const usdcUnits = parseUnits(newJob.value.budget.toString(), 6);
  const milestoneBudgets = newJob.value.milestones.map(m => parseUnits(m.budget.toString(), 6));
  const milestoneTitles = newJob.value.milestones.map(m => m.title);

  // --- CROSS-CHAIN DEPOSIT (CCTP) FLOW ---
  if (fundingMethod.value === 'cross-chain') {
    isSubmitting.value = true;
    isBridging.value = true;
    bridgeStep.value = 1;
    bridgeStatusText.value = `Initiating burn of ${newJob.value.budget} USDC on ${sourceChain.value}. Please confirm the approval and burn transaction in your wallet...`;
    bridgeTxHashes.value = { burn: '', mint: '', attestation: '', escrow: '' };

    try {
      // 1. Burn on source chain
      const burnRes = await initiateBurn(sourceChain.value, newJob.value.budget.toString(), userAddress.value);
      bridgeTxHashes.value.burn = burnRes.burnTxHash;

      // 2. Poll Attestation
      bridgeStep.value = 2;
      bridgeStatusText.value = 'Waiting for Circle attestation signature (this takes ~8 seconds in simulation/sandbox)...';
      const attestationSig = await pollBridgeAttestation(burnRes.messageHash, (progressText) => {
        bridgeStatusText.value = progressText;
      });
      bridgeTxHashes.value.attestation = attestationSig;

      // 3. Mint on Arc Testnet (Gasless sponsored transaction)
      bridgeStep.value = 3;
      bridgeStatusText.value = 'Attestation verified! Submitting sponsored mint transaction on Arc Testnet...';
      const mintTx = await mintOnArc(burnRes.messageBytes, attestationSig);
      bridgeTxHashes.value.mint = mintTx;

      // 4. Create Job / Deposit Escrow on Arc Testnet
      bridgeStep.value = 4;
      bridgeStatusText.value = 'Depositing USDC into smart contract escrow & launching job portal...';

      let createTxHash = '';
      if (circleUserWallet.value) {
        const createRes = await executeSponsoredTransaction({
          walletId: circleUserWallet.value.id,
          contractAddress: contractAddress,
          abiFunctionSignature: isSplitMode 
            ? 'createJobWithSplits(uint256,string,uint256[],string[],address[],uint256[])'
            : 'createJob(uint256,string,uint256[],string[])',
          abiParameters: isSplitMode
            ? [
                usdcUnits.toString(),
                newJob.value.repoUrl,
                milestoneBudgets.map(b => b.toString()),
                milestoneTitles,
                recipients,
                splits.map(s => s.toString())
              ]
            : [
                usdcUnits.toString(),
                newJob.value.repoUrl,
                milestoneBudgets.map(b => b.toString()),
                milestoneTitles
              ],
          userToken: circleSessionToken.value,
          userAddress: userAddress.value,
          isSimulation: isSimulationMode.value,
          executeChallengeFn: executeChallenge
        });
        createTxHash = createRes.txHash || 'Pending';
      } else {
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
        const walletClient = createWalletClient({
          account: userAddress.value,
          chain: arcTestnet,
          transport: custom(getProvider())
        });
        
        let createTx;
        if (isSplitMode) {
          createTx = await walletClient.writeContract({
            address: contractAddress,
            abi: GIGMARKET_ESCROW_ABI,
            functionName: 'createJobWithSplits',
            args: [usdcUnits, newJob.value.repoUrl, milestoneBudgets, milestoneTitles, recipients, splits]
          });
        } else {
          createTx = await walletClient.writeContract({
            address: contractAddress,
            abi: GIGMARKET_ESCROW_ABI,
            functionName: 'createJob',
            args: [usdcUnits, newJob.value.repoUrl, milestoneBudgets, milestoneTitles]
          });
        }
        await publicClient.waitForTransactionReceipt({ hash: createTx });
        createTxHash = createTx;
      }
      bridgeTxHashes.value.escrow = createTxHash;

      // Read new job ID
      let jobIdVal = 1;
      if (!isSimulationMode.value) {
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
        const jobCount = await publicClient.readContract({
          address: contractAddress,
          abi: GIGMARKET_ESCROW_ABI,
          functionName: 'jobCount'
        });
        jobIdVal = parseInt(jobCount.toString());
      } else {
        jobIdVal = jobsList.value.length + 1;
      }

      // Save to database
      const newJobDb = {
        id: jobIdVal,
        title: newJob.value.title,
        description: newJob.value.description,
        repoUrl: newJob.value.repoUrl,
        budget: newJob.value.budget,
        requiredStake: calculateJobRequiredStake(newJob.value.budget),
        freelancerStake: '0',
        client: userAddress.value,
        freelancer: '0x0000000000000000000000000000000000000000',
        status: 'Created',
        currentMilestone: 0,
        fundingMethod: 'cross-chain',
        sourceChain: sourceChain.value,
        burnTxHash: burnRes.burnTxHash,
        mintTxHash: mintTx,
        escrowTxHash: createTxHash,
        recipients: isSplitMode ? splitRecipients.value.map(r => r.address) : [],
        splits: isSplitMode ? splitRecipients.value.map(r => parseInt(r.percentage)) : [],
        milestones: newJob.value.milestones.map(m => ({
          title: m.title,
          budget: m.budget,
          completed: false,
          approved: false,
          txHash: createTxHash
        }))
      };

      await $fetch('/api/jobs', { method: 'POST', body: newJobDb });

      bridgeStep.value = 5;
      bridgeStatusText.value = 'Success! Escrow funded and gig is now active on GigMarket.';
      await loadJobsFromLocalDb();
      await fetchUserBlockchainDetails();

      // Reset form
      newJob.value.title = '';
      newJob.value.description = '';
      newJob.value.repoUrl = '';
      enableSplits.value = false;
      splitRecipients.value = [{ address: '', percentage: 100 }];
    } catch (e) {
      console.error('CCTP Bridge error:', e);
      bridgeStep.value = -1;
      bridgeStatusText.value = `Bridge execution failed: ${e.message || e}`;
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  // --- STANDARD DIRECT ARC FLOW ---
  if (circleUserWallet.value) {
    isSubmitting.value = true;
    try {
      modals.loading('Authorizing USDC Budget', 'Step 1 of 2: Authorizing USDC budget allocation. Processing (Gasless Sponsored Transaction)...');
      const approveRes = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: USDC_TOKEN_ADDRESS,
        abiFunctionSignature: 'approve(address,uint256)',
        abiParameters: [contractAddress, usdcUnits.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
      const approveTxHash = approveRes.txHash || 'Pending';
      
      closeModal();
      modals.loading('Funding Escrow Job', 'Step 2 of 2: Securing project budget in escrow. Processing (Gasless Sponsored Transaction)...');
      
      const createRes = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: contractAddress,
        abiFunctionSignature: isSplitMode
          ? 'createJobWithSplits(uint256,string,uint256[],string[],address[],uint256[])'
          : 'createJob(uint256,string,uint256[],string[])',
        abiParameters: isSplitMode
          ? [
              usdcUnits.toString(),
              newJob.value.repoUrl,
              milestoneBudgets.map(b => b.toString()),
              milestoneTitles,
              recipients,
              splits.map(s => s.toString())
            ]
          : [
              usdcUnits.toString(),
              newJob.value.repoUrl,
              milestoneBudgets.map(b => b.toString()),
              milestoneTitles
            ],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
      const createTxHash = createRes.txHash || 'Pending';

      let jobIdVal = 1;
      if (!isSimulationMode.value) {
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
        const jobCount = await publicClient.readContract({
          address: contractAddress,
          abi: GIGMARKET_ESCROW_ABI,
          functionName: 'jobCount'
        });
        jobIdVal = parseInt(jobCount.toString());
      } else {
        jobIdVal = jobsList.value.length + 1;
      }
      
      const newJobDb = {
        id: jobIdVal,
        title: newJob.value.title,
        description: newJob.value.description,
        repoUrl: newJob.value.repoUrl,
        budget: newJob.value.budget,
        requiredStake: calculateJobRequiredStake(newJob.value.budget),
        freelancerStake: '0',
        client: userAddress.value,
        freelancer: '0x0000000000000000000000000000000000000000',
        status: 'Created',
        currentMilestone: 0,
        fundingMethod: 'arc',
        recipients: isSplitMode ? splitRecipients.value.map(r => r.address) : [],
        splits: isSplitMode ? splitRecipients.value.map(r => parseInt(r.percentage)) : [],
        milestones: newJob.value.milestones.map(m => ({
          title: m.title,
          budget: m.budget,
          completed: false,
          approved: false,
          txHash: createTxHash
        }))
      };

      await $fetch('/api/jobs', { method: 'POST', body: newJobDb });
      
      closeModal();
      modals.success('Escrow Job Published!', `Successfully initiated Project #${jobIdVal} and secured the ${newJob.value.budget} USDC budget!`);
      await loadJobsFromLocalDb();
      
      newJob.value.title = '';
      newJob.value.description = '';
      newJob.value.repoUrl = '';
      enableSplits.value = false;
      splitRecipients.value = [{ address: '', percentage: 100 }];
    } catch (e) {
      console.error('Circle job posting failed:', e);
      closeModal();
      modals.error('Job Posting Failed', e.message || 'Circle transaction failed.');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  isSubmitting.value = true;
  modals.loading('Authorizing USDC Budget', 'Step 1 of 2: Please sign the transaction inside your wallet provider to approve USDC stablecoin allocation...');
  try {
    const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
    const walletClient = createWalletClient({
      account: userAddress.value,
      chain: arcTestnet,
      transport: custom(getProvider())
    });

    // 1. Approve USDC transfer
    const approveTx = await walletClient.writeContract({
      address: USDC_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contractAddress, usdcUnits]
    });
    
    closeModal();
    modals.txPending(approveTx, 'Validating USDC allowance authorization on-chain. Please wait...');
    await publicClient.waitForTransactionReceipt({ hash: approveTx });

    // 2. Create Job
    closeModal();
    modals.loading('Funding Escrow Job', 'Step 2 of 2: Authorizing the smart contract secure deposit pool. Confirm the signature request in your wallet...');
    
    let createTx;
    if (isSplitMode) {
      createTx = await walletClient.writeContract({
        address: contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'createJobWithSplits',
        args: [usdcUnits, newJob.value.repoUrl, milestoneBudgets, milestoneTitles, recipients, splits]
      });
    } else {
      createTx = await walletClient.writeContract({
        address: contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'createJob',
        args: [usdcUnits, newJob.value.repoUrl, milestoneBudgets, milestoneTitles]
      });
    }
    
    closeModal();
    modals.txPending(createTx, 'Publishing job escrow and locking USDC gasless pools. Awaiting block receipt...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash: createTx });

    const jobCount = await publicClient.readContract({
      address: contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'jobCount'
    });
    const jobIdVal = parseInt(jobCount.toString());

    const newJobDb = {
      id: jobIdVal,
      title: newJob.value.title,
      description: newJob.value.description,
      repoUrl: newJob.value.repoUrl,
      budget: newJob.value.budget,
      requiredStake: calculateJobRequiredStake(newJob.value.budget),
      freelancerStake: '0',
      client: userAddress.value,
      freelancer: '0x0000000000000000000000000000000000000000',
      status: 'Created',
      currentMilestone: 0,
      fundingMethod: 'arc',
      recipients: isSplitMode ? splitRecipients.value.map(r => r.address) : [],
      splits: isSplitMode ? splitRecipients.value.map(r => parseInt(r.percentage)) : [],
      milestones: newJob.value.milestones.map(m => ({
        title: m.title,
        budget: m.budget,
        completed: false,
        approved: false,
        txHash: createTx
      }))
    };

    await $fetch('/api/jobs', {
      method: 'POST',
      body: newJobDb
    });

    closeModal();
    modals.success('Escrow Job Published!', `Successfully initiated Project #${jobIdVal} and secured the ${newJob.value.budget} USDC budget!`);
    await loadJobsFromLocalDb();
    
    // Reset form
    newJob.value.title = '';
    newJob.value.description = '';
    newJob.value.repoUrl = '';
    enableSplits.value = false;
    splitRecipients.value = [{ address: '', percentage: 100 }];
  } catch (e) {
    console.error('Job posting failed:', e);
    closeModal();
    handleError(e, createGig);
  } finally {
    isSubmitting.value = false;
  }
}

async function joinGig(job) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your EVM wallet first to join projects.');
    return;
  }

  const isPrivateMode = job.isPrivate;

  if (isPrivateMode) {
    isSubmitting.value = true;
    const requiredStakeVal = calculateJobRequiredStake(job.budget || 0);
    const stakeUnits = parseUnits(requiredStakeVal, 6);
    const contractAddress = systemStatus.value.contractAddress;

    let stakeCommitment = '0x' + '00'.repeat(32);
    let stakeProof = '0x';
    if (stakeUnits > 0n) {
      modals.loading('Preparing Confidential Collateral', 'Generating ZKP proof for required stake collateral...');
      try {
        const proofRes = generateBudgetProof(Number(stakeUnits));
        stakeCommitment = proofRes.commitment;
        stakeProof = proofRes.proof;
      } catch (err) {
        console.error('Failed to generate privacy parameters for stake:', err);
        closeModal();
        modals.error('ZKP Proof Error', 'Failed to generate ZKP proof for stake.');
        isSubmitting.value = false;
        return;
      }
    }

    try {
      if (circleUserWallet.value) {
        if (stakeUnits > 0n) {
          closeModal();
          modals.loading('Preparing Collateral Stake', `Staking requirement: ${requiredStakeVal} USDC. Processing (Gasless Sponsored Transaction)...`);
          await executeSponsoredTransaction({
            walletId: circleUserWallet.value.id,
            contractAddress: USDC_TOKEN_ADDRESS,
            abiFunctionSignature: 'approve(address,uint256)',
            abiParameters: [contractAddress, stakeUnits.toString()],
            userToken: circleSessionToken.value,
            userAddress: userAddress.value,
            isSimulation: isSimulationMode.value,
            executeChallengeFn: executeChallenge
          });
        }

        closeModal();
        modals.loading('Joining Private Job', 'Registering address securely as confidential freelancer (Gasless Sponsored Transaction)...');
        await executeSponsoredTransaction({
          walletId: circleUserWallet.value.id,
          contractAddress: contractAddress,
          abiFunctionSignature: 'joinPrivateJob(uint256,uint256,bytes32,bytes)',
          abiParameters: [job.id.toString(), stakeUnits.toString(), stakeCommitment, stakeProof],
          userToken: circleSessionToken.value,
          userAddress: userAddress.value,
          isSimulation: isSimulationMode.value,
          executeChallengeFn: executeChallenge
        });
      } else {
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
        const walletClient = createWalletClient({
          account: userAddress.value,
          chain: arcTestnet,
          transport: custom(getProvider())
        });

        if (stakeUnits > 0n) {
          const approveTx = await walletClient.writeContract({
            address: USDC_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [contractAddress, stakeUnits]
          });
          closeModal();
          modals.txPending(approveTx, 'Validating collateral stake authorization on-chain. Please wait...');
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        closeModal();
        modals.loading('Joining Private Job', 'Confirm private job joining signature request in your wallet...');
        const joinTx = await walletClient.writeContract({
          address: contractAddress,
          abi: GIGMARKET_ESCROW_ABI,
          functionName: 'joinPrivateJob',
          args: [BigInt(job.id), stakeUnits, stakeCommitment, stakeProof]
        });
        closeModal();
        modals.txPending(joinTx, 'Registering confidential freelancer address and staking collateral. Awaiting block receipt...');
        await publicClient.waitForTransactionReceipt({ hash: joinTx });
      }

      const updatedJob = {
        ...job,
        status: 'Active',
        freelancer: userAddress.value,
        requiredStake: requiredStakeVal,
        freelancerStake: requiredStakeVal
      };

      await $fetch('/api/jobs', { method: 'POST', body: updatedJob });

      closeModal();
      modals.success('Joined Private Project Successfully!', `You have joined Job #${job.id} as active freelancer! Staked collateral amount: ${requiredStakeVal} USDC.`);
      await loadJobsFromLocalDb();
      await fetchUserBlockchainDetails();
    } catch (e) {
      console.error('Circle joining private gig failed:', e);
      closeModal();
      modals.error('Failed to Join Project', e.message || 'Circle transaction failed.');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  const config = getJoinSplitConfig(job.id);
  let isSplitMode = config.enable;
  let recipients = [];
  let splits = [];
  if (isSplitMode) {
    const val = validateSplits(config.recipients);
    if (!val.valid) {
      modals.warning('Invalid Split Settings', val.error);
      return;
    }
    recipients = config.recipients.map(r => r.address);
    splits = config.recipients.map(r => BigInt(r.percentage));
  }

  const requiredStakeVal = calculateJobRequiredStake(job.budget);
  const stakeUnits = parseUnits(requiredStakeVal, 6);
  const contractAddress = systemStatus.value.contractAddress;

  if (circleUserWallet.value) {
    isSubmitting.value = true;
    try {
      // 1. Approve USDC if stake > 0
      if (stakeUnits > 0n) {
        modals.loading('Preparing Collateral Stake', `Staking requirement: ${requiredStakeVal} USDC. Processing (Gasless Sponsored Transaction)...`);
        await executeSponsoredTransaction({
          walletId: circleUserWallet.value.id,
          contractAddress: USDC_TOKEN_ADDRESS,
          abiFunctionSignature: 'approve(address,uint256)',
          abiParameters: [contractAddress, stakeUnits.toString()],
          userToken: circleSessionToken.value,
          userAddress: userAddress.value,
          isSimulation: isSimulationMode.value,
          executeChallengeFn: executeChallenge
        });
      }

      // 2. Join Gig via Sponsored Transaction
      closeModal();
      modals.loading('Registering Contract', 'Submitting registration. Processing (Gasless Sponsored Transaction)...');
      const joinRes = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: contractAddress,
        abiFunctionSignature: isSplitMode
          ? 'joinJobWithSplits(uint256,address[],uint256[])'
          : 'joinJob(uint256)',
        abiParameters: isSplitMode
          ? [job.id.toString(), recipients, splits.map(s => s.toString())]
          : [job.id.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });

      const updatedJob = {
        ...job,
        status: 'Active',
        freelancer: userAddress.value,
        requiredStake: requiredStakeVal,
        freelancerStake: requiredStakeVal,
        recipients: isSplitMode ? config.recipients.map(r => r.address) : [userAddress.value],
        splits: isSplitMode ? config.recipients.map(r => parseInt(r.percentage)) : [100]
      };

      await $fetch('/api/jobs', {
        method: 'POST',
        body: updatedJob
      });

      closeModal();
      modals.success('Joined Project Successfully!', `You have joined Job #${job.id} as active freelancer! Staked collateral amount: ${requiredStakeVal} USDC.`);
      await loadJobsFromLocalDb();
      await fetchUserBlockchainDetails();
    } catch (e) {
      console.error('Circle joining gig failed:', e);
      closeModal();
      modals.error('Failed to Join Project', e.message || 'Circle transaction failed.');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  isSubmitting.value = true;
  modals.loading('Preparing Collateral Stake', `Staking requirement: ${requiredStakeVal} USDC. Preparing allowance authorization transaction...`);

  try {
    const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
    const walletClient = createWalletClient({
      account: userAddress.value,
      chain: arcTestnet,
      transport: custom(getProvider())
    });

    // 1. Approve USDC if stake > 0
    if (stakeUnits > 0n) {
      console.log(`Approving stake allowance: ${requiredStakeVal} USDC...`);
      const approveTx = await walletClient.writeContract({
        address: USDC_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddress, stakeUnits]
      });
      closeModal();
      modals.txPending(approveTx, 'Validating collateral stake authorization on-chain. Please wait...');
      await publicClient.waitForTransactionReceipt({ hash: approveTx });
    }

    // 2. Join Gig on chain
    closeModal();
    modals.loading('Registering Contract', 'Submitting registration signature request to joint job escrow pool...');
    
    let joinTx;
    if (isSplitMode) {
      joinTx = await walletClient.writeContract({
        address: contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'joinJobWithSplits',
        args: [BigInt(job.id), recipients, splits]
      });
    } else {
      joinTx = await walletClient.writeContract({
        address: contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'joinJob',
        args: [BigInt(job.id)]
      });
    }
    
    closeModal();
    modals.txPending(joinTx, 'Registering your address as project freelancer. locking security collateral...');
    await publicClient.waitForTransactionReceipt({ hash: joinTx });

    // 3. Post updates to local db
    const updatedJob = {
      ...job,
      status: 'Active',
      freelancer: userAddress.value,
      requiredStake: requiredStakeVal,
      freelancerStake: requiredStakeVal,
      recipients: isSplitMode ? config.recipients.map(r => r.address) : [userAddress.value],
      splits: isSplitMode ? config.recipients.map(r => parseInt(r.percentage)) : [100]
    };

    await $fetch('/api/jobs', {
      method: 'POST',
      body: updatedJob
    });

    closeModal();
    modals.success('Joined Project Successfully!', `You have joined Job #${job.id} as active freelancer! Staked collateral amount: ${requiredStakeVal} USDC.`);
    await loadJobsFromLocalDb();
    await fetchUserBlockchainDetails();
  } catch (e) {
    console.error('Joining gig failed:', e);
    closeModal();
    handleError(e, () => joinGig(job));
  } finally {
    isSubmitting.value = false;
  }
}

async function payoutMilestone(jobId, milestoneIndex) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your EVM wallet first to release escrow payouts.');
    return;
  }

  const job = jobsList.value.find(j => j.id === jobId);
  if (!job) {
    modals.error('Job Not Found', `Failed to find job with ID #${jobId}`);
    return;
  }
  const isPrivateMode = job.isPrivate;
  const contractAddress = systemStatus.value.contractAddress;

  if (isPrivateMode) {
    isSubmitting.value = true;
    modals.loading('Preparing Private Milestone Release', 'Generating payout cryptographic proof & commitments...');

    const milBudget = job.milestones[milestoneIndex].budget;
    const payoutUnits = parseUnits(milBudget.toString(), 6);
    const isLastMilestone = (milestoneIndex + 1 >= job.milestones.length);

    let payoutCommitment = '0x' + '00'.repeat(32);
    let payoutProof = '0x';

    try {
      const proofRes = generateBudgetProof(Number(payoutUnits));
      payoutCommitment = proofRes.commitment;
      payoutProof = proofRes.proof;
    } catch (err) {
      console.error('Failed to generate privacy parameters for milestone payout:', err);
      closeModal();
      modals.error('ZKP Proof Error', 'Failed to generate ZKP proof for milestone budget.');
      isSubmitting.value = false;
      return;
    }

    try {
      let txHash = '';
      if (circleUserWallet.value) {
        closeModal();
        modals.loading('Releasing Milestone Funds', `Releasing Milestone #${milestoneIndex + 1} securely. Processing (Gasless Sponsored Transaction)...`);
        const payoutRes = await executeSponsoredTransaction({
          walletId: circleUserWallet.value.id,
          contractAddress: contractAddress,
          abiFunctionSignature: 'approvePrivateMilestone(uint256,uint256,uint256,bytes32,bytes,bool)',
          abiParameters: [
            jobId.toString(),
            milestoneIndex.toString(),
            payoutUnits.toString(),
            payoutCommitment,
            payoutProof,
            isLastMilestone
          ],
          userToken: circleSessionToken.value,
          userAddress: userAddress.value,
          isSimulation: isSimulationMode.value,
          executeChallengeFn: executeChallenge
        });
        txHash = payoutRes.txHash || 'Pending';
      } else {
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
        const walletClient = createWalletClient({
          account: userAddress.value,
          chain: arcTestnet,
          transport: custom(getProvider())
        });

        closeModal();
        modals.loading('Releasing Milestone Funds', `Confirm confidential milestone payout signature request in your wallet...`);
        const tx = await walletClient.writeContract({
          address: contractAddress,
          abi: GIGMARKET_ESCROW_ABI,
          functionName: 'approvePrivateMilestone',
          args: [BigInt(jobId), BigInt(milestoneIndex), payoutUnits, payoutCommitment, payoutProof, isLastMilestone]
        });
        closeModal();
        modals.txPending(tx, 'Verifying ZKP payout proof and releasing stablecoin escrow on-chain. Please wait...');
        await publicClient.waitForTransactionReceipt({ hash: tx });
        txHash = tx;
      }

      const updatedJob = { ...job };
      updatedJob.milestones[milestoneIndex].completed = true;
      updatedJob.milestones[milestoneIndex].approved = true;
      updatedJob.milestones[milestoneIndex].txHash = txHash;
      updatedJob.currentMilestone = parseInt(updatedJob.currentMilestone) + 1;
      
      if (updatedJob.currentMilestone >= updatedJob.milestones.length) {
        updatedJob.status = 'Completed';
      }

      await $fetch('/api/jobs', {
        method: 'POST',
        body: updatedJob
      });

      closeModal();
      modals.success('Milestone Payout Disbursed!', `Successfully transferred milestone funds to the freelancer's wallet and unlocked proportional staking collateral!`);
      await loadJobsFromLocalDb();
      await fetchUserBlockchainDetails();
    } catch (e) {
      console.error('Confidential milestone payout failed:', e);
      closeModal();
      modals.error('Payout Failed', e.message || 'Transaction failed.');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  if (circleUserWallet.value) {
    isSubmitting.value = true;
    modals.loading('Releasing Milestone Funds', `Processing (Gasless Sponsored Transaction)...`);
    try {
      const payoutRes = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: contractAddress,
        abiFunctionSignature: 'approveMilestone(uint256,uint256)',
        abiParameters: [jobId.toString(), milestoneIndex.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
      const txHash = payoutRes.txHash || 'Pending';

      // Fetch original job to update in db
      const job = jobsList.value.find(j => j.id === jobId);
      const updatedJob = { ...job };
      updatedJob.milestones[milestoneIndex].completed = true;
      updatedJob.milestones[milestoneIndex].approved = true;
      updatedJob.milestones[milestoneIndex].txHash = txHash;
      updatedJob.currentMilestone = parseInt(updatedJob.currentMilestone) + 1;
      
      if (updatedJob.currentMilestone >= updatedJob.milestones.length) {
        updatedJob.status = 'Completed';
      }

      await $fetch('/api/jobs', {
        method: 'POST',
        body: updatedJob
      });

      closeModal();
      const isEurc = job.payoutCurrency === 'EURC';
      const successMsg = isEurc
        ? `Successfully swapped milestone funds via Circle StableFX on-chain and disbursed EURC payout to the freelancer's wallet, along with unlocking proportional collateral!`
        : `Successfully transferred milestone funds to the freelancer's wallet and unlocked proportional staking collateral!`;
      modals.success(isEurc ? 'StableFX Payout Swapped & Disbursed!' : 'Milestone Payout Disbursed!', successMsg);
      await loadJobsFromLocalDb();
      await fetchUserBlockchainDetails();
    } catch (e) {
      console.error('Circle milestone payout failed:', e);
      closeModal();
      modals.error('Payout Failed', e.message || 'Circle transaction failed.');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  isSubmitting.value = true;
  modals.loading('Releasing Milestone Funds', `Confirming payout signature request for Milestone #${milestoneIndex + 1} of Job #${jobId}...`);
  try {
    const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
    const walletClient = createWalletClient({
      account: userAddress.value,
      chain: arcTestnet,
      transport: custom(getProvider())
    });
    
    const tx = await walletClient.writeContract({
      address: contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'approveMilestone',
      args: [BigInt(jobId), BigInt(milestoneIndex)]
    });
    
    closeModal();
    modals.txPending(tx, `Processing on-chain milestone payout & staking collateral return...`);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    
    // Fetch original job to update in db
    const job = jobsList.value.find(j => j.id === jobId);
    const updatedJob = { ...job };
    updatedJob.milestones[milestoneIndex].completed = true;
    updatedJob.milestones[milestoneIndex].approved = true;
    updatedJob.milestones[milestoneIndex].txHash = tx;
    updatedJob.currentMilestone = parseInt(updatedJob.currentMilestone) + 1;
    
    if (updatedJob.currentMilestone >= updatedJob.milestones.length) {
      updatedJob.status = 'Completed';
    }

    await $fetch('/api/jobs', {
      method: 'POST',
      body: updatedJob
    });

    closeModal();
    const isEurc = job.payoutCurrency === 'EURC';
    const successMsg = isEurc
      ? `Successfully swapped milestone funds via Circle StableFX on-chain and disbursed EURC payout to the freelancer's wallet, along with unlocking proportional collateral!`
      : `Successfully transferred milestone funds to the freelancer's wallet and unlocked proportional staking collateral!`;
    modals.success(isEurc ? 'StableFX Payout Swapped & Disbursed!' : 'Milestone Payout Disbursed!', successMsg);
    await loadJobsFromLocalDb();
    await fetchUserBlockchainDetails();
  } catch (e) {
    console.error('Manual milestone approval failed:', e);
    closeModal();
    handleError(e, () => payoutMilestone(jobId, milestoneIndex));
  } finally {
    isSubmitting.value = false;
  }
}

async function raiseDispute(jobId) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your EVM wallet first to lock escrow funds.');
    return;
  }
  
  if (circleUserWallet.value) {
    modals.confirm(
      'Initiate Dispute Review?',
      'Are you sure you want to raise a dispute? This locks the remaining escrow milestones and stakes, and triggers peer juror governance review.',
      async () => {
        isSubmitting.value = true;
        modals.loading('Submitting Dispute Registration', 'Processing (Gasless Sponsored Transaction)...');
        try {
          await executeSponsoredTransaction({
            walletId: circleUserWallet.value.id,
            contractAddress: systemStatus.value.contractAddress,
            abiFunctionSignature: 'initiateDispute(uint256)',
            abiParameters: [jobId.toString()],
            userToken: circleSessionToken.value,
            userAddress: userAddress.value,
            isSimulation: isSimulationMode.value,
            executeChallengeFn: executeChallenge
          });

          const job = jobsList.value.find(j => j.id === jobId);
          const updatedJob = { ...job, status: 'Disputed' };
          await $fetch('/api/jobs', { method: 'POST', body: updatedJob });

          closeModal();
          modals.success('Dispute Active', 'Secure lock completed. Peer jurors have been summoned to analyze and vote on this project dispute.');
          await loadJobsFromLocalDb();
        } catch (e) {
          console.error('Circle dispute failed:', e);
          closeModal();
          modals.error('Dispute Failed', e.message || 'Circle transaction failed.');
        } finally {
          isSubmitting.value = false;
        }
      },
      null,
      { isDestructive: true, primaryLabel: 'Yes, Lock Escrow & Disagree' }
    );
    return;
  }

  modals.confirm(
    'Initiate Dispute Review?',
    'Are you sure you want to raise a dispute? This locks the remaining escrow milestones and stakes, and triggers peer juror governance review.',
    async () => {
      isSubmitting.value = true;
      modals.loading('Submitting Dispute Registration', 'Confirm the signature request inside your wallet extension...');
      try {
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
        const walletClient = createWalletClient({
          account: userAddress.value,
          chain: arcTestnet,
          transport: custom(getProvider())
        });

        const tx = await walletClient.writeContract({
          address: systemStatus.value.contractAddress,
          abi: GIGMARKET_ESCROW_ABI,
          functionName: 'initiateDispute',
          args: [BigInt(jobId)]
        });
        
        closeModal();
        modals.txPending(tx, 'Recording dispute contract state on Arc Testnet. Locking collateral pools...');
        await publicClient.waitForTransactionReceipt({ hash: tx });

        // Update DB
        const job = jobsList.value.find(j => j.id === jobId);
        const updatedJob = { ...job, status: 'Disputed' };
        
        await $fetch('/api/jobs', {
          method: 'POST',
          body: updatedJob
        });

        closeModal();
        modals.success('Dispute Active', 'Secure lock completed. Peer jurors have been summoned to analyze and vote on this project dispute.');
        await loadJobsFromLocalDb();
      } catch (e) {
        console.error('Dispute initiation failed:', e);
        closeModal();
        handleError(e, () => raiseDispute(jobId));
      } finally {
        isSubmitting.value = false;
      }
    },
    null,
    { isDestructive: true, primaryLabel: 'Yes, Lock Escrow & Disagree' }
  );
}

// --- JURY GOVERNANCE (Feature C) ---

async function registerJuror() {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your EVM wallet first to register as a dispute juror.');
    return;
  }

  if (circleUserWallet.value) {
    isSubmitting.value = true;
    modals.loading('Summoning Juror Board', 'Processing (Gasless Sponsored Transaction)...');
    try {
      await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: systemStatus.value.contractAddress,
        abiFunctionSignature: 'registerAsJuror()',
        abiParameters: [],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });

      closeModal();
      modals.success('Juror Enrolled!', 'You have successfully enrolled in the decentralized arbitrator jury board! You can now analyze and vote on active contract disputes.');
      await fetchUserBlockchainDetails();
    } catch (e) {
      console.error('Circle juror registration failed:', e);
      closeModal();
      modals.error('Registration Failed', e.message || 'Circle transaction failed.');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  isSubmitting.value = true;
  modals.loading('Summoning Juror Board', 'Confirming juror registration on Arc Testnet. Please sign in your wallet extension...');
  try {
    const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
    const walletClient = createWalletClient({
      account: userAddress.value,
      chain: arcTestnet,
      transport: custom(getProvider())
    });

    const tx = await walletClient.writeContract({
      address: systemStatus.value.contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'registerAsJuror'
    });
    
    closeModal();
    modals.txPending(tx, 'Recording your address as an official peer juror. Setting incentives metrics...');
    await publicClient.waitForTransactionReceipt({ hash: tx });
    
    closeModal();
    modals.success('Juror Enrolled!', 'You have successfully enrolled in the decentralized arbitrator jury board! You can now analyze and vote on active contract disputes.');
    await fetchUserBlockchainDetails();
  } catch (e) {
    console.error('Juror registration failed:', e);
    closeModal();
    handleError(e, registerJuror);
  } finally {
    isSubmitting.value = false;
  }
}

async function voteDispute(jobId, option) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your wallet to submit votes.');
    return;
  }

  const optionStr = option === 1 ? 'Client Payout' : option === 2 ? 'Freelancer Refund' : 'Split budget evenly';
  const requiredAllowance = 50 * 1e6; // 50 USDC

  isSubmitting.value = true;
  try {
    const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });

    // Check allowance first
    const allowance = await publicClient.readContract({
      address: systemStatus.value.usdcAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [userAddress.value, systemStatus.value.contractAddress]
    });

    if (circleUserWallet.value) {
      if (allowance < BigInt(requiredAllowance)) {
        modals.loading('Authorizing Juror Stake', 'Approving 50 USDC stake (Gasless Sponsored)...');
        await executeSponsoredTransaction({
          walletId: circleUserWallet.value.id,
          contractAddress: systemStatus.value.usdcAddress,
          abiFunctionSignature: 'approve(address,uint256)',
          abiParameters: [systemStatus.value.contractAddress, requiredAllowance.toString()],
          userToken: circleSessionToken.value,
          userAddress: userAddress.value,
          isSimulation: isSimulationMode.value,
          executeChallengeFn: executeChallenge
        });
      }

      modals.loading('Casting Arbitration Vote', 'Submitting secure vote (Gasless Sponsored)...');
      await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: systemStatus.value.contractAddress,
        abiFunctionSignature: 'voteOnDispute(uint256,uint8)',
        abiParameters: [jobId.toString(), option.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });

      closeModal();
      modals.success('Arbitration Vote Casted!', `Successfully submitted your vote: "${optionStr}" on Job #${jobId}. Thank you for securing the ecosystem!`);
      await fetchDisputeVotesStanding(jobId);
      await fetchUserBlockchainDetails();
    } else {
      const walletClient = createWalletClient({
        account: userAddress.value,
        chain: arcTestnet,
        transport: custom(getProvider())
      });

      if (allowance < BigInt(requiredAllowance)) {
        modals.loading('Authorizing Juror Stake', 'Step 1 of 2: Confirming USDC approval inside wallet...');
        const approveTx = await walletClient.writeContract({
          address: systemStatus.value.usdcAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [systemStatus.value.contractAddress, BigInt(requiredAllowance)]
        });
        modals.txPending(approveTx, 'Confirming USDC approval on-chain...');
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      modals.loading('Casting Arbitration Vote', 'Step 2 of 2: Confirming vote transaction inside wallet...');
      const tx = await walletClient.writeContract({
        address: systemStatus.value.contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'voteOnDispute',
        args: [BigInt(jobId), option]
      });
      closeModal();
      modals.txPending(tx, 'Submitting secure vote block details to consensus...');
      await publicClient.waitForTransactionReceipt({ hash: tx });

      closeModal();
      modals.success('Arbitration Vote Casted!', `Successfully submitted your vote: "${optionStr}" on Job #${jobId}. Thank you for securing the ecosystem!`);
      await fetchDisputeVotesStanding(jobId);
      await fetchUserBlockchainDetails();
    }
  } catch (e) {
    console.error('Voting failed:', e);
    closeModal();
    modals.error('Voting Failed', e.message || 'Transaction failed.');
  } finally {
    isSubmitting.value = false;
  }
}

async function resolveDispute(jobId) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your wallet first.');
    return;
  }

  isSubmitting.value = true;
  try {
    if (circleUserWallet.value) {
      modals.loading('Resolving Project Escrow', 'Processing temporary resolution (Gasless Sponsored)...');
      await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: systemStatus.value.contractAddress,
        abiFunctionSignature: 'resolveDispute(uint256)',
        abiParameters: [jobId.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });

      closeModal();
      modals.success('Temporary Resolution Decided!', `Job #${jobId} is temporarily resolved. A 1-hour appeal challenge window is now open.`);
      await loadJobsFromLocalDb();
    } else {
      modals.loading('Resolving Project Escrow', 'Confirming resolution transaction inside wallet...');
      const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
      const walletClient = createWalletClient({
        account: userAddress.value,
        chain: arcTestnet,
        transport: custom(getProvider())
      });

      const tx = await walletClient.writeContract({
        address: systemStatus.value.contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'resolveDispute',
        args: [BigInt(jobId)]
      });

      closeModal();
      modals.txPending(tx, 'Executing temporary resolution block detail on-chain...');
      await publicClient.waitForTransactionReceipt({ hash: tx });

      closeModal();
      modals.success('Temporary Resolution Decided!', `Job #${jobId} is temporarily resolved. A 1-hour appeal challenge window is now open.`);
      await loadJobsFromLocalDb();
    }
  } catch (e) {
    console.error('Resolution failed:', e);
    closeModal();
    modals.error('Resolution Failed', e.message || 'Transaction failed.');
  } finally {
    isSubmitting.value = false;
  }
}

async function appealDispute(jobId) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your wallet first.');
    return;
  }

  const job = jobsList.value.find(j => j.id === jobId);
  if (!job) return;

  const currentTier = job.dispute?.appealTier || 0;
  if (currentTier >= 2) {
    modals.error('Max Tier Reached', 'This dispute is already at the final appeal tier.');
    return;
  }

  const appealFee = currentTier === 0 ? 100 * 1e6 : 200 * 1e6;

  isSubmitting.value = true;
  modals.loading('Appealing Dispute', `Processing appeal fee of ${appealFee / 1e6} USDC...`);

  try {
    const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });

    // 1. Check/Sponsor Allowance
    const allowance = await publicClient.readContract({
      address: systemStatus.value.usdcAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [userAddress.value, systemStatus.value.contractAddress]
    });

    if (circleUserWallet.value) {
      if (allowance < BigInt(appealFee)) {
        modals.loading('Appealing Dispute', 'Approving USDC for appeal fee (Gasless Sponsored)...');
        await executeSponsoredTransaction({
          walletId: circleUserWallet.value.id,
          contractAddress: systemStatus.value.usdcAddress,
          abiFunctionSignature: 'approve(address,uint256)',
          abiParameters: [systemStatus.value.contractAddress, appealFee.toString()],
          userToken: circleSessionToken.value,
          userAddress: userAddress.value,
          isSimulation: isSimulationMode.value,
          executeChallengeFn: executeChallenge
        });
      }

      modals.loading('Appealing Dispute', 'Submitting Appeal (Gasless Sponsored)...');
      await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: systemStatus.value.contractAddress,
        abiFunctionSignature: 'appealDispute(uint256)',
        abiParameters: [jobId.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
    } else {
      const walletClient = createWalletClient({
        account: userAddress.value,
        chain: arcTestnet,
        transport: custom(getProvider())
      });

      if (allowance < BigInt(appealFee)) {
        modals.loading('Appealing Dispute', 'Step 1 of 2: Confirming USDC approval in wallet...');
        const approveTx = await walletClient.writeContract({
          address: systemStatus.value.usdcAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [systemStatus.value.contractAddress, BigInt(appealFee)]
        });
        modals.txPending(approveTx, 'Confirming USDC approval on-chain...');
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      modals.loading('Appealing Dispute', 'Step 2 of 2: Confirming appeal transaction in wallet...');
      const tx = await walletClient.writeContract({
        address: systemStatus.value.contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'appealDispute',
        args: [BigInt(jobId)]
      });
      modals.txPending(tx, 'Submitting appeal to consensus...');
      await publicClient.waitForTransactionReceipt({ hash: tx });
    }

    closeModal();
    modals.success('Dispute Appealed Successfully', `Dispute on Job #${jobId} has been appealed to Tier ${currentTier + 1}. Voting is reopened.`);
    await loadJobsFromLocalDb();
    await fetchUserBlockchainDetails();
  } catch (e) {
    console.error('Appeal failed:', e);
    closeModal();
    modals.error('Appeal Failed', e.message || 'Transaction failed.');
  } finally {
    isSubmitting.value = false;
  }
}

async function executeRuling(jobId) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your wallet first.');
    return;
  }

  isSubmitting.value = true;
  modals.loading('Executing Ruling', 'Submitting final dispute execution...');

  try {
    if (circleUserWallet.value) {
      await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: systemStatus.value.contractAddress,
        abiFunctionSignature: 'executeRuling(uint256)',
        abiParameters: [jobId.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
    } else {
      const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
      const walletClient = createWalletClient({
        account: userAddress.value,
        chain: arcTestnet,
        transport: custom(getProvider())
      });
      const tx = await walletClient.writeContract({
        address: systemStatus.value.contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'executeRuling',
        args: [BigInt(jobId)]
      });
      modals.txPending(tx, 'Executing ruling on-chain...');
      await publicClient.waitForTransactionReceipt({ hash: tx });
    }

    closeModal();
    modals.success('Ruling Executed', `Escrow funds and juror rewards/slashes for Job #${jobId} have been fully settled.`);
    await loadJobsFromLocalDb();
    await fetchUserBlockchainDetails();
  } catch (e) {
    console.error('Execution failed:', e);
    closeModal();
    modals.error('Execution Failed', e.message || 'Transaction failed.');
  } finally {
    isSubmitting.value = false;
  }
}

async function resolveFinalAppeal(jobId, ruling) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your wallet first.');
    return;
  }

  const rulingLabels = { 1: 'Client Wins', 2: 'Freelancer Wins', 3: 'Split 50/50' };

  isSubmitting.value = true;
  modals.loading('Supreme Court Resolution', `Submitting platform final ruling: "${rulingLabels[ruling]}"...`);

  try {
    if (circleUserWallet.value) {
      await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: systemStatus.value.contractAddress,
        abiFunctionSignature: 'resolveFinalAppeal(uint256,uint8)',
        abiParameters: [jobId.toString(), ruling.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
    } else {
      const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
      const walletClient = createWalletClient({
        account: userAddress.value,
        chain: arcTestnet,
        transport: custom(getProvider())
      });
      const tx = await walletClient.writeContract({
        address: systemStatus.value.contractAddress,
        abi: GIGMARKET_ESCROW_ABI,
        functionName: 'resolveFinalAppeal',
        args: [BigInt(jobId), ruling]
      });
      modals.txPending(tx, 'Resolving final appeal on-chain...');
      await publicClient.waitForTransactionReceipt({ hash: tx });
    }

    closeModal();
    modals.success('Final Appeal Resolved', `The platform Supreme Court has ruled: "${rulingLabels[ruling]}" on Job #${jobId}. Funds and slanders have been executed.`);
    await loadJobsFromLocalDb();
    await fetchUserBlockchainDetails();
  } catch (e) {
    console.error('Final appeal resolution failed:', e);
    closeModal();
    modals.error('Resolution Failed', e.message || 'Transaction failed.');
  } finally {
    isSubmitting.value = false;
  }
}

function openAppealModal(jobId) {
  appealJobId.value = jobId;
  showAppealModal.value = true;
}

function confirmAppeal() {
  const jobId = appealJobId.value;
  showAppealModal.value = false;
  appealDispute(jobId);
}

function getRulingLabel(ruling) {
  if (ruling === 1) return 'Client Wins';
  if (ruling === 2) return 'Freelancer Wins';
  if (ruling === 3) return 'Split 50/50';
  return 'Pending';
}

function formatDeadline(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

function isAppealWindowClosed(job) {
  if (!job.dispute || !job.dispute.appealDeadline) return true;
  return Date.now() > job.dispute.appealDeadline * 1000;
}

// --- AUTOMATED GIT MERGE PAYOUT SIMULATOR (Feature B) ---

async function simulatePrMerge(jobId) {
  const milestoneIndex = simulatedMilestoneIndex.value[jobId];
  if (milestoneIndex === undefined) return;

  isSimulating.value[jobId] = true;
  modals.loading('Simulating Git Merge Webhook', `Sending simulated GitHub Pull Request Merge hook for Job #${jobId}, Milestone #${milestoneIndex + 1}...`);
  try {
    console.log(`Triggering webhook simulator for Job #${jobId}, Milestone ${milestoneIndex}`);
    const response = await $fetch('/api/github-webhook', {
      method: 'POST',
      body: {
        isSimulation: true,
        jobId,
        milestoneIndex
      }
    });

    closeModal();
    if (response.error) {
      modals.error('Simulation Failed', response.error);
    } else {
      const job = jobsList.value.find(j => j.id === jobId);
      const isEurc = job && job.payoutCurrency === 'EURC';
      const msg = isEurc
        ? `Autonomous integration verified! GitHub triggered automatic escrow payout release on Arc Testnet via Circle StableFX. Swapped USDC and settled EURC in freelancer's wallet.\n\nMode: ${response.mode}\nTx Hash: ${response.txHash.slice(0, 18) + '...'}`
        : `Autonomous integration verified! GitHub triggered automatic escrow payout release on Arc Testnet.\n\nMode: ${response.mode}\nTx Hash: ${response.txHash.slice(0, 18) + '...'}`;
      modals.success(
        isEurc ? 'Git PR Merge: StableFX Swap Payout!' : 'Git PR Merge Detected!',
        msg
      );
      await loadJobsFromLocalDb();
      await fetchUserBlockchainDetails();
      await fetchSystemStatus();
    }
  } catch (e) {
    console.error('Simulation error:', e);
    closeModal();
    modals.error('Simulation API Error', e.message || 'The webhook emulator returned an invalid response.');
  } finally {
    isSimulating.value[jobId] = false;
  }
}

// --- CIRCLE APP KIT DEMOS ---

async function executeAppKitSwap() {
  if (!circleUserWallet.value && !getProvider()) {
    modals.warning('Wallet Provider Missing', 'Please connect a wallet first to interact with Circle App-Kit.');
    return;
  }
  isSubmitting.value = true;
  modals.loading('Initiating Swap', `Swapping ${swapForm.value.amountIn} USDC to EURC via Circle App Kit...`);
  try {
    console.log(`Executing App Kit Swap: ${swapForm.value.amountIn} USDC -> EURC`);
    
    if (circleUserWallet.value) {
      const usdcUnits = parseUnits(swapForm.value.amountIn.toString(), 6);
      
      // Step 1: Approve
      console.log(`[Circle UCW Swap] Step 1/2: Approving USDC spend of ${usdcUnits.toString()} for router...`);
      modals.loading('Initiating Swap', `Step 1/2: Approving USDC spending... (PIN challenge required)`);
      
      const approveRes = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: USDC_TOKEN_ADDRESS,
        abiFunctionSignature: 'approve(address,uint256)',
        abiParameters: [STABLE_FX_ROUTER_ADDRESS, usdcUnits.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
      
      console.log('[Circle UCW Swap] Step 1/2 Approve result:', approveRes);
      
      if (!approveRes.success) {
        throw new Error('Approval transaction failed');
      }

      // Dismiss Step 1 loading modal before proceeding to Step 2
      closeModal();

      // Short delay to ensure nonce updates
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Swap
      console.log(`[Circle UCW Swap] Step 2/2: Executing swap swap(tokenIn, tokenOut, amountIn, minAmountOut, recipient)...`);
      modals.loading('Executing Swap', `Step 2/2: Exchanging USDC to EURC... (PIN challenge required)`);
      
      const swapRes = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: STABLE_FX_ROUTER_ADDRESS,
        abiFunctionSignature: 'swap(address,address,uint256,uint256,address)',
        abiParameters: [USDC_TOKEN_ADDRESS, EURC_TOKEN_ADDRESS, usdcUnits.toString(), '0', userAddress.value],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
      
      console.log('[Circle UCW Swap] Step 2/2 Swap result:', swapRes);
      
      if (!swapRes.success) {
        throw new Error('Swap transaction execution failed');
      }

      closeModal();
      modals.success('Swap Completed!', `Circle User-Controlled Wallet swap executed successfully!\nTx Hash: ${swapRes.txHash || 'Success'}`);
      await fetchUserBlockchainDetails();
      return;
    }

    // Dynamic import to avoid SSR errors
    const { AppKit } = await import('@circle-fin/app-kit');
    const { createViemAdapterFromProvider } = await import('@circle-fin/adapter-viem-v2');
    
    const adapter = await createViemAdapterFromProvider({
      provider: getProvider(),
    });
    
    const kit = new AppKit();
    const kitKeyVal = systemStatus.value.kitKey || 'your_kit_key_here';
    
    const result = await kit.swap({
      from: { adapter, chain: "Arc_Testnet" },
      tokenIn: "USDC",
      tokenOut: "EURC",
      amountIn: swapForm.value.amountIn.toString(),
      config: {
        kitKey: kitKeyVal,
      },
    });
    
    console.log('App Kit Swap execution result:', result);
    closeModal();
    modals.success('Swap Completed!', `Circle App Kit swap executed successfully!\nTx Hash: ${result.txHash || 'Success'}`);
    await fetchUserBlockchainDetails();
  } catch (e) {
    console.error('App Kit Swap execution failed:', e);
    closeModal();
    handleError(e, executeAppKitSwap);
  } finally {
    isSubmitting.value = false;
  }
}

async function executeAppKitSend() {
  if (!circleUserWallet.value && !getProvider()) {
    modals.warning('Wallet Provider Missing', 'Please connect a wallet first to interact with Circle App-Kit.');
    return;
  }
  isSubmitting.value = true;
  modals.loading('Initiating Stablecoin Send', `Sending ${sendForm.value.amount} USDC to ${sendForm.value.recipient} using Circle App Kit...`);
  try {
    console.log(`Executing App Kit Send: ${sendForm.value.amount} USDC to ${sendForm.value.recipient}`);
    
    if (circleUserWallet.value) {
      const usdcUnits = parseUnits(sendForm.value.amount.toString(), 6);
      const result = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: USDC_TOKEN_ADDRESS,
        abiFunctionSignature: 'transfer(address,uint256)',
        abiParameters: [sendForm.value.recipient, usdcUnits.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
      console.log('Circle UCW gasless transfer result:', result);
      closeModal();
      modals.success('Transfer Successful!', `Circle User-Controlled Wallet stablecoin send completed successfully!\nTx Hash: ${result.txHash || 'Success'}`);
      await fetchUserBlockchainDetails();
      return;
    }

    // Dynamic import to avoid SSR errors
    const { AppKit } = await import('@circle-fin/app-kit');
    const { createViemAdapterFromProvider } = await import('@circle-fin/adapter-viem-v2');
    
    const adapter = await createViemAdapterFromProvider({
      provider: getProvider(),
    });
    
    const kit = new AppKit();
    const result = await kit.send({
      from: { adapter, chain: "Arc_Testnet" },
      to: sendForm.value.recipient,
      amount: sendForm.value.amount.toString(),
      token: "USDC",
    });
    
    console.log('App Kit Send execution result:', result);
    closeModal();
    modals.success('Transfer Successful!', `Circle App Kit stablecoin send completed successfully!\nTx Hash: ${result.txHash || 'Success'}`);
    await fetchUserBlockchainDetails();
  } catch (e) {
    console.error('App Kit Send execution failed:', e);
    closeModal();
    handleError(e, executeAppKitSend);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
