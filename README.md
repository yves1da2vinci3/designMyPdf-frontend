# Design My PDF

<div align="center">

🎨 A modern PDF design platform using HTML & Tailwind CSS

[![TypeScript](https://img.shields.io/badge/TypeScript-99%25-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

## 📄 About

Design My PDF is a platform that allows you to create beautiful, customized PDFs using HTML and Tailwind CSS. The application provides an intuitive interface where you can:

- Design your PDF using familiar web technologies (HTML & Tailwind CSS)
- Declare and use variables for dynamic content
- Preview your PDF in real-time with an accurate paper simulation
- Select different paper sizes (A1 to A6) and orientations
- Export high-quality PDFs that match exactly what you see in the preview

The platform uses iframes to simulate different paper sizes, ensuring that what you see in the preview is exactly what you'll get when you export your PDF.

## ✨ Features

- 🎨 **HTML & Tailwind Design**: Use familiar web technologies to design your PDFs
- 📊 **Dynamic Variables**: Declare variables for dynamic content in your templates
- 👁️ **Real-time Preview**: See exactly how your PDF will look as you design
- 📏 **Multiple Paper Sizes**: Choose from A1 to A6 paper sizes with portrait/landscape options
- 🖼️ **Image Support**: Upload and include images in your designs via Cloudinary
- 📊 **Chart Integration**: Add dynamic charts to your PDFs
- 🎯 **Pixel-Perfect Export**: What you see is exactly what you get

## 🛠 Tech Stack

- [Next.js](https://nextjs.org/) - React framework for production
- [Mantine](https://mantine.dev/) - Modern React component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for styling PDFs
- [TypeScript](https://www.typescriptlang.org/) - For type safety
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [Cloudinary](https://cloudinary.com/) - Cloud image storage and optimization

## 🚀 Quick Start

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yves1da2vinci3/designMyPdf-frontend.git
cd designMyPdf-frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
yarn install
\`\`\`

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the following variables:
   \`\`\`
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   \`\`\`
   - You can get these credentials by signing up at [Cloudinary](https://cloudinary.com/)

4. Start the development server:
\`\`\`bash
yarn dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## 📝 How It Works

1. **Design**: Create your PDF template using HTML and Tailwind CSS in the editor
2. **Variables**: Define variables for dynamic content that can be changed later
3. **Preview**: See a real-time preview of your PDF with accurate paper simulation
4. **Paper Size**: Select from A1 to A6 paper sizes and choose portrait or landscape orientation
5. **Export**: Generate a high-quality PDF that exactly matches your preview

## 🧪 Available Scripts

- \`yarn dev\` - Start development server
- \`yarn build\` - Build for production
- \`yarn start\` - Start production server
- \`yarn lint\` - Run linting
- \`yarn typecheck\` - Run type checking

## 🤝 Contributing

We love your input! We want to make contributing as easy and transparent as possible. Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mantine](https://mantine.dev/) for the amazing UI components
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation capabilities
- [Cloudinary](https://cloudinary.com/) for image storage and optimization
- All our [contributors](https://github.com/yourusername/designMyPdf-frontend/graphs/contributors)

---

<div align="center">
Made with ❤️ by the Design My PDF team
</div>
