

# AbonoShare

High-trust bill splitting with mandatory receipt verification and settlement audit trails. Built with Next.js 15 and powered by Google Gemini AI.

## Features

- **Receipt Verification** — Upload receipts to validate expenses before splitting
- **Audit Trails** — Every settlement is tracked with a full history log
- **Group Management** — Organize expenses across multiple groups and contacts
- **QR Code Payments** — Share payment QR codes directly from your profile
- **Dark / Light Mode** — Comfortable UI in any environment
- **AI-Powered Parsing** — Gemini AI extracts line items from receipt images automatically

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Firebase](https://firebase.google.com/)
- [Google Gemini AI](https://ai.google.dev/)

## Getting Started

**Prerequisites:** Node.js 18+

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/abono-share.git
   cd abono-share
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set your Gemini API key in [.env.local](.env.local):
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## View in AI Studio

[Open in Google AI Studio](https://ai.studio/apps/faef301a-b05c-4bda-a82a-d8c5fda77073)

## Contributing

Contributions are welcome! Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating, and open an issue or pull request to propose changes.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
