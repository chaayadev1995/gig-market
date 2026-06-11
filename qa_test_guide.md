# Hướng dẫn QA/Test toàn bộ Website GigMarket (QA/Test Playbook)

Tài liệu này cung cấp các bước thiết lập, khởi chạy dự án từ đầu và checklist kiểm thử chi tiết theo từng luồng sử dụng thực tế của GigMarket trên mạng thử nghiệm Arc Testnet.

---

## I. HƯỚNG DẪN KHỞI ĐỘNG DỰ ÁN

### 1. Yêu cầu cài đặt
* **Node.js**: Phiên bản `v20.x` hoặc `v22.x`.
* **npm**: Phiên bản `v10.x` trở lên.
* **MetaMask Extension**: Cấu hình sẵn mạng **Arc Testnet**:
  * *Network name*: `Arc Testnet`
  * *New RPC URL*: `https://rpc.testnet.arc.network`
  * *Chain ID*: `5042002`
  * *Currency symbol*: `USDC`
  * *Explorer URL*: `https://testnet.arcscan.app`

### 2. Cấu hình tệp `.env`
Tạo hoặc cập nhật tệp `.env` tại thư mục gốc của dự án với nội dung mẫu sau:
```env
# Khóa cá nhân ví của Deployer (bắt đầu bằng 0x)
PRIVATE_KEY="0xab36f14aa3ee9f3d8b9ae51ef9322ec82fd3277a977d880c29203695b0966295"

# Circle API Key và Entity Secret (Lấy từ Circle Developer Console)
CIRCLE_API_KEY="TEST_API_KEY:500ecf2c831cf3c39b7404d80ec0e533:0534a20fb0f85760d2257d922ef68f66"
CIRCLE_ENTITY_SECRET="6307ee1741379e05453dd8d7ebe79eb073d37a9595c3140e97dd47bc552dd437"

# ID và Địa chỉ ví Developer-Controlled Wallet của hệ thống
CIRCLE_WALLET_ID="bb89d02d-7514-5f82-87f4-0573f172ca6a"
CIRCLE_WALLET_ADDRESS="0xe2ee8bd8bf3b5ec3ccbf4bbdb96e093708437b59"

# Mã khóa GitHub Webhook & App Kit Key
GITHUB_WEBHOOK_SECRET="b7f04590a0c43f74814349be73280253e3c8f6b2"
KIT_KEY="KIT_KEY:6dbbc134025d0382a8a16632589cec0f:f8d89fcf8873656bc9e2c0e905966724"

# Địa chỉ Paymaster tài trợ gas của Circle
CIRCLE_PAYMASTER_ADDRESS="0x0000000071727E5C77c03C68673752c289654e53"
CIRCLE_PAYMASTER_POLICY_ID="policy_08e46345-4a06-5908-82b9-b9b511624bc6"
```

### 3. Chuẩn bị tài khoản test và dữ liệu mẫu
* Chuẩn bị tối thiểu 3 ví MetaMask đại diện cho 3 vai trò:
  * **Client (Người thuê)**
  * **Freelancer (Người làm)**
  * **Juror (Trọng tài)**
* Truy cập `https://faucet.circle.com/`, chọn mạng **Arc Testnet** và yêu cầu vòi nước (Faucet) cấp token USDC vào cả 3 ví trên và ví hệ thống `CIRCLE_WALLET_ADDRESS` (mỗi ví khoảng 50 - 100 USDC).

### 4. Lệnh chạy dự án
Mở Terminal tại thư mục dự án và chạy các lệnh sau:
```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Biên dịch mã nguồn Smart Contract
npm run compile

# 3. Triển khai Smart Contract lên mạng Arc Testnet
npm run deploy

# 4. Khởi chạy server phát triển
npm run dev
```

### 5. Xác nhận hệ thống chạy thành công
* Server khởi chạy không lỗi và in ra dòng: `Local: http://localhost:3000/`.
* Tệp `db/contract-address.json` được sinh tự động và lưu trữ chính xác địa chỉ hợp đồng đã triển khai.
* Truy cập `http://localhost:3000/` hiển thị trang chủ của GigMarket cùng với thanh menu điều hướng.

---

## II. CHECKLIST KIỂM THỬ THEO LUỒNG NGƯỜI DÙNG

### Flow 1: Connect Wallet
* **Trang**: Home (hoặc bất kỳ trang nào)
* **Bước 1**: Truy cập `http://localhost:3000/`.
* **Bước 2**: Click chọn "Connect Wallet" ở góc trên bên phải.
* **Bước 3**: Chọn ví "MetaMask".
* **Bước 4**: Xác nhận kết nối trên popup ví MetaMask.
* **Kết quả mong đợi**: Kết nối thành công, hiển thị địa chỉ ví rút gọn và số dư ví EVM.

---

