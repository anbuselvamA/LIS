import { Sample } from './sample.types';

export type ResultStatus = 'PENDING' | 'ENTERED' | 'VERIFIED';
export type AbnormalFlag = 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW';
export type EntryMode = 'MANUAL' | 'AUTOMATIC';

export interface Result {
  id: string;
  sampleId: string;
  sample?: Sample;
  parameterCode: string;
  parameterName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  abnormalFlag?: AbnormalFlag;
  interpretation?: string;
  entryMode?: EntryMode;
  remarks?: string;
  resultStatus: ResultStatus; // matches backend schema field name
  enteredBy?: string;
  enteredAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateResultDto {
  sampleId: string;
  parameterCode: string;
  parameterName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  abnormalFlag?: AbnormalFlag;
  interpretation?: string;
  entryMode?: EntryMode;
  remarks?: string;
}
