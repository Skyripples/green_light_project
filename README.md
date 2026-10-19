# Green Light Project

Green Light Project V2.0.0 是一個以瀏覽器執行的多路口幹道交通模擬器，用來比較固定配時、局部自適應與協調式自適應三種規則式控制策略。

> 本專案是交通控制概念驗證與視覺化工具，不是實際道路號誌控制系統，也不使用 AI 或機器學習。

## V2.0.0：Multi-Intersection Corridor Simulation

路網由九個路口組成：

```text
                 N2
                  |
                 N1
                  |
W2 ---- W1 ---- C ---- E1 ---- E2
                  |
                 S1
                  |
                 S2
```

- 主幹道：W2 → W1 → C → E1 → E2
- 次幹道：N2 → N1 → C → S1 → S2
- 車輛只直行，不進行轉彎
- 幹道車輛通過路口後會繼續前往下一個路口，離開整個 RoadNetwork 才算完成旅次

## 控制策略

### Fixed Timing

每個路口依固定秒數切換，不讀取即時車流。主幹道一般採 EW 40 秒、支線 20 秒；次幹道路口採 NS 40 秒、橫向支線 20 秒；中央 C 路口使用獨立配時。黃燈固定 3 秒。

### Local Adaptive

每個路口只讀取自己的 NS／EW 排隊狀況：

- 最短綠燈 10 秒、基準綠燈 30 秒、最長綠燈 60 秒
- 沒有需求的綠燈方向可提早結束
- 高排隊方向可延長綠燈
- 對向紅燈等待達 60 秒時啟動 starvation protection
- 不讀取其他路口、車隊或下游資訊

### Coordinated Adaptive

在 Local Adaptive 基礎上加入幹道協調：

- EW 主幹道權重 1.5，次幹道權重 1.0
- 記錄上游放行車隊的方向、數量、來源、時間與 ETA
- ETA 10 秒內抵達且下游仍為同方向綠燈時，可延長至最長綠燈
- 下游路段容量達 80% 時降低上游放行優先權
- 支線等待達 60 秒時強制提高優先權，避免永遠沒有綠燈

## 交通情境與可重現性

- Balanced
- Morning Peak
- Evening Peak
- Main Road Heavy
- Secondary Road Heavy
- Off Peak

車流使用 seeded random generator，預設 seed 為 `42`。相同 scenario、seed 與模擬時間會產生一致的車流，方便比較不同控制策略。

## KPI

- Active Vehicles
- Completed Vehicles
- Average Travel Time
- Average Waiting Time
- Average Stops per Vehicle
- Maximum Waiting Time
- Total Idle Time
- Network Throughput
- Main Road Delay
- Secondary Road Delay
- Spillback Events
- Green Wave Success Rate

Green Wave Success 定義為：車輛進入主幹道後，連續通過至少兩個後續路口且沒有完整停止。

## 操作

- Start、Pause、Resume、Reset
- 1×、2×、4× 模擬速度
- English／繁體中文切換
- 控制策略、交通情境與 seed 可直接切換

策略、情境或 seed 變更時會重設模擬，以維持比較條件一致。

## 技術架構

- HTML5、CSS3、Vanilla JavaScript
- HTML Canvas
- ES Modules
- `requestAnimationFrame()` 與 delta time
- 無 npm dependency、後端或建置流程
- 所有資源使用相對路徑，可部署至 GitHub Pages

```text
js/
├── main.js                 # UI 與事件
├── simulation.js           # 動畫迴圈與繪圖
├── road-network.js         # 拓樸、道路、route 與路網狀態
├── intersection.js         # 單一路口狀態
├── vehicle.js              # 車輛旅次與移動
├── traffic-light.js        # 號誌狀態機
├── controllers.js          # Fixed / Local Adaptive
├── corridor-controller.js  # Coordinated Adaptive
├── scenario-config.js      # 交通情境
├── random.js               # Seeded random generator
├── statistics.js           # KPI
└── i18n.js                 # English / 繁體中文
```

## 本機執行

```bash
python -m http.server 8000
```

開啟 `http://localhost:8000`。請勿以 `file://` 直接開啟 ES Modules。

## 已知限制

- 車輛僅直行，尚未支援轉彎、行人與大眾運輸優先。
- Platoon 以短時間內通過同一路口的同方向車輛進行規則式分組。
- 道路容量與 ETA 使用簡化模型，不代表真實道路工程校估結果。
- 尚未提供三種策略同畫面同步比較或輸出 CSV。

## Roadmap

- V2.x：並排策略比較、KPI 圖表、結果匯出
- V3.0.0：匯入 JSON／CSV 車流資料
- V4.0.0：最佳化演算法與機器學習實驗