### Flow 2: Create/Authenticate User-Controlled Wallet (Circle DCW)
* **Trang**: Home (hoặc bất kỳ trang nào)
* **Bước 1**: Click chọn "Connect Wallet" ở góc trên bên phải.
* **Bước 2**: Trong danh sách ví bên trái, chọn mục "Email / Social".
* **Bước 3**: Nhập Email bất kỳ (ví dụ: `tester123@gmail.com`) và click "Sign In with Email".
* **Bước 4**: Click button "Launch Secure PIN Setup".
* **Bước 5**: Nhập mã PIN 6 chữ số và xác nhận PIN trên popup bảo mật của Circle.
* **Kết quả mong đợi**: Tạo ví Circle thành công, hiển thị địa chỉ ví Circle và thông báo hoàn tất.

---

### Flow 3: Deposit to Gateway Channel (Gateway Deposit)
* **Trang**: App Kit Center (mục Gateway Nanopayments)
* **Bước 1**: Kết nối ví MetaMask của Client.
* **Bước 2**: Nhập số lượng nạp (ví dụ: `5` USDC) vào ô "Deposit Amount".
* **Bước 3**: Click button "Deposit to Gateway".
* **Bước 4**: Xác nhận giao dịch Approve và Deposit trong cửa sổ ví MetaMask.
* **Kết quả mong đợi**: Modal hiện "Deposit Successful", số dư "Gateway Balance" tăng 5 USDC.

---

### Flow 4: Simulating Github Push (Git-Triggered Auto-Payout)
* **Trang**: App Kit Center (mục x402 Simulator)
* **Bước 1**: Thực hiện Flow 3 để đảm bảo Gateway Balance > 0.
* **Bước 2**: Chọn Gig đang hoạt động ở trạng thái `Active` từ danh sách.
* **Bước 3**: Click button "Simulate Push Commit (Git Webhook)".
* **Kết quả mong đợi**: Thông báo "Git PR Merge Detected!" hiển thị, milestone tự động duyệt và giải ngân.

---

### Flow 5: Withdraw Micropayments from Gateway Channel (Gateway Withdrawal)
* **Trang**: App Kit Center (mục Gateway Nanopayments)
* **Bước 1**: Kết nối ví MetaMask của Freelancer.
* **Bước 2**: Xác nhận số dư "Realtime Streaming Earnings" hoặc "Accumulated Micropayments" > 0.
* **Bước 3**: Click button "Withdraw Micropayments".
* **Bước 4**: Xác nhận giao dịch chuyển tiền trên ví MetaMask.
* **Kết quả mong đợi**: Số dư tích lũy giảm về 0, số dư ví MetaMask Freelancer tăng lên tương ứng.

---

### Flow 6: Post a Standard Job (Create Job Escrow)
* **Trang**: Client Portal (Đăng tin tuyển dụng)
* **Bước 1**: Kết nối ví Client.
* **Bước 2**: Nhập các thông tin: Title, Description, Budget (USDC), Repo URL.
* **Bước 3**: Thiết lập Milestones (ví dụ: Milestone 1: 50 USDC, Milestone 2: 50 USDC).
* **Bước 4**: Click button "Post Gig & Lock Escrow".
* **Bước 5**: Xác nhận giao dịch phê duyệt USDC và giao dịch khởi tạo trên MetaMask.
* **Kết quả mong đợi**: Modal hiển thị "Job Posted Successfully", Gig mới hiển thị ở trạng thái `Created`.

---

### Flow 7: Join a Job (Freelancer Staking)
* **Trang**: Freelancer Portal (Tìm kiếm việc làm)
* **Bước 1**: Đổi sang tài khoản ví MetaMask Freelancer.
* **Bước 2**: Click chọn công việc vừa tạo ở Flow 6 và click "Join Gig".
* **Bước 3**: Xác nhận giao dịch Approve và Join trên ví MetaMask (đặt cọc thế chấp).
* **Kết quả mong đợi**: Trạng thái công việc chuyển sang `Active`.

---

### Flow 8: Submit Work (Freelancer Submission)
* **Trang**: Freelancer Portal (Quản lý việc làm)
* **Bước 1**: Chọn công việc đang `Active`.
* **Bước 2**: Nhập liên kết hoặc mã băm sản phẩm vào ô "Deliverable URL/Hash".
* **Bước 3**: Click button "Submit Work & Notify Client".
* **Kết quả mong đợi**: Thông báo gửi bài thành công, hệ thống ghi nhận sản phẩm của Freelancer.

---

### Flow 9: Approve Milestone & Release Funds (Client Manual Release)
* **Trang**: Client Portal (Quản lý dự án)
* **Bước 1**: Đổi sang tài khoản ví MetaMask Client.
* **Bước 2**: Chọn công việc đang `Active` có sản phẩm gửi từ Freelancer.
* **Bước 3**: Click button "Approve Milestone & Release Funds".
* **Bước 4**: Xác nhận giao dịch giải ngân trên ví MetaMask.
* **Kết quả mong đợi**: Milestone chuyển sang trạng thái đã thanh toán, tiền chuyển về ví Freelancer.

