import { NextApiRequest, NextApiResponse } from 'next';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { templateContent, data } = req.body;

  if (!templateContent || !data) {
    return res.status(400).json({ message: 'Missing template content or data' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const pdfs = [];

    for (const item of data) {
      const compiledTemplate = Handlebars.compile(templateContent);
      const html = compiledTemplate(item);
      await page.setContent(html);
      const pdf = await page.pdf();
      pdfs.push(pdf);
    }

    await browser.close();

    // For now, we'll just send the number of PDFs generated.
    // In a real application, you would probably want to do something else,
    // like zip the PDFs and send them back, or save them to a cloud storage provider.
    return res.status(200).json({ message: `${pdfs.length} PDFs generated successfully` });
  } catch (error) {
    return res.status(500).json({ message: 'Error generating PDFs' });
  }
}
