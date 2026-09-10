# mapshort_omunhub.com

地図でエリアを絞り、飲食店と関連するYouTube Shortsを見つけるWebアプリです。

## 開発

```bash
npm install
npm run dev
```

本番ビルドは `npm run build` で `dist/` に出力されます。Google Maps埋め込みとブラウザのGeolocation APIを利用し、動画カードからYouTube動画をアプリ内で再生します。現在地機能はHTTPS環境（本番のCloudflare Pagesなど）と、ブラウザの位置情報許可が必要です。