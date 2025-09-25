import React, { useState, useMemo, useCallback } from "react";

interface RecognitionMetadata {
  recognizer_name: string;
  recognizer_identifier: string;
}

interface GuardrailEntity {
  end: number;
  score: number;
  start: number;
  entity_type: string;
  analysis_explanation: string | null;
  recognition_metadata: RecognitionMetadata;
}

interface MaskedEntityCount {
  [key: string]: number;
}

type GuardrailResponse =
  | GuardrailEntity[]
  | Record<string, unknown>
  | string
  | null
  | undefined

type AssessmentDetails = unknown | unknown[];

interface GuardrailInformation {
  duration?: number;
  end_time?: number;
  start_time?: number;
  guardrail_mode?: string;
  guardrail_name?: string;
  guardrail_status?: string;
  guardrail_response?: GuardrailResponse;
  masked_entity_count?: MaskedEntityCount;
  detected?: boolean;
  // New fields from enhanced backend logging
  assessment_details?: AssessmentDetails;
  guardrail_coverage?: {
    textCharacters?: { guarded: number; total: number };
    images?: { guarded: number; total: number };
  };
  guardrail_outputs?: { text: string }[];
  guardrail_usage?: Record<string, number>;
  action_reason?: string;
}

interface GuardrailViewerProps {
  data: GuardrailInformation;
}

