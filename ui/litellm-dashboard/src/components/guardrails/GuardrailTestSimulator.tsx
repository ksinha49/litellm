import React, { useState } from "react";
import { Card, Title, Text } from "@tremor/react";
import { Tabs, Alert } from "antd";
import { ExperimentOutlined, FileTextOutlined, BulbOutlined, HistoryOutlined } from "@ant-design/icons";
import ManualTestPanel from "./ManualTestPanel";
import ScenarioTestPanel from "./ScenarioTestPanel";
import TestHistoryPanel from "./TestHistoryPanel";

const { TabPane } = Tabs;

interface GuardrailTestSimulatorProps {
  guardrailId: string;
  guardrailName: string;
  guardrailType: string;
  accessToken: string | null;
}

const GuardrailTestSimulator: React.FC<GuardrailTestSimulatorProps> = ({
  guardrailId,
  guardrailName,
  guardrailType,
  accessToken,
}) => {
  const [activeTab, setActiveTab] = useState("manual");

  // Check if the guardrail type is supported for testing
  const supportedGuardrailTypes = ["bedrock", "presidio", "lakera", "lakera_v2"];
  const isSupportedForTesting = supportedGuardrailTypes.includes(guardrailType.toLowerCase());

  if (!isSupportedForTesting) {
    return (
      <Card>
        <Alert
          message="Testing Not Available"
          description={
            <>
              Testing is currently supported for: Bedrock, Presidio, and Lakera guardrails.
              <br />
              Your guardrail type: <strong>{guardrailType}</strong>
            </>
          }
          type="info"
          showIcon
          icon={<BulbOutlined />}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <Title>Guardrail Testing Simulator</Title>
          <Text className="text-gray-600">
            Test your guardrail configuration before deploying it to production. Run manual tests with custom content or
            use predefined scenarios to validate behavior.
          </Text>
        </div>

        <Alert
          message="Best Practice"
          description="Always test your guardrails with representative content before enabling them in production. This helps ensure they work as expected and avoid false positives/negatives."
          type="info"
          showIcon
          closable
          className="mb-4"
        />
      </Card>

      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
        <TabPane
          tab={
            <span>
              <ExperimentOutlined />
              Manual Test
            </span>
          }
          key="manual"
        >
          <ManualTestPanel guardrailId={guardrailId} accessToken={accessToken} />
        </TabPane>

        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              Test Scenarios
            </span>
          }
          key="scenarios"
        >
          <ScenarioTestPanel
            guardrailId={guardrailId}
            guardrailType={guardrailType}
            accessToken={accessToken}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              Test History
            </span>
          }
          key="history"
        >
          <TestHistoryPanel
            guardrailId={guardrailId}
            guardrailName={guardrailName}
            guardrailType={guardrailType}
            accessToken={accessToken}
          />
        </TabPane>
      </Tabs>

      <Card>
        <Title>About Testing</Title>
        <div className="space-y-2 text-sm text-gray-600">
          <div>
            <strong>Manual Test:</strong> Test your guardrail with custom content. Use this to validate specific use
            cases or edge cases you&apos;re concerned about.
          </div>
          <div>
            <strong>Test Scenarios:</strong> Run predefined test scenarios based on best practices:
            <ul className="list-disc pl-5 mt-1">
              <li>
                <strong>Bedrock (28 scenarios):</strong> PII detection, toxic content, prompt injection, sensitive
                topics
              </li>
              <li>
                <strong>Presidio (27 scenarios):</strong> PII detection, country-specific PII, edge cases
              </li>
              <li>
                <strong>Lakera (19 scenarios):</strong> Prompt injection, jailbreak detection, indirect injection
              </li>
            </ul>
          </div>
          <div>
            <strong>Test History:</strong> View historical test results with statistics and analytics. Track detection
            rates, average durations, and action breakdowns over time. Export test data for analysis or compliance.
          </div>
          <div>
            <strong>Understanding Results:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>
                <strong>NONE:</strong> Content passed all checks
              </li>
              <li>
                <strong>BLOCKED:</strong> Content was blocked due to policy violations
              </li>
              <li>
                <strong>ANONYMIZED:</strong> Sensitive information was masked/redacted
              </li>
              <li>
                <strong>GUARDRAIL_INTERVENED:</strong> Guardrail modified the content
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GuardrailTestSimulator;
