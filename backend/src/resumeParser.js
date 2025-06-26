// backend/src/resumeParser.js
// This is the NEW, correct way
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";

export async function parseResume(file) {
    let loader;
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    if (file.type === 'application/pdf') {
        loader = new PDFLoader(blob);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        loader = new DocxLoader(blob);
    } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }

    const docs = await loader.load();
    return docs.map(doc => doc.pageContent).join('\n\n');
}