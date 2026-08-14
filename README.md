# ROGUE PINK — ホームページ

**公開URL: https://roguepink.com**

| ページ | パス |
|---|---|
| トップ | `/` |
| 執筆 | `/writing` |
| 音楽 | `/music` |
| 制作日誌 | `/journal` |
| ブランド素材 | `/brand/`(README・ロゴ・名刺の入稿データ) |

### URL について

同じサイトに複数の入口がある。実体はVercelのプロジェクト1つで、
どの入口から入っても中身は同じ。

| URL | 状態 |
|---|---|
| `roguepink.com` | **これを人に伝える。** `www.roguepink.com` へ転送される |
| `www.roguepink.com` | 独自ドメインの本体 |
| `home-page-pnpg.vercel.app` | Vercelが自動で付けた住所。生きている。予備として残す |
| `home-page-hazel-beta.vercel.app` | **死んでいる。** 重複していたプロジェクトを削除したため |

独自ドメインを足しても `.vercel.app` の住所は消えない。
逆に、Vercelのプロジェクトを消すとその `.vercel.app` は死ぬ。
独自ドメインのほうは、契約が続く限り別の場所へ付け替えられる。

- ホスティングは **Vercel**。`main` にプッシュすると自動でデプロイされる
- 執筆記事の追加は `src/app/writing/entries.ts` の配列の**先頭**に足す。
  公開前に `npm run build` を通すこと
- **スマホのホーム画面に入れた場合(PWA)は前の画面が復元されるため、
  更新が見えないことがある。**確認は通常のブラウザか、URL に `?1` などを付けて開く

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
