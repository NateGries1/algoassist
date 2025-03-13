# AlgoAssist

## About
AlgoAssist is a project continued from [LC Pilot](https://github.com/j1yl/lcpilot). Algo Assist is a technical interview practice tool for computer science/aspiring software engineers. It aims to assist users with preparing for technical coding interviews by allowing users to write and run code, while responding to our AI interviewer.

## Features
- In browser code editor w/ syntax highlighting
- Firebase firestore
- Dynamic problem rendering
- Markdown parsing
- Runnable code with endpoint /api/run
- AI interviewer with prompt endpoint /api/ai

## The Way Forward
- [ ] Mobile support?
- [ ] Better markdown parsing
- [ ] Testcase visualization (trees, linked lists, etc)
- [ ] Save submissions per user
- [ ] Improve code running structure
- [ ] Secure api endpoints with token exchange
- [ ] Add more language support

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