---

### Flow 10: Raise Dispute (Dispute Escrow)
* **Trang**: Client Portal hoặc Freelancer Portal
* **Bước 1**: Đảm bảo công việc đang ở trạng thái `Active`.
* **Bước 2**: Click button "Raise Dispute".
* **Bước 3**: Nhập lý do tranh chấp và xác nhận giao dịch trên ví MetaMask.
* **Kết quả mong đợi**: Trạng thái công việc chuyển sang `Disputed`.

---

### Flow 11: Vote on Dispute (Juror Arbitrates)
* **Trang**: Jury Board
* **Bước 1**: Kết nối ví MetaMask của Juror.
* **Bước 2**: Tìm vụ tranh chấp vừa tạo ở Flow 10.
* **Bước 3**: Chọn một trong các phương án: "Client Wins", "Freelancer Wins", hoặc "Split 50/50".
* **Bước 4**: Click button "Cast Vote" và xác nhận giao dịch trên ví MetaMask.
* **Kết quả mong đợi**: Số lượt bình chọn cho phương án đó tăng lên 1 đơn vị.

---

### Flow 12: Resolve Dispute (Dispute Ruling Execution)
* **Trang**: Jury Board
* **Bước 1**: Đảm bảo vụ tranh chấp đã thu thập đủ số phiếu hoặc kết thúc thời gian bình chọn.
* **Bước 2**: Click button "Resolve & Settle Dispute".
* **Bước 3**: Xác nhận giao dịch giải quyết trên ví MetaMask.
* **Kết quả mong đợi**: Trạng thái công việc chuyển sang `Resolved`, quỹ ký quỹ tự động phân chia theo phán quyết.

---

### Flow 13: Create & Fund Agentic Task (ERC-8183 Escrow)
* **Trang**: AI Agent Escrow (mục Client Control Center)
* **Bước 1**: Kết nối ví Client.
* **Bước 2**: Nhập thông tin: Provider (ví Agent), Evaluator (ví Oracle), Amount (USDC), Expiry.
* **Bước 3**: Click button "Create & Fund Agent Escrow".
* **Bước 4**: Xác nhận giao dịch ký quỹ trên ví MetaMask.
* **Kết quả mong đợi**: Nhiệm vụ mới được tạo với trạng thái `Funded`.

---

### Flow 14: AI Agent Commits to Task (Agent Staking)
* **Trang**: AI Agent Escrow (mục Freelancer/Agent Center)
* **Bước 1**: Đổi sang tài khoản ví MetaMask của Agent.
* **Bước 2**: Click button "AI Agent Commit".
* **Bước 3**: Ký xác nhận giao dịch thế chấp trên ví MetaMask.
* **Kết quả mong đợi**: Trạng thái nhiệm vụ chuyển sang `Active`.

---

### Flow 15: Oracle Evaluates & Submits Work (Oracle Verification)
* **Trang**: AI Agent Escrow (mục Oracle Verification Board)
* **Bước 1**: Đổi sang tài khoản ví MetaMask của Oracle.
* **Bước 2**: Click chọn "Verify Deliverables".
* **Bước 3**: Chọn kết quả đánh giá (ví dụ: `Passed` hoặc `Failed`) và click "Submit Decision".
* **Bước 4**: Xác nhận giao dịch trên ví MetaMask.
* **Kết quả mong đợi**: Tiền tự động giải phóng gửi về cho ví Agent hoặc hoàn trả lại cho Client tùy theo quyết định.

---

### Flow 16: StableFX Swap (USDC ↔ EURC Swap)
* **Trang**: App Kit Center (mục StableFX Exchange)
* **Bước 1**: Kết nối ví MetaMask của bất kỳ người dùng nào.
* **Bước 2**: Nhập số lượng USDC muốn quy đổi (ví dụ: `10` USDC).
* **Bước 3**: Chờ hệ thống hiển thị tỷ giá và click button "Swap USDC to EURC".
* **Bước 4**: Xác nhận giao dịch hoán đổi trên ví MetaMask.
* **Kết quả mong đợi**: Số dư USDC giảm, số dư EURC tăng lên trên ví MetaMask.

---

### Flow 17: Cross-Chain CCTP Bridge (Bridge USDC from Base Sepolia to Arc Testnet)
* **Trang**: App Kit Center (mục CCTP Cross-Chain Bridge)
* **Bước 1**: Đổi mạng ví MetaMask sang **Base Sepolia**.
* **Bước 2**: Nhập số lượng USDC muốn chuyển cầu và click button "Initiate Bridge".
* **Bước 3**: Xác nhận giao dịch ghi nhận Burn USDC trên ví MetaMask.
* **Bước 4**: Chờ hệ thống thực hiện xác thực chữ ký (Attestation) và Mint USDC trên Arc Testnet.
* **Kết quả mong đợi**: Các bước trạng thái hiển thị tích xanh lá cây, thông báo thành công và số dư trên ví ở Arc Testnet tăng lên.