const GuardrailViewerComponent = React.memo(({ data }: GuardrailViewerProps) => {
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const [entityListExpanded, setEntityListExpanded] = useState(true);
  const [expandedEntities, setExpandedEntities] = useState<Record<number, boolean>>({});

  // Memoize computed values to prevent unnecessary re-renders
  const guardrailResponse = useMemo(() => data.guardrail_response, [data.guardrail_response]);
  const guardrailEntities = useMemo(() => {
    return Array.isArray(guardrailResponse)
      ? (guardrailResponse as GuardrailEntity[])
      : null;
  }, [guardrailResponse]);

  const hasStructuredResponse = useMemo(() => {
    return guardrailResponse !== null &&
      typeof guardrailResponse === "object" &&
      !Array.isArray(guardrailResponse);
  }, [guardrailResponse]);

  const detectedStatus = useMemo(() => {
    return typeof data.detected === "boolean"
      ? data.detected
      : guardrailEntities
        ? guardrailEntities.length > 0
        : undefined;
  }, [data.detected, guardrailEntities]);

  // Calculate total masked entities
  const totalMaskedEntities = useMemo(() => {
    return data.masked_entity_count
      ? Object.values(data.masked_entity_count).reduce((sum, count) => sum + count, 0)
      : 0;
  }, [data.masked_entity_count]);

  const assessmentDetails = data.assessment_details;
  const showAssessmentDetails = Array.isArray(assessmentDetails)
    ? assessmentDetails.length > 0
    : Boolean(assessmentDetails);

  const formatTime = useCallback((timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }, []);

  const formatOptionalTime = useCallback((timestamp?: number): string => {
    if (typeof timestamp !== "number") {
      return "-";
    }
    return formatTime(timestamp);
  }, [formatTime]);

  const toggleEntity = useCallback((index: number) => {
    setExpandedEntities(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 0.8) return "text-green-600";
    return "text-yellow-600";
  }, []);

  const formatAssessmentDetails = useCallback((details: AssessmentDetails | undefined): string => {
    if (typeof details === "undefined") {
      return "";
    }
    try {
      return JSON.stringify(details, null, 2);
    } catch (error) {
      return `Error displaying assessment details: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }, []);

  const toggleSectionExpanded = useCallback(() => {
    setSectionExpanded(!sectionExpanded);
  }, [sectionExpanded]);

  const toggleEntityListExpanded = useCallback(() => {
    setEntityListExpanded(!entityListExpanded);
  }, [entityListExpanded]);

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div
        className="flex justify-between items-center p-4 border-b cursor-pointer hover:bg-gray-50"
        onClick={toggleSectionExpanded}
      >
        <div className="flex items-center">
          <svg 
            className={`w-5 h-5 mr-2 text-gray-600 transition-transform ${sectionExpanded ? 'transform rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className="text-lg font-medium">Guardrail Information</h3>
          {data.guardrail_status && (
            <span className={`ml-3 px-2 py-1 rounded-md text-xs font-medium inline-block ${
              data.guardrail_status === "success"
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {data.guardrail_status}
            </span>
          )}
          {typeof detectedStatus === "boolean" && (
            <span className={`ml-3 px-2 py-1 rounded-md text-xs font-medium inline-block ${
              detectedStatus ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {detectedStatus ? 'Detection flagged' : 'No detections'}
            </span>
          )}
          {totalMaskedEntities > 0 && (
            <span className="ml-3 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
              {totalMaskedEntities} masked {totalMaskedEntities === 1 ? 'entity' : 'entities'}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">{sectionExpanded ? 'Click to collapse' : 'Click to expand'}</span>
      </div>
      
      {sectionExpanded && (
        <div className="p-4">
          <div className="bg-white rounded-lg border p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-1/3">Guardrail Name:</span>
                  <span className="font-mono">{data.guardrail_name || '-'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-1/3">Mode:</span>
                  <span className="font-mono">{data.guardrail_mode || '-'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-1/3">Status:</span>
                  {data.guardrail_status ? (
                    <span className={`px-2 py-1 rounded-md text-xs font-medium inline-block ${
                      data.guardrail_status === "success"
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {data.guardrail_status}
                    </span>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-1/3">Start Time:</span>
                  <span>{formatOptionalTime(data.start_time)}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-1/3">End Time:</span>
                  <span>{formatOptionalTime(data.end_time)}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-1/3">Duration:</span>
                  <span>{typeof data.duration === "number" ? `${data.duration.toFixed(4)}s` : '-'}</span>
                </div>
              </div>
            </div>

            {/* Action Reason */}
            {data.action_reason && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex">
                  <span className="font-medium w-1/4">Action Reason:</span>
                  <span className="text-orange-600 font-medium">{data.action_reason}</span>
                </div>
              </div>
            )}

            {/* Guardrail Coverage */}
            {data.guardrail_coverage && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Guardrail Coverage</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {data.guardrail_coverage?.textCharacters && (
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Text Characters:</span>
                      <div className="text-xs text-gray-600">
                        Guarded: {data.guardrail_coverage.textCharacters.guarded} /
                        Total: {data.guardrail_coverage.textCharacters.total}
                      </div>
                    </div>
                  )}
                  {data.guardrail_coverage?.images && (
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="font-medium">Images:</span>
                      <div className="text-xs text-gray-600">
                        Guarded: {data.guardrail_coverage.images.guarded} /
                        Total: {data.guardrail_coverage.images.total}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Guardrail Usage */}
            {data.guardrail_usage && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Usage Statistics</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.guardrail_usage)
                    .filter(([, value]) => value !== undefined && value !== null && typeof value === 'number')
                    .map(([key, value]) => (
                      <span key={key} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {value}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Masked Entity Summary */}
            {(data.masked_entity_count && Object.keys(data.masked_entity_count).length > 0) && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Masked Entity Summary</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.masked_entity_count).map(([entityType, count]) => (
                    <span key={entityType} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                      {entityType}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Assessment Details Section */}
          {showAssessmentDetails && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Assessment Details</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <pre className="text-xs overflow-auto max-h-64 text-gray-800">
                  {formatAssessmentDetails(assessmentDetails)}
                </pre>
              </div>
            </div>
          )}

          {/* Guardrail Outputs Section */}
          {(data.guardrail_outputs && Array.isArray(data.guardrail_outputs) && data.guardrail_outputs.length > 0) && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Guardrail Outputs</h4>
              <div className="space-y-2">
                {data.guardrail_outputs.map((output, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap text-gray-800">
                      {output.text}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected Entities Section */}
          {(guardrailEntities && guardrailEntities.length > 0) && (
            <div className="mt-4">
              <div
                className="flex items-center mb-2 cursor-pointer"
                onClick={toggleEntityListExpanded}
              >
                <svg 
                  className={`w-5 h-5 mr-2 transition-transform ${entityListExpanded ? 'transform rotate-90' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <h4 className="font-medium">Detected Entities ({guardrailEntities.length})</h4>
              </div>

              {entityListExpanded && (
                <div className="space-y-2">
                  {guardrailEntities.map((entity, index) => {
                    const isExpanded = expandedEntities[index] || false;
                    
                    return (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleEntity(index)}
                        >
                          <div className="flex items-center">
                            <svg 
                              className={`w-5 h-5 mr-2 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-medium mr-2">{entity.entity_type}</span>
                            <span className={`font-mono ${getScoreColor(entity.score)}`}>
                              Score: {entity.score.toFixed(2)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            Position: {entity.start}-{entity.end}
                          </span>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-3 border-t bg-white">
                            <div className="grid grid-cols-2 gap-4 mb-2">
                              <div className="space-y-2">
                                <div className="flex">
                                  <span className="font-medium w-1/3">Entity Type:</span>
                                  <span>{entity.entity_type}</span>
                                </div>
                                <div className="flex">
                                  <span className="font-medium w-1/3">Position:</span>
                                  <span>Characters {entity.start}-{entity.end}</span>
                                </div>
                                <div className="flex">
                                  <span className="font-medium w-1/3">Confidence:</span>
                                  <span className={getScoreColor(entity.score)}>
                                    {entity.score.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {entity.recognition_metadata && (
                                  <>
                                    <div className="flex">
                                      <span className="font-medium w-1/3">Recognizer:</span>
                                      <span>{entity.recognition_metadata.recognizer_name}</span>
                                    </div>
                                    <div className="flex overflow-hidden">
                                      <span className="font-medium w-1/3">Identifier:</span>
                                      <span className="truncate text-xs font-mono">
                                        {entity.recognition_metadata.recognizer_identifier}
                                      </span>
                                    </div>
                                  </>
                                )}
                                {entity.analysis_explanation && (
                                  <div className="flex">
                                    <span className="font-medium w-1/3">Explanation:</span>
                                    <span>{entity.analysis_explanation}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {(hasStructuredResponse && !guardrailEntities) && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Guardrail Response</h4>
              <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-md overflow-auto">
                {JSON.stringify(guardrailResponse, null, 2)}
              </pre>
            </div>
          )}

          {(typeof guardrailResponse === "string" && guardrailResponse.trim().length > 0) && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Guardrail Response</h4>
              <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-md overflow-auto">
                {guardrailResponse}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

GuardrailViewerComponent.displayName = 'GuardrailViewer';

export const GuardrailViewer = GuardrailViewerComponent;