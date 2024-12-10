import React from 'react';
import { ArrowLeft, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { Vehicle, Symptom } from '../types';
import { getDiagnosticResults } from '../utils/diagnostics';

interface DiagnosticResultProps {
  vehicle: Vehicle;
  symptoms: Symptom[];
  onReset: () => void;
}

function DiagnosticResult({ vehicle, symptoms, onReset }: DiagnosticResultProps) {
  const results = getDiagnosticResults(vehicle, symptoms);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Diagnostic Results</h2>
          <button
            onClick={onReset}
            className="flex items-center text-gray-600 hover:text-blue-600"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
        <p className="mt-2 text-gray-600">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.severity === 'high'
                  ? 'border-red-200 bg-red-50'
                  : result.severity === 'medium'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-start">
                {result.severity === 'high' ? (
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                ) : result.severity === 'medium' ? (
                  <Wrench className="h-6 w-6 text-yellow-600 mt-1" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                )}
                <div className="ml-3">
                  <h3 className={`text-lg font-semibold ${
                    result.severity === 'high'
                      ? 'text-red-800'
                      : result.severity === 'medium'
                      ? 'text-yellow-800'
                      : 'text-green-800'
                  }`}>
                    {result.issue}
                  </h3>
                  <p className="mt-1 text-gray-600">{result.description}</p>
                  {result.solution && (
                    <div className="mt-3">
                      <h4 className="font-medium text-gray-900">Recommended Solution:</h4>
                      <p className="mt-1 text-gray-600">{result.solution}</p>
                    </div>
                  )}
                  {result.estimatedCost && (
                    <p className="mt-2 text-sm text-gray-500">
                      Estimated Cost: ${result.estimatedCost.min} - ${result.estimatedCost.max}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiagnosticResult;
