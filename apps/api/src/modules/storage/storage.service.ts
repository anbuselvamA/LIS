import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created storage directory at ${this.uploadDir}`);
    }
  }

  async saveFile(filename: string, data: Buffer | string, subFolder = ''): Promise<string> {
    const dir = path.join(this.uploadDir, subFolder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, filename);
    await fs.promises.writeFile(filePath, data);
    this.logger.log(`Saved file: ${filePath}`);
    return filePath;
  }

  async getFile(filename: string, subFolder = ''): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, subFolder, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.promises.readFile(filePath);
  }
}
