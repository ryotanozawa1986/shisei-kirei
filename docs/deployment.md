# デプロイ・運用メモ

## Cloudflare Pages

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 24系推奨

Cloudflareのデプロイ方式が `wrangler deploy` の場合、SPAのフォールバックはWrangler側の
`not_found_handling: "single-page-application"` を利用する。
`_redirects` の `/* /index.html 200` は無限ループ扱いになるため置かない。

## 環境変数

- `VITE_SENTRY_DSN`
  - SentryのDSN
  - 未設定の場合、Sentryは初期化されない

## Cloudflare Web Analytics

本番公開時にCloudflare DashboardからWeb Analyticsを有効化する。
Cloudflare Pages側で自動挿入または提供スニペットを利用する。

計測したいイベントは以下。

- トップページ到達
- 姿勢チェック開始
- 初回測定完了
- 再測定開始
- Before / After表示到達
- 履歴ページ到達
- 履歴削除

## 公開前チェック

- カメラ権限許可・拒否の動作確認
- iOS Safari実機確認
- Android Chrome実機確認
- PWAインストール確認
- OGP表示確認
- Sentryのイベント送信確認
- Cloudflare Web Analyticsの反映確認
