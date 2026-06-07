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
          <span class="rainbow-connected-balance">{{ userUsdcBalance }} USDC</span>
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

        <!-- Sub Tab Navigation links inside the Portal view -->
        <div class="nav-links" style="display: inline-flex; gap: 8px; margin-bottom: 24px; padding: 4px; border: var(--border-width) solid var(--border-color); border-radius: var(--border-radius-sm);">
          <span class="nav-link" :class="{ active: currentTab === 'client' }" @click="currentTab = 'client'">Client Portal</span>
          <span class="nav-link" :class="{ active: currentTab === 'freelancer' }" @click="currentTab = 'freelancer'">Freelancer Portal</span>
          <span class="nav-link" :class="{ active: currentTab === 'jury' }" @click="currentTab = 'jury'">Jury Board</span>
          <span class="nav-link" :class="{ active: currentTab === 'appkit' }" @click="currentTab = 'appkit'">App Kit Center</span>
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

              <!-- Milestones Input Fields -->
              <div v-if="newJob.milestones.length > 0" style="margin-top: 15px;">
                <h4 style="font-size: 14px; margin-bottom: 10px; color: var(--accent-teal-dark);">Setup Milestones Budgets</h4>
                <div v-for="(m, i) in newJob.milestones" :key="i" class="form-row" style="margin-bottom: 10px;">
                  <input v-model="m.title" type="text" class="form-input" placeholder="Milestone Title" required />
                  <input v-model.number="m.budget" type="number" class="form-input" placeholder="Budget USDC" required />
                </div>
              </div>

              <div style="margin-top: 24px;">
                <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="isSubmitting">
                  <span v-if="isSubmitting">Funding Escrow...</span>
                  <span v-else>Approve & Post Job</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Right: Posted Gigs List -->
          <div class="glass-panel">
            <h3 style="margin-bottom: 20px; color: var(--text-primary);">Your Posted Gigs</h3>
            <div v-if="loadingJobs" class="shimmer-bg" style="height: 200px; border-radius: var(--border-radius-md);"></div>
            <div v-else-if="clientJobs.length === 0" style="text-align: center; padding: 40px; color: var(--text-secondary);">
              No jobs posted yet. Create your first freelance gig on Arc Testnet!
            </div>
            <div v-else class="gigs-grid" style="grid-template-columns: 1fr;">
              <div v-for="job in clientJobs" :key="job.id" class="glass-panel" style="background: var(--bg-primary); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                <div class="gig-card-header">
                  <div>
                    <h4 class="gig-title">{{ job.title }}</h4>
                    <span style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Job ID: #{{ job.id }} | Repo: {{ job.repoUrl }}</span>
                  </div>
                  <span class="badge" :class="'badge-' + job.status.toLowerCase()">{{ job.status }}</span>
                </div>
                <p class="gig-desc">{{ job.description }}</p>
                <div class="gig-meta">
                  <div class="gig-meta-item">
                    <span class="gig-meta-label">Total Budget</span>
                    <span class="gig-meta-value">{{ job.budget }} USDC</span>
                  </div>
                  <div class="gig-meta-item">
                    <span class="gig-meta-label">Freelancer</span>
                    <span class="gig-meta-value">{{ job.freelancer === '0x0000000000000000000000000000000000000000' ? 'Open for bids' : shortAddress(job.freelancer) }}</span>
                  </div>
                  <div class="gig-meta-item">
                    <span class="gig-meta-label">Required Stake</span>
                    <span class="gig-meta-value">{{ job.requiredStake }} USDC</span>
                  </div>
                </div>

                <!-- Milestones checklist -->
                <div style="margin-top: 15px;">
                  <h5 style="font-size: 13px; margin-bottom: 8px; color: var(--accent-teal-dark);">Milestones Details</h5>
                  <div v-for="(m, idx) in job.milestones" :key="idx" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--bg-secondary); border: 1.5px solid var(--border-color); margin-bottom: 6px; border-radius: 8px;">
                    <span style="font-size: 14px; font-weight: 600;">{{ idx + 1 }}. {{ m.title }} ({{ m.budget }} USDC)</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span v-if="m.approved" class="badge badge-completed" style="font-size: 10px; padding: 2px 8px;">Paid</span>
                      <button v-else-if="job.status === 'Active' && job.currentMilestone == idx" class="btn btn-primary btn-small" style="padding: 4px 10px; border-radius: 6px;" @click="payoutMilestone(job.id, idx)">
                        Release Payout
                      </button>
                      <span v-else style="font-size: 12px; color: var(--text-secondary);">Locked</span>
                    </div>
                  </div>
                </div>

                <div v-if="job.status === 'Active'" style="margin-top: 15px; display: flex; justify-content: flex-end;">
                  <button class="btn btn-danger btn-small" @click="raiseDispute(job.id)">Raise Dispute</button>
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
                      <h4 class="gig-title">{{ job.title }}</h4>
                      <span style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Repo: {{ job.repoUrl }}</span>
                    </div>
                    <span class="badge badge-created">Open</span>
                  </div>
                  <p class="gig-desc">{{ job.description }}</p>
                  <div class="gig-meta">
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Budget</span>
                      <span class="gig-meta-value" style="color: var(--accent-teal-dark);">{{ job.budget }} USDC</span>
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
                  <div style="display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary btn-small" @click="joinGig(job)" :disabled="isSubmitting">
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
                      <h4 class="gig-title">{{ job.title }}</h4>
                      <span style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">Repo: {{ job.repoUrl }}</span>
                    </div>
                    <span class="badge" :class="'badge-' + job.status.toLowerCase()">{{ job.status }}</span>
                  </div>
                  <p class="gig-desc">{{ job.description }}</p>
                  <div class="gig-meta">
                    <div class="gig-meta-item">
                      <span class="gig-meta-label">Project Budget</span>
                      <span class="gig-meta-value">{{ job.budget }} USDC</span>
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

                  <!-- Simulate PR merge (Feature B) -->
                  <div v-if="job.status === 'Active'" style="border: 2px dashed var(--border-color); border-radius: var(--border-radius-sm); padding: 16px; background: var(--bg-secondary); margin-top: 15px; box-shadow: 3px 3px 0px var(--border-color);">
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

                  <div v-if="job.status === 'Active'" style="margin-top: 15px; display: flex; justify-content: flex-end;">
                    <button class="btn btn-danger btn-small" @click="raiseDispute(job.id)">Raise Dispute</button>
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
                <div style="margin-top: 20px; padding: 16px; background: var(--bg-secondary); border-radius: var(--border-radius-sm); border: 2px solid var(--border-color); box-shadow: 2px 2px 0px var(--border-color);">
                  <h5 style="font-size: 14px; margin-bottom: 12px;">Jury Vote Cast (Current Standings)</h5>
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

                <!-- Executable Action -->
                <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
                  <button class="btn btn-accent btn-small" @click="resolveDispute(job.id)" :disabled="isSubmitting">
                    Resolve & Distribute Escrow
                  </button>
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
                <h4 class="wallet-status-title">Requesting Connection</h4>
                <p class="wallet-status-desc">Please accept the connection request in your browser extension to proceed.</p>
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
                <div class="wallet-qr-code">
                  <svg viewBox="0 0 100 100" width="120" height="120" style="fill: #1A1A1A;">
                    <rect x="0" y="0" width="20" height="20" />
                    <rect x="80" y="0" width="20" height="20" />
                    <rect x="0" y="80" width="20" height="20" />
                    <rect x="40" y="20" width="10" height="10" />
                    <rect x="60" y="40" width="20" height="10" />
                    <rect x="20" y="60" width="10" height="20" />
                    <rect x="50" y="80" width="20" height="10" />
                  </svg>
                </div>
                <h4 class="wallet-status-title">Scan with Rainbow</h4>
                <p class="wallet-status-desc">Open the Rainbow mobile app and scan the QR code to connect instantly.</p>
              </div>

              <!-- Coinbase Wallet view -->
              <div v-else-if="selectedWallet === 'coinbase'">
                <div style="width: 80px; height: 80px; margin: 0 auto 16px;">
                  <svg viewBox="0 0 32 32" width="80" height="80">
                    <circle cx="16" cy="16" r="13" fill="#0052FF" />
                    <rect x="9" y="9" width="14" height="14" rx="2" fill="#FFFFFF" />
                  </svg>
                </div>
                <h4 class="wallet-status-title">Coinbase Wallet</h4>
                <p class="wallet-status-desc">Sign in using Coinbase Wallet browser extension or connect via the mobile application.</p>
                <button class="btn btn-primary" @click="triggerBrowserConnection">Connect Extension</button>
              </div>

              <!-- WalletConnect view -->
              <div v-else-if="selectedWallet === 'walletconnect'">
                <div class="wallet-qr-code">
                  <svg viewBox="0 0 100 100" width="120" height="120" style="fill: #3B99FC;">
                    <rect x="0" y="0" width="20" height="20" />
                    <rect x="80" y="0" width="20" height="20" />
                    <rect x="0" y="80" width="20" height="20" />
                    <rect x="30" y="30" width="20" height="20" />
                    <rect x="60" y="60" width="20" height="10" />
                    <rect x="20" y="10" width="10" height="10" />
                    <rect x="70" y="20" width="10" height="10" />
                  </svg>
                </div>
                <h4 class="wallet-status-title">Scan QR Code</h4>
                <p class="wallet-status-desc">Scan with any WalletConnect-compatible wallet to establish session.</p>
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

      <!-- Universal Centralized Modal Overlay -->
      <div v-if="activeModal" class="wallet-modal-overlay" @click.self="handleBackdropClick" :style="{ pointerEvents: activeModal.preventClose ? 'none' : 'auto' }">
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

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { createPublicClient, createWalletClient, http, custom, parseUnits, formatUnits } from 'viem';
import { 
  GIGMARKET_ESCROW_ABI, 
  ERC20_ABI, 
  USDC_TOKEN_ADDRESS, 
  EURC_TOKEN_ADDRESS 
} from './utils/contract';
import { activeModal, closeModal, modals, handleError } from './utils/modals';
import {
  circleUserWallet,
  circleSessionToken,
  circleEncryptionKey,
  circleAppId,
  circleUserId,
  isSimulationMode,
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

const circleEmail = ref('');
const showPinScreen = ref(false);
const pinCode = ref('');
const activeChallengeId = ref('');
const tempSessionData = ref(null);
const isInitializingWallet = ref(false);

const currentTab = ref('client');
const freelancerSubTab = ref('browse');

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

// States
const userAddress = ref('');
const freelancerReputation = ref(0);
const userIsJuror = ref(false);
const systemStatus = ref({});
const isSystemLoading = ref(true);
const loadingJobs = ref(true);
const isSubmitting = ref(false);

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
      await fetchUserBlockchainDetails();
      closeWalletModal();
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
      // Re-fetch wallets via session API
      const response = await $fetch('/api/circle-wallet-session', {
        method: 'POST',
        body: { userId: circleEmail.value }
      });
      if (response.success && response.wallets && response.wallets.length > 0) {
        wallet = response.wallets[0];
      } else {
        throw new Error('Wallet not found after initialization challenge');
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
  }
}

