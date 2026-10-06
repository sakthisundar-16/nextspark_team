import QRCode from 'qrcode';

export interface CertificateData {
  certificateId: string;
  issuedToName: string;
  eventName: string;
  achievement: string;
  departmentName: string;
  institutionName?: string;
  issueDate: string;
  signerName?: string;
  signerDesignation?: string;
}

export async function generateQrCodeUrl(certificateId: string, baseUrl = 'http://localhost:5173'): Promise<string> {
  const verifyUrl = `${baseUrl}/verify/${certificateId}`;
  return await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#1e293b',
      light: '#ffffff'
    }
  });
}

export function formatCertificateId(deptCode: string, sequence: number, year = 2026): string {
  const pad = String(sequence).padStart(6, '0');
  return `EXN-${year}-${deptCode.toUpperCase()}-${pad}`;
}
