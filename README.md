# mapshort_omunhub.com

地図でエリアを絞り、飲食店と関連するYouTube Shortsを見つけるWebアプリです。

## 開発

```bash
npm install
npm run dev
```

本番ビルドは `npm run build` で `dist/` に出力されます。Google Maps埋め込みとブラウザのGeolocation APIを利用し、動画カードからYouTube動画をアプリ内で再生します。現在地機能はHTTPS環境（本番のCloudflare Pagesなど）と、ブラウザの位置情報許可が必要です。

Google Maps上の飲食店マーカーをクリックしてアプリ内の店舗詳細を開くには、Google CloudでMaps JavaScript APIを有効化し、`.env` に `VITE_GOOGLE_MAPS_API_KEY` を設定してください。Cloudflare Pagesでは同名の環境変数を設定して再デプロイします。キーがない場合は、店舗一覧と検索は利用できますが、Google Mapsのインタラクティブな店舗クリックは無効になります。