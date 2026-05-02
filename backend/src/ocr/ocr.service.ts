import { Injectable, Logger } from '@nestjs/common';
import FormData from 'form-data';
import axios from 'axios';
import { Readable } from 'stream'; // 👈 ADD THIS

@Injectable()
export class OcrService {
    private readonly logger = new Logger(OcrService.name);
    private readonly mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5000';

    async extractFromImage(imageBuffer: Buffer, filename: string): Promise<{ text: string; parsedRows: Record<string, string>[] }> {
        try {
            this.logger.log(`Sending file to OCR: ${filename} (${imageBuffer.length} bytes) → ${this.mlServiceUrl}/ocr/extract`);

            const formData = new FormData();

            // 👈 FIX: Convert Buffer to Readable stream
            const stream = Readable.from(imageBuffer);
            formData.append('file', stream, {
                filename,
                contentType: 'image/jpeg' // 👈 Optional: specify content type
            });

            const response = await axios.post(`${this.mlServiceUrl}/ocr/extract`, formData, {
                headers: formData.getHeaders(),
                timeout: 30000,
                // 👈 Optional: Add response type for large responses
                responseType: 'json',
            });

            this.logger.log(`OCR response: ${response.data?.parsedRows?.length ?? 0} rows, ${response.data?.text?.length ?? 0} chars`);
            return response.data;
        } catch (error: any) { // 👈 Add type for better error handling
            this.logger.error(`OCR extraction failed: ${error?.message || error}`);
            if (error?.response?.data) {
                this.logger.error(`OCR error detail: ${JSON.stringify(error.response.data)}`);
            }
            return { text: '', parsedRows: [] };
        }
    }
}