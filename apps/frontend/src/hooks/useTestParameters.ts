import * as React from 'react';

/**
 * Mock laboratory parameters utility.
 * In a real-world scenario, this would come from the backend's ResultParameter table.
 * Since the backend lacks this schema, we mock standard structures based on the test name.
 */

export interface TestParameter {
  parameterCode: string;
  parameterName: string;
  unit: string;
  referenceRange: string;
  type: 'numeric' | 'text' | 'dropdown';
  options?: string[]; // For dropdown types (e.g., Blood Group)
}

const mockParameters: Record<string, TestParameter[]> = {
  'CBC': [
    { parameterCode: 'WBC', parameterName: 'White Blood Cell Count (WBC)', unit: 'x10^3/µL', referenceRange: '4.5 - 11.0', type: 'numeric' },
    { parameterCode: 'RBC', parameterName: 'Red Blood Cell Count (RBC)', unit: 'x10^6/µL', referenceRange: '4.7 - 6.1', type: 'numeric' },
    { parameterCode: 'HGB', parameterName: 'Hemoglobin (HGB)', unit: 'g/dL', referenceRange: '13.8 - 17.2', type: 'numeric' },
    { parameterCode: 'HCT', parameterName: 'Hematocrit (HCT)', unit: '%', referenceRange: '40.7 - 50.3', type: 'numeric' },
    { parameterCode: 'PLT', parameterName: 'Platelet Count (PLT)', unit: 'x10^3/µL', referenceRange: '150 - 450', type: 'numeric' },
  ],
  'LFT': [
    { parameterCode: 'ALT', parameterName: 'Alanine Aminotransferase (ALT)', unit: 'U/L', referenceRange: '7 - 55', type: 'numeric' },
    { parameterCode: 'AST', parameterName: 'Aspartate Aminotransferase (AST)', unit: 'U/L', referenceRange: '8 - 48', type: 'numeric' },
    { parameterCode: 'ALP', parameterName: 'Alkaline Phosphatase (ALP)', unit: 'U/L', referenceRange: '40 - 129', type: 'numeric' },
    { parameterCode: 'TBIL', parameterName: 'Total Bilirubin', unit: 'mg/dL', referenceRange: '0.1 - 1.2', type: 'numeric' },
  ],
  'KFT': [
    { parameterCode: 'UREA', parameterName: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', referenceRange: '7 - 20', type: 'numeric' },
    { parameterCode: 'CREAT', parameterName: 'Creatinine', unit: 'mg/dL', referenceRange: '0.8 - 1.2', type: 'numeric' },
    { parameterCode: 'URIC', parameterName: 'Uric Acid', unit: 'mg/dL', referenceRange: '3.4 - 7.0', type: 'numeric' },
  ],
  'LIPID': [
    { parameterCode: 'CHOL', parameterName: 'Total Cholesterol', unit: 'mg/dL', referenceRange: '< 200', type: 'numeric' },
    { parameterCode: 'HDL', parameterName: 'HDL Cholesterol', unit: 'mg/dL', referenceRange: '> 40', type: 'numeric' },
    { parameterCode: 'LDL', parameterName: 'LDL Cholesterol', unit: 'mg/dL', referenceRange: '< 100', type: 'numeric' },
    { parameterCode: 'TRIG', parameterName: 'Triglycerides', unit: 'mg/dL', referenceRange: '< 150', type: 'numeric' },
  ],
  'HBA1C': [
    { parameterCode: 'HBA1C', parameterName: 'HbA1c', unit: '%', referenceRange: '4.0 - 5.6', type: 'numeric' },
    { parameterCode: 'EAG', parameterName: 'Estimated Average Glucose', unit: 'mg/dL', referenceRange: '70 - 114', type: 'numeric' },
  ],
};

const defaultParameters: TestParameter[] = [
  { parameterCode: 'RES1', parameterName: 'Result', unit: '', referenceRange: '', type: 'text' },
];

export const useTestParameters = () => {
  const getParametersForTest = React.useCallback((testNameSnapshot: string | undefined): TestParameter[] => {
    if (!testNameSnapshot) return defaultParameters;

    const nameUpper = testNameSnapshot.toUpperCase();
    
    // Attempt fuzzy matching based on common test names
    if (nameUpper.includes('CBC') || nameUpper.includes('COMPLETE BLOOD COUNT')) return mockParameters['CBC'];
    if (nameUpper.includes('LFT') || nameUpper.includes('LIVER FUNCTION')) return mockParameters['LFT'];
    if (nameUpper.includes('KFT') || nameUpper.includes('KIDNEY FUNCTION') || nameUpper.includes('RFT')) return mockParameters['KFT'];
    if (nameUpper.includes('LIPID')) return mockParameters['LIPID'];
    if (nameUpper.includes('HBA1C') || nameUpper.includes('GLYCOSYLATED')) return mockParameters['HBA1C'];

    // Fallback if we don't have mock data for this test
    return [
      { 
        parameterCode: 'RESULT', 
        parameterName: testNameSnapshot, 
        unit: 'N/A', 
        referenceRange: 'N/A', 
        type: 'text' 
      }
    ];
  }, []);

  return { getParametersForTest };
};