function openConnectedModal() {
  isConnectedModalOpen.value = true;
  copyStatusText.value = 'Copy';
}

function closeConnectedModal() {
  isConnectedModalOpen.value = false;
}

function disconnectWallet() {
  userAddress.value = '';
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
  milestones: [{ title: 'Milestone 1', budget: 100 }]
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
const disputedJobs = computed(() => jobsList.value.filter(j => j.status === 'Disputed'));

// On Mount
onMounted(async () => {
  await fetchSystemStatus();
  await loadJobsFromLocalDb();

  // 1. Check for persisted Circle User Wallet first
  checkPersistedWallet();
  if (circleUserWallet.value) {
    userAddress.value = circleUserWallet.value.address;
    await fetchUserBlockchainDetails();
  } else if (window.ethereum) {
    // 2. Fall back to browser extension auto-connect
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        userAddress.value = accounts[0];
        await fetchUserBlockchainDetails();
      }
    } catch (e) {
      console.error('Auto connection failed:', e);
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
    jobsList.value = jobs;
    
    // Auto populate simulated milestone selections
    jobs.forEach(job => {
      simulatedMilestoneIndex.value[job.id] = 0;
      isSimulating.value[job.id] = false;
      
      // Load active dispute stands if disputed
      if (job.status === 'Disputed') {
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

async function triggerBrowserConnection() {
  if (!window.ethereum) {
    walletConnectionError.value = 'No EVM browser extension detected. Please install MetaMask or Coinbase Wallet.';
    return;
  }
  isConnectingWallet.value = true;
  walletConnectionError.value = '';
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userAddress.value = accounts[0];
    await fetchUserBlockchainDetails();
    closeWalletModal();
  } catch (e) {
    console.error('Wallet connection error:', e);
    walletConnectionError.value = e.message || 'User rejected connection request.';
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

  const contractAddress = systemStatus.value.contractAddress;
  const usdcUnits = parseUnits(newJob.value.budget.toString(), 6);
  const milestoneBudgets = newJob.value.milestones.map(m => parseUnits(m.budget.toString(), 6));
  const milestoneTitles = newJob.value.milestones.map(m => m.title);

  if (circleUserWallet.value) {
    isSubmitting.value = true;
    try {
      // 1. Approve USDC transfer via Sponsored Transaction
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
      
      // 2. Create Job via Sponsored Transaction
      closeModal();
      modals.loading('Funding Escrow Job', 'Step 2 of 2: Securing project budget in escrow. Processing (Gasless Sponsored Transaction)...');
      
      const createRes = await executeSponsoredTransaction({
        walletId: circleUserWallet.value.id,
        contractAddress: contractAddress,
        abiFunctionSignature: 'createJob(uint256,string,uint256[],string[])',
        abiParameters: [
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
      
      // Post to db
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
      transport: custom(window.ethereum)
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
    
    const createTx = await walletClient.writeContract({
      address: contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'createJob',
      args: [usdcUnits, newJob.value.repoUrl, milestoneBudgets, milestoneTitles]
    });
    
    closeModal();
    modals.txPending(createTx, 'Publishing job escrow and locking USDC gasless pools. Awaiting block receipt...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash: createTx });

    // Read emitted Job ID from events or fetch jobCount
    const jobCount = await publicClient.readContract({
      address: contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'jobCount'
    });
    const jobIdVal = parseInt(jobCount.toString());

    // 3. Post to backend JSON database to persist
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
        abiFunctionSignature: 'joinJob(uint256)',
        abiParameters: [job.id.toString()],
        userToken: circleSessionToken.value,
        userAddress: userAddress.value,
        isSimulation: isSimulationMode.value,
        executeChallengeFn: executeChallenge
      });
      const joinResult = joinRes;

      const updatedJob = {
        ...job,
        status: 'Active',
        freelancer: userAddress.value,
        requiredStake: requiredStakeVal,
        freelancerStake: requiredStakeVal
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
      transport: custom(window.ethereum)
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
    
    const joinTx = await walletClient.writeContract({
      address: contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'joinJob',
      args: [BigInt(job.id)]
    });
    
    closeModal();
    modals.txPending(joinTx, 'Registering your address as project freelancer. locking security collateral...');
    await publicClient.waitForTransactionReceipt({ hash: joinTx });

    // 3. Post updates to local db
    const updatedJob = {
      ...job,
      status: 'Active',
      freelancer: userAddress.value,
      requiredStake: requiredStakeVal,
      freelancerStake: requiredStakeVal
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

  const contractAddress = systemStatus.value.contractAddress;

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
      modals.success('Milestone Payout Disbursed!', `Successfully transferred milestone funds to the freelancer's wallet and unlocked proportional staking collateral!`);
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
      transport: custom(window.ethereum)
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
    modals.success('Milestone Payout Disbursed!', `Successfully transferred milestone funds to the freelancer's wallet and unlocked proportional staking collateral!`);
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
          transport: custom(window.ethereum)
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
      transport: custom(window.ethereum)
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

  if (circleUserWallet.value) {
    isSubmitting.value = true;
    modals.loading('Casting Arbitration Vote', `Processing (Gasless Sponsored Transaction)...`);
    try {
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
    } catch (e) {
      console.error('Circle vote failed:', e);
      closeModal();
      modals.error('Voting Failed', e.message || 'Circle transaction failed.');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  isSubmitting.value = true;
  modals.loading('Casting Arbitration Vote', `Voting option: "${optionStr}" for Job #${jobId}. Confirming signature request...`);
  
  try {
    const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
    const walletClient = createWalletClient({
      account: userAddress.value,
      chain: arcTestnet,
      transport: custom(window.ethereum)
    });

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
  } catch (e) {
    console.error('Voting failed:', e);
    closeModal();
    handleError(e, () => voteDispute(jobId, option));
  } finally {
    isSubmitting.value = false;
  }
}

async function resolveDispute(jobId) {
  if (!userAddress.value) {
    modals.warning('Wallet Disconnected', 'Please connect your wallet first.');
    return;
  }

  if (circleUserWallet.value) {
    isSubmitting.value = true;
    modals.loading('Resolving Project Escrow', `Processing (Gasless Sponsored Transaction)...`);
    try {
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

      const job = jobsList.value.find(j => j.id === jobId);
      const updatedJob = { ...job, status: 'Resolved' };
      
      await $fetch('/api/jobs', {
        method: 'POST',
        body: updatedJob
      });

      closeModal();
      modals.success('Escrow Dispute Resolved!', `Securely settled Job #${jobId}. Funds and juror reputation incentives have been completely disbursed!`);
      await loadJobsFromLocalDb();
    } catch (e) {
      console.error('Circle dispute resolution failed:', e);
      closeModal();
      modals.error('Resolution Failed', e.message || 'Circle transaction failed.');
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  isSubmitting.value = true;
  modals.loading('Resolving Project Escrow', `Compiling consensus votes and executing payouts for Job #${jobId}...`);
  try {
    const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
    const walletClient = createWalletClient({
      account: userAddress.value,
      chain: arcTestnet,
      transport: custom(window.ethereum)
    });

    const tx = await walletClient.writeContract({
      address: systemStatus.value.contractAddress,
      abi: GIGMARKET_ESCROW_ABI,
      functionName: 'resolveDispute',
      args: [BigInt(jobId)]
    });
    
    closeModal();
    modals.txPending(tx, 'Distributing locked stablecoins and juror staking incentives. Please wait...');
    await publicClient.waitForTransactionReceipt({ hash: tx });

    // Update status in local DB
    const job = jobsList.value.find(j => j.id === jobId);
    const updatedJob = { ...job, status: 'Resolved' };
    
    await $fetch('/api/jobs', {
      method: 'POST',
      body: updatedJob
    });

    closeModal();
    modals.success('Escrow Dispute Resolved!', `Securely settled Job #${jobId}. Funds and juror reputation incentives have been completely disbursed!`);
    await loadJobsFromLocalDb();
  } catch (e) {
    console.error('Resolution failed:', e);
    closeModal();
    handleError(e, () => resolveDispute(jobId));
  } finally {
    isSubmitting.value = false;
  }
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
      modals.success(
        'Git PR Merge Detected!',
        `Autonomous integration verified! Github triggered automatic escrow payout release on Arc Testnet.\n\nMode: ${response.mode}\nTx Hash: ${response.txHash.slice(0, 18) + '...'}`
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
  if (!window.ethereum) {
    modals.warning('EVM Extension Missing', 'Please install MetaMask or another EVM wallet extension first to interact with Circle App-Kit.');
    return;
  }
  isSubmitting.value = true;
  modals.loading('Initiating Swap', `Swapping ${swapForm.value.amountIn} USDC to EURC via Circle App Kit...`);
  try {
    console.log(`Executing App Kit Swap: ${swapForm.value.amountIn} USDC -> EURC`);
    // Dynamic import to avoid SSR errors
    const { AppKit } = await import('@circle-fin/app-kit');
    const { createViemAdapterFromProvider } = await import('@circle-fin/adapter-viem-v2');
    
    const adapter = await createViemAdapterFromProvider({
      provider: window.ethereum,
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
  if (!window.ethereum) {
    modals.warning('EVM Extension Missing', 'Please install MetaMask or another EVM wallet extension first to interact with Circle App-Kit.');
    return;
  }
  isSubmitting.value = true;
  modals.loading('Initiating Stablecoin Send', `Sending ${sendForm.value.amount} USDC to ${sendForm.value.recipient} using Circle App Kit...`);
  try {
    console.log(`Executing App Kit Send: ${sendForm.value.amount} USDC to ${sendForm.value.recipient}`);
    // Dynamic import to avoid SSR errors
    const { AppKit } = await import('@circle-fin/app-kit');
    const { createViemAdapterFromProvider } = await import('@circle-fin/adapter-viem-v2');
    
    const adapter = await createViemAdapterFromProvider({
      provider: window.ethereum,
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
