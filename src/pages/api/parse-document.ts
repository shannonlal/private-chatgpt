import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import * as XLSX from 'xlsx';
import csvParser from 'csv-parser';
import markdownit from 'markdown-it';

const md = new markdownit(); // Markdown parser

export const config = {
  api: {
    bodyParser: false, // Disable default body parser to use formidable
  },
};

type ParseDocumentResponse =
  | { extractedText: string }
  | { error: { message: string; type: string } };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ParseDocumentResponse>
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: { message: 'Method Not Allowed', type: 'method_not_allowed' } });
  }

  try {
    // Parse form data with formidable (only expecting 'documents' field)
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB file size limit
      keepExtensions: true,
    });

    const parsedForm = await new Promise<{ files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ files });
      });
    });

    const { files } = parsedForm;
    const uploadedDocuments = files.documents as formidable.File[] | formidable.File | undefined;
    let documentTextContent = '';

    if (!uploadedDocuments) {
      return res
        .status(400)
        .json({ error: { message: 'No documents uploaded', type: 'validation_error' } });
    }

    const filesArray = Array.isArray(uploadedDocuments) ? uploadedDocuments : [uploadedDocuments];

    for (const fileData of filesArray) {
      const file = fileData as formidable.File;
      const fileType = file.mimetype || '';
      const filePath = file.filepath;

      try {
        const fileContentBuffer = fs.readFileSync(filePath);
        let text = '';

        if (fileType.includes('pdf')) {
          const pdfData = await pdfParse(fileContentBuffer);
          text += pdfData.text;
        } else if (fileType.includes('csv')) {
          const csvData: Record<string, string>[] = [];
          await new Promise<void>((resolve, reject) => {
            fs.createReadStream(filePath)
              .pipe(csvParser())
              .on('data', row => csvData.push(row))
              .on('end', resolve)
              .on('error', reject);
          });
          text += 'CSV Content:\n' + JSON.stringify(csvData, null, 2);
        } else if (
          fileType.includes('spreadsheet') ||
          fileType.includes('excel') ||
          fileType.includes('xls')
        ) {
          const workbook = XLSX.read(fileContentBuffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          text += 'Excel Content:\n' + XLSX.utils.sheet_to_txt(worksheet);
        } else if (fileType === 'text/plain' || fileType === 'text/markdown') {
          text += fileContentBuffer.toString('utf-8');
          if (fileType === 'text/markdown') {
            text = 'Markdown Content:\n' + md.render(text);
          } else {
            text = 'Text Content:\n' + text;
          }
        } else if (
          fileType.includes('msword') ||
          fileType.includes('officedocument.wordprocessingml.document')
        ) {
          text +=
            'Word Document Uploaded. Basic text extraction for Word documents is not implemented in this example.';
        } else {
          return res
            .status(400)
            .json({ error: { message: 'Unsupported file type', type: 'unsupported_file_type' } });
        }
        documentTextContent += text + '\n---\n';
      } finally {
        // Clean up temporary file
        fs.unlinkSync(filePath);
      }
    }

    return res.status(200).json({ extractedText: documentTextContent });
  } catch (error) {
    console.error('File Parsing Error:', error);
    return res.status(500).json({
      error: { message: 'File parsing failed', type: 'file_parsing_error' },
    });
  }
}
