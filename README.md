# Theme You - AI Color & Mood Advisor

A personalized AI-powered interior design assistant that creates custom color palettes and decor ideas based on your personality, wellness goals, Vastu principles, or modern trends.

## 🌟 Features

- **AI-Powered Color Analysis**: Get personalized color palettes based on your preferences
- **Multiple Transformation Types**: Personality-based, wellness-focused, Vastu-aligned, or trend-based designs
- **Interactive Quiz**: Step-by-step questionnaire to understand your needs
- **Visual Demos**: Before/after room transformations with mood-based suggestions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Live Demo

Visit the live website: [Theme You - AI Color & Mood Advisor](https://[your-username].github.io/BOT/)

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Generative AI
- **Animations**: GSAP, Animate.css
- **UI Components**: Swiper.js, Particles.js

## 📦 Installation & Setup

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/BOT.git
   cd BOT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_KEY=your_google_genai_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The website will be available at `http://localhost:3000`

## 🏗️ Build & Deployment

### Local Build

To build the project for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages:

1. **Push to main branch**: The GitHub Actions workflow will automatically build and deploy your site
2. **Manual deployment**: You can also manually trigger the workflow from the Actions tab

### Deployment Configuration

- **Base URL**: `/BOT/` (matches repository name)
- **Build Output**: `dist/` directory
- **Deployment Branch**: `gh-pages` (automatically created)

## 📁 Project Structure

```
BOT/
├── index.html              # Main HTML file
├── index.css               # Main stylesheet
├── index.tsx               # TypeScript logic
├── vite.config.ts          # Vite configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .github/workflows/      # GitHub Actions workflows
├── imgs/                   # Image assets
└── dist/                   # Build output (generated)
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to Cloudflare Workers (if configured)

## 🌐 Pages

- **Home** (`index.html`) - Landing page with interactive quiz
- **About** (`about.html`) - Information about Theme You
- **Services** (`services.html`) - Available services
- **Contact** (`contact.html`) - Contact information
- **Live Support** (`live-support.html`) - Real-time support
- **Quick Query** (`quick-query.html`) - Quick questions
- **Quiz** (`quiz.html`) - Interactive design quiz

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/[your-username]/BOT/issues) page
2. Create a new issue with detailed information
3. Contact us through the website's contact form

## 🔄 Updates

The website automatically deploys when changes are pushed to the main branch. Check the [Actions](https://github.com/[your-username]/BOT/actions) tab to monitor deployment status.

---

**Theme You** - Designed for your soul, not just your walls. 🎨✨ 