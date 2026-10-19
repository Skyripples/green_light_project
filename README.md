# Green Light Project

一個以瀏覽器呈現的智慧交通號誌概念模擬器，用來比較傳統固定週期號誌（Fixed Timing）與規則式自適應號誌（Adaptive Traffic Control）在不同車流情境下的運作差異。

> 本專案是視覺化概念驗證，不是實際道路交通號誌控制系統。

## 專案概念

一般道路經常出現某個方向已經沒有車輛，號誌卻仍維持綠燈，而另一方向的車輛只能繼續等待的情況。

Green Light Project 透過單一路口動畫模擬這個問題，並觀察號誌若能根據即時排隊狀況調整綠燈時間，是否能減少平均等待時間、最長等待時間與無效怠速。

目前提供兩種控制方式：

- **固定週期控制**：不考慮即時車流，每個方向固定維持 30 秒綠燈及 3 秒黃燈。
- **自適應控制**：根據南北向與東西向的排隊數量，以公開、容易理解的規則調整綠燈時間。

自適應模式使用的是 Rule-Based Algorithm，不宣稱為人工智慧或機器學習。

## 目前功能

### 路口與車輛模擬

- 單一俯視十字路口
- 南往北、北往南、東往西及西往東四個直行方向
- 車輛從畫面外隨機生成並駛離路口
- 紅燈及黃燈時在停止線前停車
- 前方有車輛時維持安全間距
- 綠燈時依序通過路口
- 車輛離開 Canvas 後自動清除

### 號誌控制

- Fixed Timing 固定週期模式
- Adaptive 自適應模式
- 綠燈、黃燈、紅燈完整狀態
- 南北向與東西向互斥，避免同時出現綠燈
- 所有方向切換都會經過黃燈

自適應模式目前採用以下參數：

| 參數 | 時間 |
| --- | ---: |
| 最短綠燈 | 10 秒 |
| 基準綠燈 | 30 秒 |
| 最長綠燈 | 60 秒 |
| 黃燈 | 3 秒 |

自適應控制會在最短綠燈後判斷雙方排隊需求：目前方向沒有車、對向有車，或對向排隊明顯較多時，可提早切換；目前方向需求明顯較高時，則可延長綠燈，但不超過 60 秒。

### 車流情境

- Low：低流量
- Medium：中流量
- High：高流量
- Unbalanced：南北向高流量、東西向低流量

Unbalanced 情境可用來觀察自適應控制面對不均衡車流時的反應。

### 操作功能

- Start、Pause、Resume、Reset
- 1×、2×、4× 模擬速度
- 不重新載入頁面即可切換 Fixed 與 Adaptive 模式
- English／繁體中文即時切換
- 自動偵測瀏覽器語言
- 使用瀏覽器儲存空間記住語言選擇
- 桌面與行動裝置響應式版面

### 即時統計

- 模擬經過時間
- 已生成車輛數
- 已通過車輛數
- 目前等待車輛數
- 平均等待時間
- 最長等待時間
- 全部停止車輛的累積怠速時間
- 南北向與東西向排隊數量
- 目前號誌狀態與階段剩餘秒數

## 技術架構

- HTML5
- CSS3
- Vanilla JavaScript（ES Modules）
- HTML Canvas
- `requestAnimationFrame()` 與 delta time 動畫更新

專案沒有使用前端框架、後端服務、npm 套件或建置系統，可直接部署至 GitHub Pages。

## 專案結構

```text
green_light_project/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── i18n.js
│   ├── simulation.js
│   ├── traffic-light.js
│   ├── vehicle.js
│   ├── controllers.js
│   └── statistics.js
├── README.md
└── .gitignore
```

各模組職責：

- `main.js`：DOM、操作按鈕、模式切換及介面更新
- `i18n.js`：英文與繁體中文翻譯及語言偏好記憶
- `simulation.js`：動畫迴圈、道路繪製、車流生成與車輛管理
- `traffic-light.js`：號誌狀態、倒數及方向切換
- `vehicle.js`：車輛移動、停止、安全距離與 Canvas 繪製
- `controllers.js`：固定週期與規則式自適應控制演算法
- `statistics.js`：等待時間、排隊數量與通行統計

## 本機執行

JavaScript 使用 ES Modules，建議透過本機 HTTP Server 執行，不要直接以 `file://` 開啟 `index.html`。

若已安裝 Python，可在專案目錄執行：

```bash
python -m http.server 8000
```

接著開啟：

```text
http://localhost:8000
```

## 部署至 GitHub Pages

所有檔案皆使用相對路徑，可直接從 repository 根目錄部署：

1. 進入 GitHub repository 的 **Settings → Pages**。
2. 在 **Build and deployment** 選擇 **Deploy from a branch**。
3. 選擇預設分支及根目錄 `/`。
4. 儲存後等待 GitHub Pages 完成部署。

## 已知限制

- 目前僅模擬單一路口。
- 車輛僅能直行，尚未支援轉彎及行人號誌。
- V1.0.0 尚未同時執行兩套模擬進行並排比較。
- 尚未提供統計圖表、資料匯入或機器學習模型。
- 模擬結果用於概念展示，不代表真實道路工程評估。

## Roadmap

### V1.x

- Fixed 與 Adaptive 並排比較
- 更多交通情境
- 統計圖表

### V2.0.0

- 多路口模擬

### V3.0.0

- 匯入 JSON／CSV 車流資料

### V4.0.0

- 最佳化演算法與機器學習實驗

## 版本紀錄

- **V1.0.0**：初始公開版本
- 後續版本的詳細變更請參閱 [GitHub Releases](../../releases)。

## 授權

目前尚未指定開源授權。未經授權前，著作權仍由專案作者保留。
